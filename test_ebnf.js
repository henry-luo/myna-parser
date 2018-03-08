// Reference the Myna module
const myna = require('./myna');
const grammar = require('./grammars/grammar_ebnf')(myna);

function loadSource(fname) {
	const fs = require('fs');
	return fs.readFileSync(fname).toString(); 
}

/*
function printObj(obj, out, indent) {
	if (obj instanceof Array) {
		out += '[';
		for (let n in obj) {
			out += printObj(n, out, indent+'  ') + ',';
		}
		out += ']';
	} else {
		out += '\n'+ indent +'{'+ obj.constructor.name;
		// print children
		for (let n in obj) {
			out += n + ':' + printObj(n, out, indent+'  ');
		}
		out += '\n'+ indent +'}';	
	}
	return out;
}
*/

function printNode(ast, out, indent) {
	let name = ast.name;
	out += '\n'+ indent +'{' + name;
	
	// print children
	for (let n of ast.children) {
		out = printNode(n, out, indent+'  ');
	}
	
	// node specific printing
	if (name === 'identifier' || name === 'repeatOp' || name === 'altOp') { out += " '" + ast.allText + "'"; }
	
	out += '\n'+ indent +'}';
	return out;
}

// Get the parser 
let parser = myna.parsers.ebnf;

// Parse some input and print the AST
let input = loadSource('./grammars/sparql.ebnf');

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