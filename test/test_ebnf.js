const fs = require('fs');
const myna = require('./../myna');
const grammar = require('./../grammars/grammar_ebnf')(myna);
const Mark = require('mark-js');
const Template = require('mark-template');
const prettier = require("prettier");

function loadSource(fname) {
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

let obj_id = 0;

function buildAst(ast) {
	let name = ast.name;
	// process children
	let child = [];
	for (let n of ast.children) {
		child.push(buildAst(n));
	}
	// terminal nodes
	if (name === 'identifier' || name === 'repeatOp' || name === 'altOp') { 
		child.push(ast.allText);
	}
	obj_id++;
	return Mark(name, {$id:obj_id}, child.length ? child:null);
}

// Get the parser 
let parser = myna.parsers.ebnf;

// Parse some input and print the AST
let input = loadSource('./grammars/pascal.ebnf');

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
		var tmpl = Template.compile(loadSource('grammars/abnf_grammar.mt'));
		var output = Template.apply(tmpl, markAst).join('');  console.log('output type', typeof output);
		
		// format with prettier
		//output = prettier.format(output);  
		console.log(output);
		writeFile('grammars/_grammar_ini.js', output);
	}
}
catch(e) {
    console.log("Error occured:");
    console.log(e.toString());
}