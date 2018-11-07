module.exports = (bot, builder, menuItems, workbook, filename, sheetname, excelFunctions) => {

    // Question 1.
    bot.dialog("q1", [
        function(session) {
            builder.Prompts.text(session, "Please type your full name.");
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


};



