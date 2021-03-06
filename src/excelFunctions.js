module.exports = {
    /**
    * Add headers to first row in excel file
    * @ param {Excel Worksheet} workSheet: An excel worksheet
    * @ return nothing
    **/
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
    /**
    * Add a row of values to excel file
    * @ param {Excel Row} row: A row in an excel worksheet
    * @ param {Array} dataArray: An array containing transaction information
    * @ return nothing
    **/
    addRow: function(row, dataArray) {
        row.getCell(1).value = new Date();
        row.getCell(2).value = dataArray[0]; //name;
        row.getCell(3).value = dataArray[1]; //pid;
        row.getCell(4).value = dataArray[2]; // security;
        row.getCell(5).value = dataArray[3]; // isin;
        row.getCell(6).value = dataArray[4]; // transactionDate;
        row.getCell(7).value = dataArray[5]; // type;
        row.getCell(8).value = dataArray[6].replace('.', ','); // quotedPrice;
        row.getCell(9).value = dataArray[7]; // numSecurities;
        row.getCell(10).value = (dataArray[6].replace(',', '.') * dataArray[7]).toString().replace('.', ','); // quotedPrice * numSecurities;
    }
};