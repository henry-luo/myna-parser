// Reference the Myna module
var myna = require('./myna');
var grammar = require('./grammars/grammar_ebnf')(myna);

// Get the parser 
var parser = myna.parsers.ebnf; 

// Parse some input and print the AST
var input = `
	Query	  ::=  	Prologue
`;
try {
    var ast = parser(input);
    console.log(ast);
}
catch(e) {
    console.log("Error occured:");
    console.log(e.toString());
}