'use strict';

function addHeaders(worksheet) {
  var row = worksheet.getRow(1);
  row.getCell(1).value = "Name";
  row.getCell(2).value = "SSN";
  row.getCell(3).value = "Stock";
  row.getCell(4).value = "Quoted Price";
  row.getCell(5).value = "Number of stocks";
  row.getCell(6).value = "Value";
};

function addRow(name, ssn, stock, quotedPrice, numStocks, row, worksheet) {
  row.getCell(1).value = name;
  row.getCell(2).value = ssn;
  row.getCell(3).value = stock;
  row.getCell(4).value = quotedPrice;
  row.getCell(5).value = numStocks;
  row.getCell(6).value = quotedPrice * numStocks;
};

module.exports.setup = function(app) {

  // Required modules
  var builder = require('botbuilder');
  var teams = require('botbuilder-teams');
  var config = require('config');
  var excel = require('exceljs');

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

  // Variables used to store information about the transaction
  var name = "";
  var ssn = "";
  var stock = "";
  var quotedPrice = "";
  var numStocks = "";

  // Create the bot.
  var bot = new builder.UniversalBot(connector, [
    function(session) {
      // Begin name dialog
      session.beginDialog("q1");
    },
    function(session, results) {
      // Begin SSN dialog
      session.beginDialog("q2");
    },
    function(session, results) {
      // Begin stock dialog
      session.beginDialog("q3");
    },
    function(session, results) {
      // Begin quoted price dialog
      session.beginDialog("q4");
    },
    function(session, results) {
      // Begin number of stocks dialog
      session.beginDialog("q5");
    },
    function(session, results) {
      // Begin confirmation dialog.
      session.beginDialog("conf");
    }
  ]).set('storage', inMemoryBotStorage); // Register in-memory storage

  // Confirm the results
  bot.dialog("conf", [
    function(session) {
      // Print current entries
      var msg = "Transaction information" +
        "\n\nName: " + name +
        "\n SSN: " + ssn +
        "\n Stock: " + stock +
        "\n Quoted Price: " + quotedPrice +
        "\n Number of stocks: " + numStocks +
        "\n Transaction value: " + quotedPrice * numStocks +
        "\n\nIs this the correct input? Please answer yes/no.";
      builder.Prompts.confirm(session, msg);
    },
    function(session, args) {
      // If correct input
      if (args.response) {
        workbook.xlsx.readFile(filename)
          .then(function() {
            var worksheet = workbook.getWorksheet(sheetname);
            var row = worksheet.getRow(worksheet.rowCount + 1);
            addRow(name, ssn, stock, quotedPrice, numStocks, row, worksheet);
            row.commit();
          })
          .then(function() {
            session.send("Your information has been saved, have a great day!");
            return workbook.xlsx.writeFile(filename)
          }).catch(function(err) {
            var worksheet = workbook.addWorksheet(sheetname);
            var row = worksheet.getRow(2);
            addHeaders(worksheet);
            addRow(name, ssn, stock, quotedPrice, numStocks, row, worksheet);
            row.commit();
            workbook.xlsx.writeFile(filename)
            session.send("Your information has been saved, have a great day!");
          });
        session.endDialog();
      } else {
        // Choose wrong entry.
        builder.Prompts.choice(session, "Select entry to change (Type the entry or 1-" + Object.keys(menuItems).length + "):", menuItems);
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
