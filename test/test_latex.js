const fs = require('fs');
const myna = require('./../myna');
const grammar = require('./../grammars/grammar_latex')(myna);
const Mark = require('mark-js');
const Template = require('mark-template');

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
	if (name === 'name' || name === 'escapedCmd' || name === 'text' || name === 'option' || name === 'argument' || name === 'amp' || name === 'end' || name === 'comment' || name === 'emptyLine') { 
		child.push(ast.allText);
	}
	obj_id++;
	return Mark(name, {$id:obj_id}, child.length ? child:null);
}

// Get the parser 
let parser = myna.parsers.latex;

// Parse some input and print the AST
// loadSource('./grammars/abnf.abnf');
// let input = loadSource('./grammars/abnf.abnf');
let input = loadSource('./test/input/caption.tex');

try {
    var ast = parser(input);
	if (ast == null) {
		console.log("input does not match grammar");
	} else {
		// issue: input might not be fully parsed when the parsing ends
		let markAst = buildAst(ast);
		console.log(Mark.stringify(markAst, {space:'  '}));
		
		// transform the AST back into Latex source
		var tmpl = Template.compile(loadSource('./test/latex.mt'));
		var output = Template.apply(tmpl, markAst).join('');
		console.log(output);
		writeFile('test/input/_latex.tex', output);		
	}
}
catch(e) {
    console.log("Error occured:");
    console.log(e.toString());
}