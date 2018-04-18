const fs = require('fs');
const myna = require('./../myna');
const grammar = require('./../grammars/grammar_antla')(myna);
const Mark = require('mark-js');
const Template = require('mark-template');
const prettier = require("prettier");

function loadSource(fname) {
	return fs.readFileSync(fname).toString(); 
}

function writeFile(name, fdata) {
	fs.writeFileSync(name, fdata);
}

let obj_id = 0;

function buildAst(ast) {
	let name = ast.name;
	// process children
	let child = [];
	for (let n of ast.children) {
		child.push(buildAst(n));
	}
	// terminal nodes
	if (name === 'identifier' || name === 'repeatOp' || name === 'altOp' || name === 'string') { 
		child.push(ast.allText);
	}
	obj_id++;
	return Mark(name, {$id:obj_id}, child.length ? child:null);
}

// Get the parser 
let parser = myna.parsers.antla;

// Parse some input and print the AST
let input = loadSource('./grammars/ecmascript.a3g');

try {
    var ast = parser(input);
	if (ast == null) {
		console.log("input does not match grammar");
	} else {
		// issue: input might not be fully parsed when the parsing ends
		let markAst = buildAst(ast);  console.log(markAst);
		// markAst.name = 'ini';
		console.log(Mark.stringify(markAst, {space:'  '}));
		
		// transform the AST into a parser in JS
		let src = loadSource('grammars/antla_grammar.mt');  
		var tmpl = Template.compile(src);  console.log('tmpl', tmpl);
		var output = Template.apply(tmpl, markAst).join('');  console.log('output type', typeof output);
		
		// format with prettier
		//output = prettier.format(output);  
		console.log(output);
		writeFile('grammars/_grammar_antla.js', output);
	}
}
catch(e) {
    console.log("Error occured:");
    console.log(e.toString());
}