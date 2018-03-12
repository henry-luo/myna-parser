"use strict";

// Implements a EBNF grammar using the Myna parsing library
// See https://www.w3.org/TR/2004/REC-xml11-20040204/#sec-notation
function CreateAbnfGrammar(myna) {
    // Setup a shorthand for the Myna parsing library object
    let m = myna;    

    let g = new function() {		
		// comment and whitespace
		this.WSP            =  m.char(" \t");  /* white space SP / HTAB */
		// comment        	=  ";" *(WSP / VCHAR) CRLF
		this.comment    	= m.seq(";", m.advanceUntilPast(m.newLine));
		this.c_nl           =  m.choice(m.newLine, this.comment); /* comment or newline */
		this.c_wsp          =  m.choice(this.WSP, m.seq(this.c_nl, this.WSP)).zeroOrMore;
		
		// terminals
		// prose-val      	=  "<" *(%x20-3D / %x3F-7E) ">"
		this.prose_val      =  m.tagged(m.notChar('>').zeroOrMore).ast; /* bracketed string of SP and VCHAR without angles prose description, to be used as last resort */
		this.hex_val        =  m.seq("x", m.hexDigit.oneOrMore, m.choice(m.seq(".", m.hexDigit.oneOrMore).oneOrMore, m.seq("-", m.hexDigit.oneOrMore)).opt);
		this.dec_val        =  m.seq("d", m.digit.oneOrMore, m.choice(m.seq(".", m.digit.oneOrMore).oneOrMore, m.seq("-", m.digit.oneOrMore)).opt);
		this.bin_val        =  m.seq("b", m.binaryDigit.oneOrMore, m.choice(m.seq(".", m.binaryDigit.oneOrMore).oneOrMore, m.seq("-", m.binaryDigit.oneOrMore)).opt); /* series of concatenated bit values or single ONEOF range */
		this.num_val        =  m.seq("%", m.choice(this.bin_val, this.dec_val, this.hex_val)).ast;
		// char-val       	=  DQUOTE *(%x20-21 / %x23-7E) DQUOTE
		this.char_val       =  m.doubleQuoted(m.notChar('"').oneOrMore).ast; /* quoted string of SP and VCHAR without DQUOTE */
		
		this.rulename       =  m.seq(m.letter, m.choice(m.letter, m.digit, "-").zeroOrMore).ast;
		
		// patterns
		let _this = this;
		this.option         =  m.seq("[", this.c_wsp, m.delay(function() { return _this.pattern; }), this.c_wsp, "]").ast;
		this.group          =  m.seq("(", this.c_wsp, m.delay(function() { return _this.pattern; }), this.c_wsp, ")");		
		this.element        =  m.choice(this.rulename, this.group, this.option, this.char_val, this.num_val, this.prose_val);
		this.repeat         =  m.choice(m.seq(m.digit.zeroOrMore, "*", m.digit.zeroOrMore), m.digit.oneOrMore).ast;
		this.repetition     =  m.seq(this.repeat.opt, this.element).ast;
		this.concatenation  =  m.seq(this.repetition, m.seq(this.c_wsp, this.repetition).zeroOrMore);
		this.alternation	=  m.seq(this.c_wsp, "/", this.c_wsp, this.concatenation).ast;
		this.pattern    	=  m.seq(this.concatenation, this.alternation.zeroOrMore).ast;
		
		// rule
		this.defined_as     =  m.seq(this.c_wsp, m.choice("=/", "="), this.c_wsp); /* basic rules definition and incremental alternatives */
		this.rule           =  m.seq(this.rulename, this.defined_as, this.pattern, this.c_wsp, this.c_nl).ast; /* continues if next line starts with white space */
		this.grammar		=  m.choice(this.rule, m.seq(this.c_wsp, this.c_nl)).oneOrMore.ast;
    };

    // Register the grammar, providing a name and the default parse rule
    return m.registerGrammar("abnf", g, g.grammar);
};

// Export the grammar for usage by Node.js and CommonJs compatible module loaders 
if (typeof module === "object" && module.exports) 
    module.exports = CreateAbnfGrammar;