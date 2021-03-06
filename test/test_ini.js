// Reference the Myna module
const myna = require('../myna');
const grammar = require('../grammars/grammar_ini')(myna);

function loadSource(fname) {
	const fs = require('fs');
	return fs.readFileSync(fname).toString(); 
}

function printNode(ast, out, indent) {
	let name = ast.name;
	out += '\n'+ indent +'{' + name;
	
	// print children
	for (let n of ast.children) {
		out = printNode(n, out, indent+'  ');
	}
	
	// node specific printing
	if (name === 'KeyName' || name === 'Value') { out += " '" + ast.allText + "'"; }
	
	out += '\n'+ indent +'}';
	return out;
}

// Get the parser 
let parser = myna.parsers.ini;

// Parse some input and print the AST
let input = loadSource('./test/input/sample.ini');

try {
    var ast = parser(input);
	if (ast == null) {
		console.log("input does not match grammar");
	} else {
		// issue: input might not be fully parsed when the parsing ends
		let out = printNode(ast, '', '');
		console.log(out);
	}
}
catch(e) {
    console.log("Error occured:");
    console.log(e.toString());
}