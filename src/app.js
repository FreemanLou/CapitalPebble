/**
 *
 * Capital One Client on Pebble Watch.
 */

var ajax = require('ajax');
var UI = require('ui');
var Vector2 = require('vector2');

var appendURL = "";
var apiKey = "accounts?key=4f9385baa549938840c4268f760372f6"; //Time constraint does not allow for more secure methods
var userAccounts = {};
var userID = "55e94a6af8d8770528e60e2c/";
var userName = "Fflewddur Fflam";
var baseURL = "http://api.reimaginebanking.com/";

var splashWindow = new UI.Card({
	title: "Capital One Bank",
	body: "Retrieving Data..." //Add icons if you have time
});

splashWindow.show();

//Retrieve Client Info
var query = baseURL + "customers/" + userID + apiKey; 

ajax(
	{
		url: query,
		type: 'json'
	},
	function(data) {
		userAccounts = data;
	},
	function(error) {
		console.log("Failed to retrieve info");
	}
);

// Set up main menu
var mainMenuItems = [
	{
		title: "Accounts"
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
	

var mainMenu = new UI.Menu({
	sections: [{
		title: userName,
		items: mainMenuItems
	}]
});

splashWindow.hide();
mainMenu.show();
