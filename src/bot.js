'use strict';

module.exports.setup = function(app) {
  var builder = require('botbuilder');
  var teams = require('botbuilder-teams');
  var config = require('config');
  var botConfig = config.get('bot');

  // Write to excel
  var excel = require('excel4node'); // Require library
  var workbook = new excel.Workbook(); // Create a new instance of a Workbook class
  var worksheet = workbook.addWorksheet('Sheet 1'); // Add worksheet
  var row = 1; // Keep track of current row

  // Create a connector to handle the conversations
  var connector = new teams.TeamsChatConnector({
    // It is a bad idea to store secrets in config files. We try to read the settings from
    // the environment variables first, and fallback to the config file.
    // See node config module on how to create config files correctly per NODE environment
    appId: process.env.MICROSOFT_APP_ID || botConfig.microsoftAppId,
    appPassword: process.env.MICROSOFT_APP_PASSWORD || botConfig.microsoftAppPassword
  });

  var inMemoryBotStorage = new builder.MemoryBotStorage();

  // The variables, used to chose the wrong entry.
  var menuItems = {
    "Name": {
      // Dialog q1
      item: "q1"
    },
    "SSN": {
      // Dialog q2
      item: "q2"
    },
    "Stock": {
      // Dialog q3
      item: "q3"
    },
    "Quoted price": {
      // Dialog q4
      item: "q4"
    },
    "Number of stocks": {
      // Dialog q5
      item: "q5"
    }
  };

  // The variables used to store information about the user.
  var name = "";
  var ssn = "";
  var stock = "";
  var quotedPrice = "";
  var numStocks = "";

  // Create the bot.
  var bot = new builder.UniversalBot(connector, [
    function(session) {
      // Begin dialog.
      session.send("Welcome! Here you can register your transactions.");
      session.beginDialog("q1");
    },
    function(session, results) {
      // Begin dialog.
      session.beginDialog("q2");
    },
    function(session, results) {
      // Begin dialog.
      session.beginDialog("q3");
    },
    function(session, results) {
      // Begin dialog.
      session.beginDialog("q4");
    },
    function(session, results) {
      // Begin dialog.
      session.beginDialog("q5");
    },
    function(session, results) {
      // Begin confirmation dialog.
      session.beginDialog("conf");
    }
  ]).set('storage', inMemoryBotStorage); // Register in-memory storage

  // Confirm the results.
  bot.dialog("conf", [
    function(session) {
      // Print current variables.
      var msg = "Name: " + name + "\n SSN:  " + ssn + "\n Stock: " + stock + "\n Quoted Price: " + quotedPrice + "\n Number of stocks: " + numStocks + "\n Transaction value: " + quotedPrice*numStocks;
      session.send(msg);
      builder.Prompts.confirm(session, "Is this the correct input? Please answer yes/no.");
    },
    function(session, args) {
      // If correct input.
      if (args.response) {
        worksheet.cell(row,1).string(name);
        worksheet.cell(row,2).string(ssn);
        worksheet.cell(row,3).string(stock);
        worksheet.cell(row,4).string(quotedPrice);
        worksheet.cell(row,5).string(numStocks);
        worksheet.cell(row,6).number(quotedPrice*numStocks);
        // Write to excel
        workbook.write("test.xlsx", function(err) {
            if(err) {
                session.send("Oops! Something went wrong, we could not save the results.");
                return console.log(err);
            } else {
              row = row + 1;
              session.send("Your information has been saved, have a great day!");
              console.log("======The file was saved!======");
            }
        });
        session.endDialog();
      } else {
        // Choose wrong entry.
        builder.Prompts.choice(session, "Select the entry you want to change (Type the entry or 1-"+ Object.keys(menuItems).length +"):", menuItems);
      }
    },
    function(session, results) {
      // If not correct input.
      session.beginDialog(menuItems[results.response.entity].item);
    },
    function(session) {
      // Restart the confirmation dialog.
      session.beginDialog("conf");
    }
  ]);


  // Question 1.
  bot.dialog("q1", [
    function(session) {
      builder.Prompts.text(session, "Please type your full name.");
    },
    function(session, results) {
      name = results.response;
      session.endDialog();
    }
  ]);

  // Question 2.
  bot.dialog("q2", [
    function(session) {
      builder.Prompts.text(session, "What is your social security number (yyyymmdd-xxxx)?");
    },
    function(session, results) {
      ssn = results.response;
      session.endDialog();
    }
  ]);

  // Question 3.
  bot.dialog("q3", [
    function(session) {
      builder.Prompts.text(session, "Which stock have you bought?");
    },
    function(session, results) {
      stock = results.response;
      session.endDialog();
    }
  ]);

  // Question 4.
  bot.dialog("q4", [
    function(session) {
      builder.Prompts.text(session, "At what price did you buy it?");
    },
    function(session, results) {
      quotedPrice = results.response;
      session.endDialog();
    }
  ]);

  // Question 5.
  bot.dialog("q5", [
    function(session) {
      builder.Prompts.text(session, "How many stocks did you buy?");
    },
    function(session, results) {
      numStocks = results.response;
      session.endDialog();
    }
  ]);

  // Setup an endpoint on the router for the bot to listen.
  // NOTE: This endpoint cannot be changed and must be api/messages
  app.post('/api/messages', connector.listen());

  // Export the connector for any downstream integration - e.g. registering a messaging extension
  module.exports.connector = connector;
};
