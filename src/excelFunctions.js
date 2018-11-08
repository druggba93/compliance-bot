module.exports = {
    addHeaders: function(worksheet) {
      var row = worksheet.getRow(1);
      row.getCell(1).value = "Registered at";
      row.getCell(2).value = "Name";
      row.getCell(3).value = "Personal identification number";
      row.getCell(4).value = "Name of security";
      row.getCell(5).value = "ISIN";
      row.getCell(6).value = "Date of transaction";
      row.getCell(7).value = "Transaction type";
      row.getCell(8).value = "Price";
      row.getCell(9).value = "Number";
      row.getCell(10).value = "Transaction value";
    },
    addRow: function(name, pid, transactionDate, type, security, isin, quotedPrice, numSecurities, row, worksheet) {
      row.getCell(1).value = new Date();
      row.getCell(2).value = name;
      row.getCell(3).value = pid;
      row.getCell(4).value = security;
      row.getCell(5).value = isin;
      row.getCell(6).value = transactionDate;
      row.getCell(7).value = type;
      row.getCell(8).value = quotedPrice;
      row.getCell(9).value = numSecurities;
      row.getCell(10).value = quotedPrice * numSecurities;
    }
};