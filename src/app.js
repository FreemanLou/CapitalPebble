/**
 *
 * Capital One Client on Pebble Watch.
 * Pennapps Fall 2015
 *
 */

var ajax = require('ajax');
var UI = require('ui');
var Vector2 = require('vector2');

var apiKey = "key=4f9385baa549938840c4268f760372f6"; //Time constraint does not allow for more secure methods
var userID = "55e94a6af8d8770528e60e2b";
var userName = "Fflewddur Fflam";	// Name assigned by the API
var baseURL = "http://api.reimaginebanking.com/";

var mainMenu = {};
var accountsMenu = {};


// Set up splash screen
var splashWindow = new UI.Card({
	title: "Capital One Bank",
	body: "Retrieving Data..." //Add icons if you have time
});
splashWindow.show();


//Retrieve Client's Accounts
var query = baseURL + "customers/" + userID + "/accounts?"+ apiKey;

//Main Part of Program - consider refactoring
ajax(
	{
		url: query,
		type: 'json'
	},
	function(data) {	// Data is array of account objects
		//Set up main menu

		var mainMenuItems = [
			{
				title: "Accounts",
				subtitle: data.length + " Account(s)"
			},
			{
				title: "Locations",
				subtitle: "ATMs and Branches"
			},
			{
				title: "My Info",
				subtitle: "Personal Info"
			}
		];

		mainMenu = new UI.Menu({
			sections: [{
				title: userName,
				items: mainMenuItems
			}]
		});
		
		mainMenu.on("select", function(e) {
			switch(e.itemIndex) {
				case 0: // Accounts
					//console.log(JSON.stringify(data));
					var accountMenuItems = createAccountItems(data);
					var accountsMenu = new UI.Menu({
						sections: [{
							title: "Accounts",
							items: accountMenuItems
						}]
					});
					
					//ADD HISTORY!!!!!
					accountsMenu.on("select", function(f){
						var index = f.itemIndex;
						var nickName = data[index].nickname;
						var type = data[index].type;
						var accountID = data[index]._id;
						
						console.log(accountID);
						
						var content = "Balance: \$" +  data[index].balance
							+ "\nRewards: \$" + data[index].rewards
							+ "\n\nTransactions:"
							+ "\n-Purchases--";

						query = baseURL + "accounts/" + accountID + "/purchases?"
							+ apiKey;

						ajax(
							{
								url: query,
								type: 'json'
							},
							function(purchases) {
								console.log("Successful query for purchases");
								var counter = 0;
								var length = purchases.length;

								while(counter < 5 && length > 0) {
									content += "\n " + purchases[counter].merchant_id
										+ purchases[counter].amount + "\n" + purchases[counter].purchase_date;
										
									counter++;
									length--;
								}
									 
								var detailCard = new UI.Card({
									title: nickName,
									subtitle: type,
									body: content,
									scrollable: true,
									style: "large"
								});
								detailCard.show();	
							},
							function(e){
								console.log("Could not get purchases");
							});
					});
					
					accountsMenu.show();
					break;
					
				case 1: // Locations
					getCoordinates(createLocationMenu);
					break;
	
				case 2: // Personal Info
					query = baseURL + "customers/" + userID + "?" +apiKey;
					ajax(
						{
							url: query,
							type: "json"
						},
						function(info) {
							//console.log(JSON.stringify(info));
							var address = info.address;
							var content = "Address: " + address.street_number
								+ " " + address.street_name + "\nCity: " + address.city 
								+ "\nState: " + address.state + "\nZipcode: " + address.zip;

							var infoCard = new UI.Card({
								title: userName,
								body: content,
								style: "small"
							});

							infoCard.show();
						},
						function(error) {
							console.log("Failed to retrieve info"); //This is duplicate code. Clean up later!
						}
					);
					break;

			}	//END_SWITCH
		});

		splashWindow.hide();
		mainMenu.show();

	},
	function(error) {
		console.log("Failed to retrieve info");
	}
);


//Helper functions
function getCoordinates(callback) {
	var locationOptions = {
		enableHighAccuracy: true, 
		maximumAge: 10000, 
		timeout: 10000
	};

	console.log("Function called");
	function locationSuccess(pos) {
		console.log('lat= ' + pos.coords.latitude + ' lon= ' + pos.coords.longitude);
		callback(pos.coords.latitude, pos.coords.longitude);
	}

	function locationError(err) {
		console.log('location error (' + err.code + '): ' + err.message);
	}

	// Request current position
	navigator.geolocation.getCurrentPosition(locationSuccess, locationError, locationOptions);
}


function createLocationMenu(latitude, longitude) {
	var locationTypes = [
		{
			title: "ATMs",
			subtitle: "Nearest ATMs"
		},
		{
			title: "Branches",
			subtitle: "Nearest Branches"
		}
	];
	
	var locationsMenu = new UI.Menu({
		sections: [{
			title: "Locations",
			items: locationTypes
		}]
	});

	locationsMenu.on("select", function(i) {
		var index = i.itemIndex;
		if(index) {
			showBranches(latitude, longitude);
		} else {
			showATMs(latitude, longitude);
		}
	});
	
	locationsMenu.show();
}


function showATMs(lat,long) {
	var query = baseURL + "atms?lat=" + lat + "&lng=" + long
		+ "&rad=80&" + apiKey;
	console.log(query);
	
	ajax(
		{
			url: query,
			type: "json"		
		},
		function(search) {
			console.log(JSON.stringify(search));
			
			var locations = search.data;
			var counter = 0;
			var length = locations.length;
			var list = [];
			
			console.log("locations: " + length);

			if(length === 0) {
				reportNoLocations();
				return;
			}

			while(length > 0 && counter < 5) {
				var name = locations[counter].name;
				var address = locations[counter].address.street_number + " "
					+ locations[counter].address.street_name;

				list.push({
					title: name,
					subtitle: address
				});

				length--;
				counter++;
			}
			
			var results = new UI.Menu({
				sections: [{
					title: "ATMs",
					items: list
				}]
			});
			
			results.on("select", function(l){
				var index = l.itemIndex;
				
				var address = locations[index].address.street_number + " "
					+ locations[index].address.street_name;
				var name = locations[index].name;
				var hours = locations[index].hours.toString();
				
				var hourCard = new UI.Card({
					title: name,
					subtitle: address,
					body: hours,
					style: "small"
				});
				hourCard.show();
			});
			
			results.show();
		},
		function(error) {
			console.log("Failed to retrieve locations");
		}
	);
}


function showBranches(lat, long) {
	var query = baseURL + "branches?" + apiKey;
	console.log(query);
	
	ajax(
		{
			url: query,
			type: "json"		
		},
		function(search) {
			console.log(JSON.stringify(search));
			
			var locations = search;
			var counter = 0;
			var length = locations.length;
			var list = [];
			
			console.log("locations: " + length);

			if(length === 0) {
				reportNoLocations();
				return;
			}

			while(length > 0 && counter < 5) {
				var name = locations[counter].name;
				var address = locations[counter].address.street_number + " "
					+ locations[counter].address.street_name;

				list.push({
					title: name,
					subtitle: address
				});

				length--;
				counter++;
			}
			
			var results = new UI.Menu({
				sections: [{
					title: "Branches",
					items: list
				}]
			});
			
			results.on("select", function(l){
				var index = l.itemIndex;
				
				var address = locations[index].address.street_number + " "
					+ locations[index].address.street_name;
				var name = locations[index].name;
				var hours = locations[index].hours.toString();
				
				var hourCard = new UI.Card({
					title: name,
					subtitle: address,
					body: hours,
					scrollable: true,
					style: "small"
				});
				hourCard.show();
			});
			
			results.show();
		},
		function(error) {
			console.log("Failed to retrieve locations");
		}
	);
}


function reportNoLocations() {
	var errorCard = new UI.Card({
		title: "Error",
		body: "No locations near you"
	});
	errorCard.show();	
}


function createAccountItems(accounts) {
	var items = [];
	for(var i = 0; i < accounts.length; i++) {
		items.push({
			title: accounts[i].nickname			
		});
	}
	return items;
}