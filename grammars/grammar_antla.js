"use strict";

// Implements a EBNF grammar using the Myna parsing library
// See https://www.w3.org/TR/2004/REC-xml11-20040204/#sec-notation
function CreateGrammar(myna) {
    // Setup a shorthand for the Myna parsing library object
    let m = myna;    

    let g = new function() {
        // comment and whitespace 
        this.comment    	= m.choice(m.seq("/*", m.advanceUntilPast("*/")), m.seq('//', m.advanceUntilPast("\n")));
        this.ws             = m.choice(m.char(" \t\r\n"), this.comment).zeroOrMore;
		
		// char class
		this.escape			= m.seq('\\', m.choice(m.char('\\trn\'"'), m.seq('u', m.hexDigit, m.hexDigit, m.hexDigit, m.hexDigit)));
		this.string 		= m.singleQuoted(m.choice(this.escape, m.notChar("\\'")).oneOrMore).ast;
		this.charRange		= m.seq('(', this.string, '..', this.string, ')');
		this.identifier		= m.seq(m.letter, m.choice(m.letter, '_', '-', m.digit).oneOrMore).ast;
		
		// patterns 
        let _this = this;
        this.group 			= m.seq('(', this.ws, m.delay(function() { return _this.pattern; }), ')');  // using a lazy evaluation rule to allow recursive rule definitions  
		this.term			= m.choice(this.identifier, this.group, this.string, this.charRange);
		this.repeatOp		= m.char('?+*').ast;
		this.repeat			= m.seq(this.term, this.repeatOp.opt, this.ws);
		this.concat			= this.repeat.oneOrMore;
		this.altOp			= '|'; // m.choice('|','-').ast;
		this.alternate		= m.seq(this.altOp, this.ws, this.concat);
		this.pattern 		= m.seq(this.concat, this.alternate.zeroOrMore).ast;
		
		this.defined_as     = ":";
		this.rule 			= m.seq(this.ws, this.identifier, this.ws, this.defined_as, this.ws, this.pattern, this.ws, ';', this.ws,).ast;  // end each rule with newLine, makes the syntax more orthogonal/robust/simpler
		this.grammar		= this.rule.oneOrMore.ast;
    };

    // Register the grammar, providing a name and the default parse rule
    return m.registerGrammar("antla", g, g.grammar);
};

// Export the grammar for usage by Node.js and CommonJs compatible module loaders 
if (typeof module === "object" && module.exports) 
    module.exports = CreateGrammar;