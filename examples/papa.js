const Papa = require('papaparse');
const fs = require('fs-extra');

// Two-line, comma-delimited file
var csv = Papa.unparse([
	{
		"Column 1": "foo",
		"Column 2": "bar"
	},
	{
		"Column 1": "abc",
		"Column 2": "def"
	}
]);

console.dir(csv);
fs.writeFileSync('./papa.csv', csv);