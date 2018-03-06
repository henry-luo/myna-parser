// Reference the Myna module
var m = require('./myna');

// Construct Mark grammar object 
var g = new function() {
	// These are helper rules, they do not create nodes in the parse tree.  
	this.escapedChar    	= m.seq('\\', m.advance);
    this.doubleQuoteChar	= m.choice(this.escapedChar, m.notChar('"'));
	this.singleQuoteChar	= m.choice(this.escapedChar, m.notChar("'"));
	this.fraction       	= m.seq(".", m.digit.zeroOrMore);    
	this.plusOrMinus    	= m.char("+-");
	this.exponent       	= m.seq(m.char("eE"), this.plusOrMinus.opt, m.digits); 
	this.comma          	= m.char(",").ws;  

	// The following rules create nodes in the abstract syntax tree     
	this.string         	= m.choice(m.singleQuoted(this.singleQuoteChar.zeroOrMore), m.doubleQuoted(this.doubleQuoteChar.zeroOrMore)).ast;
	this.null           	= m.keyword("null").ast;
	this.bool           	= m.keywords("true", "false").ast;
	this.number         	= m.seq(this.plusOrMinus.opt, m.integer, this.fraction.opt, this.exponent.opt).ast;
		
	let _this = this;
	this.value = m.choice(this.string, this.bool, this.null, this.number, 
		// Using a lazy evaluation rule to allow recursive rule definitions  
		m.delay(function() { return m.choice(_this.object, _this.array); 
	}));

	this.pair           	= m.seq(this.string, m.ws, ":", m.ws, this.value.ws).ast;
	this.array          	= m.bracketed(m.delimited(this.value.ws, this.comma)).ast;
	this.object         	= m.braced(m.delimited(this.pair.ws, this.comma)).ast;
}

// Let consumers of the Myna module access 
m.registerGrammar("json", g, g.object);

// Get the parser 
var parser = m.parsers.json; 

// Parse some input and print the AST
var input = `{"prop":123, 'prop2':"abc"}`;
try {
    var ast = parser(input);
    console.log(ast);
}
catch(e) {
    console.log("Error occured:");
    console.log(e.toString());
}