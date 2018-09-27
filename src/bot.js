'use strict';



module.exports.setup = function(app) {
    var builder = require('botbuilder');
    var teams = require('botbuilder-teams');
    var config = require('config');
    var botConfig = config.get('bot');
    // var BOT_APP_ID = process.env.MICROSOFT_APP_ID || botConfig.microsoftAppId;

    // Create a connector to handle the conversations
    var connector = new teams.TeamsChatConnector({
        // It is a bad idea to store secrets in config files. We try to read the settings from
        // the environment variables first, and fallback to the config file.
        // See node config module on how to create config files correctly per NODE environment
        appId: process.env.MICROSOFT_APP_ID || botConfig.microsoftAppId,
        appPassword: process.env.MICROSOFT_APP_PASSWORD || botConfig.microsoftAppPassword
    });

    var inMemoryBotStorage = new builder.MemoryBotStorage();

    // Define a simple bot with the above connector that echoes what it received
    // var bot = new builder.UniversalBot(connector, function(session) {
    //     // Message might contain @mentions which we would like to strip off in the response
    //     var text = teams.TeamsMessage.getTextWithoutMentions(session.message);
    //     session.send('You said1: %s', text);
    //     var text = teams.TeamsMessage.getTextWithoutMentions(session.message);
    //     session.send('You said2: %s', text);
    //     //session.send('You type: %s', teams.TeamsMessage.type)
    //     session.send('You type: %s', teams.TeamsMessage.type)
    //     session.send('You mess: %s', session.message[2])
    //     if (session.type == session.message) {
    //       session.send('Hey!')
    //     }
    // }).set('storage', inMemoryBotStorage);

    // // My testing space
    // var bot = new builder.UniversalBot(connector).set('storage', inMemoryBotStorage);
    // bot.dialog('/', function(session) {
    //   session.send("Skriv namn");
    //   var name = teams.TeamsMessage.getTextWithoutMentions(session.message);
    //   session.send("Är det korrekt?");
    // });


    // This is a dinner reservation bot that uses a waterfall technique to prompt users for input.
    var bot = new builder.UniversalBot(connector, [
        function (session) {
            session.send("Registrera aktieaffärer.");
            builder.Prompts.text(session, "Please provide your name");
        },
        function (session, results) {
            session.dialogData.name = results.response;
            builder.Prompts.text(session, "What is your social security number?");
        },
        function (session, results) {
            session.dialogData.ssn = results.response;
            builder.Prompts.text(session, "Which stock?");
        },
        function (session, results) {
            session.dialogData.stock = results.response;
            builder.Prompts.number(session, "Total value of transaction?");
        },
        function (session, results) {
            session.dialogData.value = results.response;

            // Process request and display reservation details
            session.send(`Information saved. <br/>Name: ${session.dialogData.name} <br/>SSN: ${session.dialogData.ssn} <br/>Stock: ${session.dialogData.stock} <br/>Transaction value: ${session.dialogData.value}`);
            session.endDialog();
        }
    ]).set('storage', inMemoryBotStorage); // Register in-memory storage
    // Setup an endpoint on the router for the bot to listen.
    // NOTE: This endpoint cannot be changed and must be api/messages
    app.post('/api/messages', connector.listen());

    // Export the connector for any downstream integration - e.g. registering a messaging extension
    module.exports.connector = connector;
};
