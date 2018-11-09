module.exports = (bot, builder, menuItems, buyOrSell, workBook, fileName, sheetName, excelFunctions, validators) => {

    // Full name of user
    bot.dialog("userName", [
        function(session, args) {
            // Invalid entry
            if (args && args.reprompt) {
                builder.Prompts.text(session, "Invalid name. Please re-type your name (remember to not add a space after the name).");
            // First entry
            } else {
                builder.Prompts.text(session, "Please type your full name.");
            }
        },
        function(session, results) {
            // Valid entry
            if (validators.isName(results.response)) {
                session.conversationData.name = results.response;
                session.endDialog();
            // Invalid entry
            } else {
                session.replaceDialog("userName", { reprompt: true });
            }
        }
    ]);

    // Personal identification number
    bot.dialog("pid", [
        function(session, args) {
            // Invalid entry
            if (args && args.reprompt) {
                builder.Prompts.text(session, "Invalid number. Please enter your personal identification number on the format yyyymmdd-xxxx.");
            // First entry
            } else {
                builder.Prompts.text(session, "What is your personal identification number (yyyymmdd-xxxx)?")
            }
        },
        function(session, results) {
            // Valid entry
            if (validators.isSwedishPid(results.response)) {
                session.conversationData.pid = results.response;
                session.endDialog();
             // Invalid entry
             } else {
                session.replaceDialog("pid", { reprompt: true });
             }
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
        function(session, args) {
            // Invalid entry
            if (args && args.reprompt) {
                builder.Prompts.text(session, "Invalid ISIN number. Please enter a valid number.");
            // First entry
            } else {
                builder.Prompts.text(session, "Please enter ISIN number of " + session.conversationData.security + ".")
            }
        },
        function(session, results) {
            // Valid entry
            if (validators.isValidIsin(results.response)) {
                session.conversationData.isin = results.response;
                session.endDialog();
            // Invalid entry
            } else {
                session.replaceDialog("isin", { reprompt: true });
            }
        }
    ]);

    // Transaction date
    bot.dialog("transactionDate", [
        function(session, args) {
            // Invalid entry
            if (args && args.reprompt) {
                builder.Prompts.text(session, "Invalid date. Please enter a valid date on the format yyyy-mm-dd.")
            // First entry
            } else {
                builder.Prompts.text(session, "When did the transaction take place (yyyy-mm-dd)?");

            }
        },
        function(session, results) {
            // Valid entry
            if (validators.isValidDate(results.response)) {
                session.conversationData.transactionDate = results.response;
                session.endDialog();
            // Invalid entry
            } else {
                session.replaceDialog("transactionDate", { reprompt: true });
            }
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
        function(session, args) {
            // Invalid entry
            if (args && args.reprompt) {
               builder.Prompts.text(session, "Invalid price. Please enter a valid number.");
            // First entry
            } else {
                // Interactive text depending on if user bought or sold
                var msg = "traded ";
                if (session.conversationData.type.toLowerCase() == "buy") {
                    msg = "bought ";
                } else if (session.conversationData.type.toLowerCase() == "sell") {
                    msg = "sold ";
                }
                builder.Prompts.text(session, "Please enter the price at which you " + msg + session.conversationData.security + ".");
            }
        },
        function(session, results) {
            // Valid entry
            if (validators.isValidPrice(results.response)) {
                session.conversationData.quotedPrice = results.response;
                session.endDialog();
            // Invalid entry
            } else {
                session.replaceDialog("quotedPrice", { reprompt: true });
            }
        }
    ]);

    // Number of securities
    bot.dialog("numSecurities", [
        function(session, args) {
            // Invalid entry
            if (args && args.reprompt) {
                builder.Prompts.text(session, "Invalid number. Please enter a whole number.");
            // First entry
            } else {
                builder.Prompts.text(session, "How many " + session.conversationData.security + " did you " + session.conversationData.type.toLowerCase() + "?");
            }
        },
        function(session, results) {
            // Valid entry
            if (validators.isValidNumber(results.response)) {
                session.conversationData.numSecurities = results.response;
                session.endDialog();
            // Invalid entry
            } else {
                session.replaceDialog("numSecurities", { reprompt: true });
            }
        }
    ]);

    // Change entry
    bot.dialog("changeAnswer", [
        // User selects which entry to change
        function(session) {
            builder.Prompts.choice(session, "Select entry to change (Type the entry or 1-" + Object.keys(menuItems).length + "):", menuItems);
        },
        // Change entry
        function(session, results) {
            // If not correct input.
            session.beginDialog(menuItems[results.response.entity].item);
        },
        // Restart confirmation dialog
        function(session) {
            session.beginDialog("conf");
        }
    ]);

    // Ask is the user would like to read the guidelines
    bot.dialog("promptReadGuidelines", [
        function(session) {
            builder.Prompts.confirm(session, "Would you like to read the guidelines? Please answer 'yes' or 'no'.");
        },
        function(session, args) {
            // Read guidelines
            if (args.response) {
                session.beginDialog("sendGuidelines");
            // Do not read guidelines
            } else {
                session.endDialog()
            }
        }
    ]);

    // Send guidelines to user on pdf format
    bot.dialog("sendGuidelines", [
        function(session) {
            session.send({
                text: "Here you go. Read the guidelines below.",
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
            builder.Prompts.confirm(session, "Does the transaction follow FCG guidelines? Please answer 'yes' or 'no'.");
        },
        function(session, args) {
            // User confirms that he/she follows the guidelines
            if (args.response) {
                session.beginDialog("saveToExcel");
            // User does not confirm that he/she follows the guidelines
            } else {
                session.send("Please contact the HR department. Have a great day!");
                session.endConversation();
            }
        }
    ]);

    // Add name and personal identification number
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
            workBook.xlsx.readFile(fileName)
                .then(function() {
                    // Try to open excel
                    var workSheet = workBook.getWorksheet(sheetName);
                })
                .catch(function(err) {
                    // Catch file not found (+ other errors. Should be fixed)
                    console.log("Missing excel file. Adding file!");
                    var workSheet = workBook.addWorksheet(sheetName);
                    excelFunctions.addHeaders(workSheet);
                    workBook.xlsx.writeFile(fileName)
                })
                .then(function() {
                    // Open excel and add row
                    var workSheet = workBook.getWorksheet(sheetName);
                    for (i = 0; i < session.conversationData.dataArray.length; i++){
                        var row = workSheet.getRow(workSheet.rowCount + 1);
                        excelFunctions.addRow(row, session.conversationData.dataArray[i]);
                        row.commit();
                        workBook.xlsx.writeFile(fileName)
                    }
                })
                .then(function() {
                    // End conversation
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
            // Begin transaction date dialog
            session.beginDialog("transactionDate");
        },
        function(session) {
            // Begin transaction type dialog
            session.beginDialog("type");
        },
        function(session) {
            // Begin quoted price dialog
            session.beginDialog("quotedPrice");
        },
        function(session) {
            // Begin number of securities dialog
            session.beginDialog("numSecurities");
        },
        function(session) {
            // Begin confirmation dialog
            session.beginDialog("conf");
        }
    ]);

    // Continue or exit conversation
    bot.dialog("continueOrExit", [
        function(session) {
            var msg = "Would you like to register more transactions? Please answer 'yes' or 'no'.";
            builder.Prompts.confirm(session, msg);
        },
        function(session, args) {
            // Add another security transaction
            if (args.response) {
                session.beginDialog("addSecurity");
            // User done, proceed to confirm guidelines
            } else {
                session.beginDialog("confirmGuidelines");
            }
        }
    ]);

    // Can be used to automatically retrieve information of user
    bot.dialog('fetchMemberList', function(session) {
        var conversationId = session.message.address.conversation.id;
        console.log(session.message);
        connector.fetchMembers(
            (session.message.address).serviceUrl,
            conversationId,
            (err, result) => {
                if (err) {
                    session.endDialog('Oops, something went wrong.');
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
                "\n Transaction value: " + session.conversationData.quotedPrice.replace(',', '.') * session.conversationData.numSecurities +
                "\n\n Is this the correct information? Please answer 'yes' or 'no'.";
            builder.Prompts.confirm(session, msg);
        },
        function(session, args) {
            // If correct input
            if (args.response) {
                session.conversationData.dataArray.push([session.conversationData.name, session.conversationData.pid, session.conversationData.transactionDate, session.conversationData.type, session.conversationData.security, session.conversationData.isin, session.conversationData.quotedPrice, session.conversationData.numSecurities])
                session.beginDialog("continueOrExit")
            // Choose wrong entry
            } else {
                session.beginDialog("changeAnswer");
            }
        }
    ]);

    // End conversation when user types 'exit'
    bot.dialog('reset', function (session) {
        // reset data
        session.endConversation("Goodbye! Welcome back another time.");
    }).triggerAction({ matches: /^exit/i });

};