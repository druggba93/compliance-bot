module.exports = (bot, builder, menuItems, optionsGuidelines, workbook, filename, sheetname, excelFunctions) => {

    // Question 1.
    bot.dialog("q1", [
        function(session) {
            builder.Prompts.text(session, "Please type your full name.");
//            session.send({
//                text: "Here you can read all about regulations:",
//                attachments: [{
//                        contentType: "application/pdf",
//                        contentUrl: "C:/Users/levi.sallberg/Desktop/Atom/bot/compliance-bot/src/riktlinjer.pdf",
//                        name: "riktlinjer.pdf",
//                }]
//            });
        },
        function(session, results) {
            session.conversationData.name = results.response;
            session.endDialog();
        }
    ]);

    // Question 2.
    bot.dialog("q2", [
        function(session) {
          builder.Prompts.text(session, "What is your social security number (yyyymmdd-xxxx)?");
        },
        function(session, results) {
            session.conversationData.ssn = results.response;
            session.endDialog();
        }
    ]);

    // Question 3.
    bot.dialog("q3", [
    function(session) {
      builder.Prompts.text(session, "Which stock have you bought?");
    },
    function(session, results) {
      session.conversationData.stock = results.response;
      session.endDialog();
    }
  ]);

  // Question 4.
  bot.dialog("q4", [
    function(session) {
      builder.Prompts.text(session, "At what price did you buy it?");
    },
    function(session, results) {
      session.conversationData.quotedPrice = results.response;
      session.endDialog();
    }
  ]);

  // Question 5.
  bot.dialog("q5", [
    function(session) {
      builder.Prompts.text(session, "How many stocks did you buy?");
    },
    function(session, results) {
      session.conversationData.numStocks = results.response;
      session.endDialog();
    }
  ]);

  // Question 5.
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


  // Question 5.
  bot.dialog("confirmKnowingGuideLines", [
    function(session) {
      builder.Prompts.choice(session, "Do you know the FCG guidelines of employee's transactions in financial instruments or would you like to read them?", optionsGuidelines);
    },
    function(session, results) {
      session.beginDialog(optionsGuidelines[results.response.entity].item);
    }
  ]);


  // Question 4.
  bot.dialog("sendGuidelines", [
    function(session) {
        session.send({
            text: "Here you can read all about regulations:",
            attachments: [{
                    contentType: "application/pdf",
                    contentUrl: "C:/Users/levi.sallberg/Desktop/Atom/bot/compliance-bot/src/riktlinjer.pdf",
                    name: "riktlinjer.pdf",
            }]
        });

    session.beginDialog("confirmGuidelines");

    }

  ]);


  // Question 4.
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



  // Question 4.
  bot.dialog("saveToExcel", [
    function(session) {
        workbook.xlsx.readFile(filename)
          .then(function() {
            var worksheet = workbook.getWorksheet(sheetname);
            var row = worksheet.getRow(worksheet.rowCount + 1);
            excelFunctions.addRow(session.conversationData.name, session.conversationData.ssn, session.conversationData.stock, session.conversationData.quotedPrice, session.conversationData.numStocks, row, worksheet);
            row.commit();
          })
          .then(function() {
            session.send("Your information has been saved, have a great day!");
            return workbook.xlsx.writeFile(filename)
          }).catch(function(err) {
            var worksheet = workbook.addWorksheet(sheetname);
            var row = worksheet.getRow(2);
            excelFunctions.addHeaders(worksheet);
            excelFunctions.addRow(session.conversationData.name, session.conversationData.ssn, session.conversationData.stock, session.conversationData.quotedPrice, session.conversationData.numStocks, row, worksheet);
            row.commit();
            workbook.xlsx.writeFile(filename)
            session.send("Your information has been saved, have a great day!");
            console.log("-------Error was: " + err);
          }).then(function() {
            session.endConversation();
          });
    }
  ]);


    // Confirm the results
  bot.dialog("conf", [
    function(session) {
      // Print current entries
      var msg = "Transaction information" +
        "\n\nName: " + session.conversationData.name +
        "\n SSN: " + session.conversationData.ssn +
        "\n Stock: " + session.conversationData.stock +
        "\n Quoted Price: " + session.conversationData.quotedPrice +
        "\n Number of stocks: " + session.conversationData.numStocks +
        "\n Transaction value: " + session.conversationData.quotedPrice * session.conversationData.numStocks +
        "\n\nIs this the correct input? Please answer yes/no.";
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



