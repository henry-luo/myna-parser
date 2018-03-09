const fs = require('fs');
const myna = require('./myna');
const grammar = require('./grammars/grammar_abnf')(myna);
const Mark = require('mark-js');
const Template = require('mark-template');
const prettier = require("prettier");

function loadSource(fname) {
	return fs.readFileSync(fname).toString(); 
}

function writeFile(name, fdata) {
	fs.writeFileSync(name, fdata);
}

function printNode(ast, out, indent) {
	let name = ast.name;
	out += '\n'+ indent +'{' + name;
	
	// print children
	for (let n of ast.children) {
		out = printNode(n, out, indent+'  ');
	}
	
	// node specific printing
	if (name === 'rulename' || name === 'repeat') { out += " '" + ast.allText + "'"; }
	
	out += '\n'+ indent +'}';
	return out;
}

function buildAst(ast) {
	let name = ast.name;
	// process children
	let child = [];
	for (let n of ast.children) {
		child.push(buildAst(n));
	}
	// terminal nodes
	if (name === 'rulename' || name === 'repeat') { 
		child.push(ast.allText);
	}
	return Mark(name, null, child);
}

// Get the parser 
let parser = myna.parsers.abnf;

// Parse some input and print the AST
// loadSource('./grammars/abnf.abnf');
// let input = loadSource('./grammars/abnf.abnf');
let input = loadSource('./grammars/ini-file.abnf');

try {
    var ast = parser(input);
	if (ast == null) {
		console.log("input does not match grammar");
	} else {
		// issue: input might not be fully parsed when the parsing ends
		let markAst = buildAst(ast);
		console.log(Mark.stringify(markAst, {space:'  '}));
		
		// transform the AST into a parser in JS
		var tmpl = Template.compile(loadSource('abnf_grammar.mt'));
		var output = Template.apply(tmpl, markAst).join('');  console.log('output type', typeof output);
		
		// format with prettier
		output = prettier.format(output);  console.log(output);
		writeFile('_grammar.js', output);
	}
}
catch(e) {
    console.log("Error occured:");
    console.log(e.toString());
}