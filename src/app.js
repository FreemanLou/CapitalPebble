/**
 *
 * Capital One Client on Pebble Watch.
 */

var ajax = require('ajax');
var UI = require('ui');
var Vector2 = require('vector2');

var apiKey = "key=4f9385baa549938840c4268f760372f6"; //Time constraint does not allow for more secure methods
var userID = "55e94a6af8d8770528e60e2c/";
var userName = "Fflewddur Fflam";
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
var query = baseURL + "customers/" + userID + "accounts?"+ apiKey;

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

					break;
	
				case 2: // Info

					break;
			}
		});

		splashWindow.hide();
		mainMenu.show();

	},
	function(error) {
		console.log("Failed to retrieve info");
	}
);

function createAccountItems(accounts) {
	var items = [];
	for(var i = 0; i < accounts.length; i++) {
		items.push({
			title: accounts[i].nickname			
		});
	}
	return items;
}