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
    addRow: function(row, dataArray) {
        row.getCell(1).value = new Date();
        row.getCell(2).value = dataArray[0] //name;
        row.getCell(3).value = dataArray[1] //pid;
        row.getCell(4).value = dataArray[2] // security;
        row.getCell(5).value = dataArray[3] // isin;
        row.getCell(6).value = dataArray[4] // transactionDate;
        row.getCell(7).value = dataArray[5] // type;
        row.getCell(8).value = dataArray[6] // quotedPrice;
        row.getCell(9).value = dataArray[7] // numSecurities;
        row.getCell(10).value = dataArray[6] * dataArray[7] // quotedPrice * numSecurities;
    }
};