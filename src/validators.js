/**
* Calculates a check digit for an isin
* @param {String} code an ISIN code with country code, but without check digit
* @return {Integer} The check digit for this code
*/
function calcIsinCheck(code) {
    var conv = '';
    var digits = '';
    var sd = 0;

    // convert letters
    for(var i = 0; i < code.length; i++) {
        var c = code.charCodeAt(i);
        conv += (c > 57) ? (c - 55).toString() : code[i];
    }

    // group by odd and even, multiply digits from group containing rightmost character by 2
    for (var i = 0; i < conv.length; i++) {
        digits += (parseInt(conv[i])*((i % 2)==(conv.length % 2 != 0 ? 0 : 1) ? 2 : 1)).toString();
    }

    // sum all digits
    for (var i = 0; i < digits.length; i++) {
        sd += parseInt(digits[i]);
    }
    // subtract mod 10 of the sum from 10, return mod 10 of result
    return (10 - (sd % 10)) % 10;
}

/**
* Calculates if a Swedish personal identification number is correct
* @param {String} pid: A Swedish personal number on the format yyyymmdd-xxxx
* @return Boolean
*/
function validatePid(pid) {
    // Do formatting and sanity control
    pid = pid.replace(/[^0-9]/g, ''); // only keep digits

    // Check if date is correct
    if (pid.length == 12) // year format 1985 → 85
        pid = pid.substr(2);
    if (pid.length != 10) // check length
        return false;
    if (pid.substr(2,2) > 12) // check month
        return false;
    if (pid.substr(4,2) > 31 || pid.substr(4,2) == 0) // check date
        return false;

    var parts = pid.split('').map(function(i){
        return Number(i);
    });

    // Then run the mod 10 algorithm to produce check digit
    var control = parts.pop();
    var inc = 0, multiplicator = 2, product;

    for (var i in parts) {
        product = parts[i] * multiplicator;
        if (product > 9)
            inc += product - 9;
        else
            inc += product;
        multiplicator = multiplicator == 1 ? 2 : 1;
    }

    var control_ = 10 - (inc - Math.floor(inc/10)*10);

    if (10 == control_)
        control_ = 0;

    return control == control_;
}

module.exports = {
    /**
    * Check if a string is a full name. Not ok names include weird symbols such as @£$€ and numbers
    * @param {String} name: A full name
    * @return Boolean
    */
    isName: function(name) {
        var re = /^[a-zA-Z\u00c0-\u017e]+(([',. -][a-zA-Z\u00c0-\u017e ])?[a-zA-Z\u00c0-\u017e]*)*$/;
        return name.match(re);
    },
    /**
    * Calculates if a Swedish personal identification number is correct
    * @param {String} pid: A Swedish personal number
    * @return Boolean
    */
    isSwedishPid: function(pid) {
        var re = /^[1-2][0|9][0-9]{2}[0-1][0-9][0-3][0-9][-][0-9]{4}$/;
        if (!pid.match(re)) return false;
        return validatePid(pid);
    },
    /**
    * Calculates if a ISIN number is correct
    * @param {String} isin: A ISIN number for a security
    * @return Boolean
    */
    isValidIsin: function(isin) {
        // basic pattern
        var re = /^(AD|AE|AF|AG|AI|AL|AM|AO|AQ|AR|AS|AT|AU|AW|AX|AZ|BA|BB|BD|BE|BF|BG|BH|BI|BJ|BL|BM|BN|BO|BQ|BR|BS|BT|BV|BW|BY|BZ|CA|CC|CD|CF|CG|CH|CI|CK|CL|CM|CN|CO|CR|CU|CV|CW|CX|CY|CZ|DE|DJ|DK|DM|DO|DZ|EC|EE|EG|EH|ER|ES|ET|FI|FJ|FK|FM|FO|FR|GA|GB|GD|GE|GF|GG|GH|GI|GL|GM|GN|GP|GQ|GR|GS|GT|GU|GW|GY|HK|HM|HN|HR|HT|HU|ID|IE|IL|IM|IN|IO|IQ|IR|IS|IT|JE|JM|JO|JP|KE|KG|KH|KI|KM|KN|KP|KR|KW|KY|KZ|LA|LB|LC|LI|LK|LR|LS|LT|LU|LV|LY|MA|MC|MD|ME|MF|MG|MH|MK|ML|MM|MN|MO|MP|MQ|MR|MS|MT|MU|MV|MW|MX|MY|MZ|NA|NC|NE|NF|NG|NI|NL|NO|NP|NR|NU|NZ|OM|PA|PE|PF|PG|PH|PK|PL|PM|PN|PR|PS|PT|PW|PY|QA|RE|RO|RS|RU|RW|SA|SB|SC|SD|SE|SG|SH|SI|SJ|SK|SL|SM|SN|SO|SR|SS|ST|SV|SX|SY|SZ|TC|TD|TF|TG|TH|TJ|TK|TL|TM|TN|TO|TR|TT|TV|TW|TZ|UA|UG|UM|US|UY|UZ|VA|VC|VE|VG|VI|VN|VU|WF|WS|YE|YT|ZA|ZM|ZW)([0-9A-Z]{9})([0-9])$/;
        var match = re.exec(isin);
        if (match == null) return false;
        if (match.length != 4) return false;

        // validate the check digit
        return (match[3] == calcIsinCheck(match[1] + match[2]));
    },
    /**
    * Calculates if a string is an actual date
    * @param {String} date
    * @return Boolean
    */
    isValidDate: function(date) {
        var re = /^\d{4}-\d{2}-\d{2}$/;
        if(!date.match(re)) return false;  // Invalid format
        var d = new Date(date);
        if(Number.isNaN(d.getTime())) return false; // Invalid date
        return d.toISOString().slice(0,10) === date;
    },
    /**
    * Calculates if a string contains a number (Integer or float with , and . separators)
    * @param {String} number
    * @return Boolean
    */
    isValidPrice: function(number) {
        number = number.replace(',', '.');
        var re = /^[+-]?((\.\d+)|(\d+(\.\d+)?))$/;
        return number.match(re);
    },
    /**
    * Calculates if a string is an Integer
    * @param {String} number
    * @return Boolean
    */
    isValidNumber: function(number) {
        var re = /^\d+$/;
        return number.match(re);
    }
};