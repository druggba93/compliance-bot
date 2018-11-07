module.exports = {
    addHeaders: function(worksheet) {
      var row = worksheet.getRow(1);
      row.getCell(1).value = "Registered at";
      row.getCell(2).value = "Name";
      row.getCell(3).value = "SSN";
      row.getCell(4).value = "Stock";
      row.getCell(5).value = "Quoted Price";
      row.getCell(6).value = "Number of stocks";
      row.getCell(7).value = "Value";
    },
    addRow: function(name, ssn, stock, quotedPrice, numStocks, row, worksheet) {
      var date = new Date();
      row.getCell(1).value = date;
      row.getCell(2).value = name;
      row.getCell(3).value = ssn;
      row.getCell(4).value = stock;
      row.getCell(5).value = quotedPrice;
      row.getCell(6).value = numStocks;
      row.getCell(7).value = quotedPrice * numStocks;
    }
};