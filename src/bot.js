'use strict';

module.exports.setup = function(app) {

  // Required modules and functions
  var builder = require('botbuilder');
  var teams = require('botbuilder-teams');
  var config = require('config');
  var excel = require('exceljs');
  var excelFunctions = require('./excelFunctions');
  var botDialogs = require('./botDialogs');

  // Setup excel file
  var workbook = new excel.Workbook(); // Create a new instance of a Workbook class
  const filename = "transactions.xlsx"; // Name of excel-file
  const sheetname = "Transactions"; // Sheetname

  // Get bot info from config file
  var botConfig = config.get('bot');

  // Create a connector to handle the conversations
  var connector = new teams.TeamsChatConnector({
    // It is a bad idea to store secrets in config files. We try to read the settings from
    // the environment variables first, and fallback to the config file.
    // See node config module on how to create config files correctly per NODE environment
    appId: process.env.MICROSOFT_APP_ID || botConfig.microsoftAppId,
    appPassword: process.env.MICROSOFT_APP_PASSWORD || botConfig.microsoftAppPassword
  });

  // We save information temporarily in the Bot storage memory
  var inMemoryBotStorage = new builder.MemoryBotStorage();

  // The different types of dialogs to start
  var dialogTypes = {
    "Add new transaction": {
      // Dialog q1
      item: "addNew"
    },
    "Change existing transaction": {
      // Dialog q2
      item: "changeExisting"
    }
  };

  // The variables used to chose the wrong entries
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




  // Create the bot.
  var bot = new builder.UniversalBot(connector, [
    // function(session) {
    //   // Restart the confirmation dialog.
    //   session.beginDialog("FetchMemberList");
    // },
    // function(session) {
    //   // Chose dialog
    //   builder.Prompts.choice(session, "What do you want to do? Type the entry or 1-" + Object.keys(dialogTypes).length + ":", dialogTypes);
    // },
    // function(session, results) {
    //   session.beginDialog(dialogTypes[results.response.entity].item);
    // }
    function(session) {
      // Restart the confirmation dialog.
      session.beginDialog("addNew");
    }
  ]).set('storage', inMemoryBotStorage); // Register in-memory storage

    // Load functions from bot dialogs
    botDialogs(bot, builder, menuItems, workbook, filename, sheetname, excelFunctions);

  // Add a new transactions
  bot.dialog("addNew", [
    function(session) {
      // Begin name dialog
      session.beginDialog("q1");
    },
    function(session) {
      // Begin SSN dialog
      session.beginDialog("q2");
    },
    function(session) {
      // Begin stock dialog
      session.beginDialog("q3");
    },
    function(session) {
      // Begin quoted price dialog
      session.beginDialog("q4");
    },
    function(session) {
      // Begin number of stocks dialog
      session.beginDialog("q5");
    },
    function(session) {
      // Begin confirmation dialog.
      session.beginDialog("conf");
    }
  ]);

  // Change existing transaction
  bot.dialog("changeExisting", [
    function(session) {
      workbook.xlsx.readFile(filename)
        .then(function() {
          var worksheet = workbook.getWorksheet(sheetname);
          // Iterate over all rows that have values in a worksheet
          worksheet.eachRow(function(row, rowNumber) {
            var rowValues = JSON.stringify(row.values);
            //var rowValues = row.values;
            console.log(rowValues[2]);
            console.log('Row ' + rowNumber + ' = ' + rowValues);
          });
        })
    }
  ]);


  // Can be used later to automatically retrieve information of user.
  bot.dialog('FetchMemberList', function(session) {
    var conversationId = session.message.address.conversation.id;
    console.log(session.message);
    connector.fetchMembers(
      (session.message.address).serviceUrl,
      conversationId,
      (err, result) => {
        if (err) {
          session.endDialog('There is some error');
        } else {
          session.endDialog('%s', JSON.stringify(result));
        }
      }
    );
  });

  // Welcome message when chat starts
  bot.on('conversationUpdate', function(message) {
    if (message.membersAdded) {
      message.membersAdded.forEach(function(identity) {
        if (identity.id === message.address.bot.id) {
          bot.send(new builder.Message()
            .address(message.address)
            .text("Hi, I am the compliance bot! Here you can register your financial transactions. Please type 'start' and press enter to continue."));
        }
      });
    }
  });

  // Setup an endpoint on the router for the bot to listen.
  // NOTE: This endpoint cannot be changed and must be api/messages
  app.post('/api/messages', connector.listen());

  // Export the connector for any downstream integration - e.g. registering a messaging extension
  module.exports.connector = connector;
};
