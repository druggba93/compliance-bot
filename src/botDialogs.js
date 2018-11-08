module.exports = (bot, builder, menuItems, buyOrSell, optionsGuidelines, workbook, filename, sheetname, excelFunctions) => {

    // Full name of user
    bot.dialog("userName", [
        function(session) {
            builder.Prompts.text(session, "Please type your full name.");
        },
        function(session, results) {
            session.conversationData.name = results.response;
            session.endDialog();
        }
    ]);

    // Personal identification number
    bot.dialog("pid", [
        function(session) {
            builder.Prompts.text(session, "What is your personal identification number (yyyymmdd-xxxx)?");
        },
        function(session, results) {
            session.conversationData.pid = results.response;
            session.endDialog();
        }
    ]);

    // Name of security
    bot.dialog("security", [
        function(session) {
            builder.Prompts.text(session, "Please enter name of the security you traded.");
        },
        function(session, results) {
            session.conversationData.security = results.response;
            session.endDialog();
        }
    ]);

    // ISIN
    bot.dialog("isin", [
        function(session) {
            builder.Prompts.text(session, "Please enter ISIN number of " + session.conversationData.security + ".");
        },
        function(session, results) {
            session.conversationData.isin = results.response;
            session.endDialog();
        }
    ]);

    // Transaction date
    bot.dialog("transactionDate", [
        function(session) {
            builder.Prompts.text(session, "When did the transaction take place (yyyy-mm-dd)?");
        },
        function(session, results) {
            session.conversationData.transactionDate = results.response;
            session.endDialog();
        }
    ]);

    // Type of transaction
    bot.dialog("type", [
        function(session) {
            builder.Prompts.choice(session, "Did you buy or sell " + session.conversationData.security + "?", buyOrSell);
        },
        function(session, results) {
            session.conversationData.type = buyOrSell[results.response.entity].item;
            session.endDialog();
        }
    ]);

    // Price of security
    bot.dialog("quotedPrice", [
        function(session) {
            var ending = "traded ";
            if (session.conversationData.type.toLowerCase() == "buy") {
                ending = "bought ";
            } else if (session.conversationData.type.toLowerCase() == "sell") {
                ending = "sold ";
            }
            builder.Prompts.text(session, "Please enter the price at which you " + ending + session.conversationData.security + ".");
        },
        function(session, results) {
            session.conversationData.quotedPrice = results.response;
            session.endDialog();
        }
    ]);

    // Number of securities
    bot.dialog("numSecurities", [
        function(session) {
            builder.Prompts.text(session, "How many " + session.conversationData.security + " did you " + session.conversationData.type.toLowerCase() + "?");
        },
        function(session, results) {
            session.conversationData.numSecurities = results.response;
            session.endDialog();
        }
    ]);

    // Change entry
    bot.dialog("changeAnswer", [
        function(session) {
            builder.Prompts.choice(session, "Select entry to change (Type the entry or 1-" + Object.keys(menuItems).length + "):", menuItems);
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

    // Confirm knowing the guidelines
    bot.dialog("confirmKnowingGuideLines", [
        function(session) {
            builder.Prompts.choice(session, "Do you know the FCG guidelines of employee's transactions in financial instruments or would you like to read them?", optionsGuidelines);
        },
        function(session, results) {
            session.beginDialog(optionsGuidelines[results.response.entity].item);
        }
    ]);

    // Send guidelines to user
    bot.dialog("sendGuidelines", [
        function(session) {
            session.send({
                text: "Please read the guidelines below.",
                attachments: [{
                    contentType: "application/pdf",
                    //contentUrl: "C:/Users/oskar.drugge/Desktop/Internt projekt - ComplianceBot/guidelines.pdf",
                    //contentUrl: "C:/Users/levi.sallberg/Desktop/Atom/bot/compliance-bot/src/guidelines.pdf",
                    contentUrl: __dirname + "\\guidelines.pdf",
                    name: "guidelines.pdf",
                }]
            });
            session.beginDialog("confirmGuidelines");
        }
    ]);

    // Confirm that user is following guidelines
    bot.dialog("confirmGuidelines", [
        function(session) {
            builder.Prompts.confirm(session, "Does the transaction follow the FCG guidelines? Please answer 'yes' or 'no'.");
        },
        function(session, args) {
            if (args.response) {
                session.beginDialog("saveToExcel");
            } else {
                session.send("Please contact the HR department or re-enter any question you answered incorrectly.");
                session.beginDialog("conf");
            }
        }
    ]);

    // Save to excel
    bot.dialog("saveToExcel", [
        function(session) {
            workbook.xlsx.readFile(filename)
                .then(function() {
                    var worksheet = workbook.getWorksheet(sheetname);
                    var row = worksheet.getRow(worksheet.rowCount + 1);
                    excelFunctions.addRow(session.conversationData.name, session.conversationData.pid, session.conversationData.transactionDate, session.conversationData.type, session.conversationData.security, session.conversationData.isin, session.conversationData.quotedPrice, session.conversationData.numSecurities, row);
                    row.commit();
                })
                .then(function() {
                    return workbook.xlsx.writeFile(filename)
                }).catch(function(err) {
                    var worksheet = workbook.addWorksheet(sheetname);
                    var row = worksheet.getRow(2);
                    excelFunctions.addHeaders(worksheet);
                    excelFunctions.addRow(session.conversationData.name, session.conversationData.pid, session.conversationData.transactionDate, session.conversationData.type, session.conversationData.security, session.conversationData.isin, session.conversationData.quotedPrice, session.conversationData.numSecurities, row);
                    row.commit();
                    workbook.xlsx.writeFile(filename)
                    console.log("-------Error was: " + err);
                }).then(function() {
                    session.send("Your information has been saved.")
                    session.beginDialog("continueOrExit");
                });
        }
    ]);

    // Confirm the results
    bot.dialog("conf", [
        function(session) {
            // Print current entries
            var msg = "Transaction information" +
                "\n\n Name: " + session.conversationData.name +
                "\n Personal identification number: " + session.conversationData.pid +
                "\n Name of security: " + session.conversationData.security +
                "\n ISIN: " + session.conversationData.isin +
                "\n Transaction date: " + session.conversationData.transactionDate +
                "\n Type of transaction " + session.conversationData.type +
                "\n Quoted Price: " + session.conversationData.quotedPrice +
                "\n Number of securities: " + session.conversationData.numSecurities +
                "\n Transaction value: " + session.conversationData.quotedPrice * session.conversationData.numSecurities +
                "\n\n Is this the correct input? Please answer yes/no.";
            builder.Prompts.confirm(session, msg);
        },
        function(session, args) {
            // If correct input
            if (args.response) {
                session.beginDialog("confirmKnowingGuideLines")
            } else {
                // Choose wrong entry.
                session.beginDialog("changeAnswer");
            }
        }
    ]);
};