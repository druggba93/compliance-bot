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

    // The variables used to choose the wrong entries
    var menuItems = {
        "Name": {
            // User name
            item: "userName"
        },
        "Personal identification number": {
            // PID
            item: "pid"
        },
        "Security": {
            // Name of security
            item: "security"
        },
        "Transaction date": {
            // Transaction date
            item: "transactionDate"
        },
        "Transaction type": {
            // Transaction type
            item: "type"
        },
        "Quoted price": {
            // Quoted price
            item: "quotedPrice"
        },
        "Number of securities": {
            // Number of securities
            item: "numSecurities"
        }
    };

    // Variables used to choose type of transaction
    var buyOrSell = {
        "Buy": {
            // Buy
            item: "Buy"
        },
        "Sell": {
            item: "Sell"
        }
    }

    // Create the bot.
    var bot = new builder.UniversalBot(connector, [
        function(session) {
            // Restart the confirmation dialog.
            session.beginDialog("addNameAndPid");
        },
        function(session) {
            // Add a security.
            session.beginDialog("addSecurity")
        }
    ]).set('storage', inMemoryBotStorage); // Register in-memory storage

    // Load functions from bot dialogs
    botDialogs(bot, builder, menuItems, buyOrSell, workbook, filename, sheetname, excelFunctions);

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