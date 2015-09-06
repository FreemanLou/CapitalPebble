/**
 *
 * Capital One Client on Pebble Watch.
 * Pennapps Fall 2015
 */

var ajax = require('ajax');
var UI = require('ui');
var Vector2 = require('vector2');

var apiKey = "?key=4f9385baa549938840c4268f760372f6"; //Time constraint does not allow for more secure methods
var userID = "55e94a6af8d8770528e60e2c";
var userName = "Fiddler Pig";
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
var query = baseURL + "customers/" + userID + "/accounts"+ apiKey;

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

						var content = "Balance: " +  data[index].balance
							+ "\nRewards: " + data[index].rewards;

						var detailCard = new UI.Card({
							title: nickName,
							subtitle: type,
							body: content,
							style: "small"
						});
						detailCard.show();
					});
					
					accountsMenu.show();
					break;
					
				case 1: // Locations
					// getCoordinates(createLocationItems);
					
					
					break;
	
				case 2: // Info
					query = baseURL + "customers/" + userID + apiKey;
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

			}	//switch
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

function createLocationItems(coordinates) {
	
	
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