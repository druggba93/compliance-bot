module.exports = (bot, builder, menuItems, buyOrSell, workbook, filename, sheetname, excelFunctions) => {

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

    // Ask is the user would like to read the guidelines.
    bot.dialog("promptReadGuidelines", [
        function(session) {
            builder.Prompts.confirm(session, "Would you like to read the guidelines? Please answer 'yes' or 'no'.");
        },
        function(session, args) {
            if (args.response) {
                session.beginDialog("sendGuidelines");
            } else {
                session.endDialog()
            }
        }
    ]);

    // Send guidelines to user
    bot.dialog("sendGuidelines", [
        function(session) {
            session.send({
                text: "Please read the guidelines below.",
                attachments: [{
                    contentType: "application/pdf",
                    contentUrl: __dirname + "\\guidelines.pdf",
                    name: "guidelines.pdf",
                }]
            });
            session.endDialog()
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
                session.send("Please contact the HR department. Have a great day!");
                session.endConversation();
            }
        }
    ]);

    // Add a new transaction
    bot.dialog("addNameAndPid", [
        function(session) {
            // Reset array with all transactions in current session
            session.conversationData.dataArray = [];
            // Prompt to read guidelines
            session.beginDialog("promptReadGuidelines");
        },
        function(session) {
            // Begin name dialog
            session.beginDialog("userName");
        },
        function(session) {
            // Begin SSN dialog
            session.beginDialog("pid");
        }
    ]);

    // Save to excel
    bot.dialog("saveToExcel", [
        function(session) {
            workbook.xlsx.readFile(filename)
                .then(function() {
                    // Try to open excel
                    var worksheet = workbook.getWorksheet(sheetname);
                })
                .catch(function(err) {
                    // Catch file not found (+ other errors. Should be fixed)
                    console.log("Missing excel file. Adding file!");
                    var worksheet = workbook.addWorksheet(sheetname);
                    excelFunctions.addHeaders(worksheet);
                    workbook.xlsx.writeFile(filename)
                })
                .then(function() {
                    // Open excel and add row
                    var worksheet = workbook.getWorksheet(sheetname);
                    for (i = 0; i < session.conversationData.dataArray.length; i++){
                        var row = worksheet.getRow(worksheet.rowCount + 1);
                        excelFunctions.addRow(row, session.conversationData.dataArray[i]);
                        row.commit();
                        workbook.xlsx.writeFile(filename)
                    }
                })
                .then(function() {
                    session.send("Thank you. Have a great day!");
                    session.endConversation();
                });
        }
    ]);

    // Add security
    bot.dialog("addSecurity", [
        function(session) {
            // Begin stock dialog
            session.beginDialog("security");
        },
        function(session) {
            // Begin isin dialog
            session.beginDialog("isin");
        },
        function(session) {
            // Begin quoted price dialog
            session.beginDialog("transactionDate");
        },
        function(session) {
            // Begin number of stocks dialog
            session.beginDialog("type");
        },
        function(session) {
            // Begin number of stocks dialog
            session.beginDialog("quotedPrice");
        },
        function(session) {
            // Begin number of stocks dialog
            session.beginDialog("numSecurities");
        },
        function(session) {
            // Begin confirmation dialog.
            session.beginDialog("conf");
        }
    ]);

    // Continue or exit conversation
    bot.dialog("continueOrExit", [
        function(session) {
            var msg = "Would you like to register more transactions? Please answer yes/no.";
            builder.Prompts.confirm(session, msg);
        },
        function(session, args) {
            if (args.response) {
                session.beginDialog("addSecurity");
            } else {
                session.beginDialog("confirmGuidelines");
            }
        }
    ]);

    // Can be used later to automatically retrieve information of user.
    bot.dialog('fetchMemberList', function(session) {
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
                session.conversationData.dataArray.push([session.conversationData.name, session.conversationData.pid, session.conversationData.transactionDate, session.conversationData.type, session.conversationData.security, session.conversationData.isin, session.conversationData.quotedPrice, session.conversationData.numSecurities])
                session.beginDialog("continueOrExit")
            } else {
                // Choose wrong entry.
                session.beginDialog("changeAnswer");
            }
        }
    ]);
};