"use strict";

// Implements a EBNF grammar using the Myna parsing library
// See https://www.w3.org/TR/2004/REC-xml11-20040204/#sec-notation
function CreateEbnfGrammar(myna) {
    // Setup a shorthand for the Myna parsing library object
    let m = myna;    

    let g = new function() {
        // comment and whitespace 
        this.comment    	= m.seq("/*", m.advanceUntilPast("*/"));
        this.ws             = m.char(" \t").or(m.seq(m.choice('\n','\r\n'), m.char(" \t"))).or(this.comment).zeroOrMore;
		
		// char class
		this.rangChar		= m.letter.or(m.digit);
		this.charRange		= m.seq(this.rangChar, '-', this.rangChar);
		this.hashChar		= m.seq('#x', m.hexDigit.oneOrMore);
		this.hashRange		= m.seq('#', this.hashChar, '-', this.hashChar);
		this.rangeSeq		= m.choice(this.hashRange, this.charRange).oneOrMore;
		this.charSeq		= m.notChar('-]'); 
		
		this.includeChar	= m.choice(this.rangeSeq, this.charSeq).ast;
		this.excludeChar	= m.seq('^', m.choice(this.hashRange, this.charRange, this.charSeq)).ast;
		this.charClass		= m.seq("[", m.choice(this.excludeChar, this.includeChar), "]");
		
        // literal string
        this.singleQuoteStr = m.singleQuoted(m.notChar("'").oneOrMore);
		this.doubleQuoteStr = m.doubleQuoted(m.notChar('"').oneOrMore);
		this.string			= m.choice(this.singleQuoteStr, this.doubleQuoteStr).ast;

		this.identifier		= m.seq(m.letter, m.choice(m.letter, '_', '-', m.digit).oneOrMore).ast;
		
		// patterns 
        let _this = this;
        this.group 			= m.seq('(', this.ws, m.delay(function() { return _this.pattern; }), ')');  // using a lazy evaluation rule to allow recursive rule definitions  
		this.term			= m.choice(this.identifier, this.group, this.string, this.charClass);
		this.repeatOp		= m.char('?+*').ast;
		this.repeat			= m.seq(this.term, this.repeatOp.opt, this.ws);
		this.concat			= this.repeat.oneOrMore;
		this.altOp			= m.choice('|','-').ast;
		this.alternate		= m.seq(this.altOp, this.ws, this.concat);  // precedence of exclusion '-' not clear in XML spec, we make it same as '|', to make the tree more flat
		this.pattern 		= m.seq(this.concat, this.alternate.zeroOrMore).ast;
		
		this.defined_as     =  m.choice("::=", ":=", "=").ast;
		this.rule 			= m.seq(this.identifier, this.ws, this.defined_as, this.ws, this.pattern, m.newLine).ast;  // end each rule with newLine, makes the syntax more orthogonal/robust/simpler
		this.grammar		= m.choice(this.rule, m.seq(this.ws, m.newLine)).oneOrMore.ast;
    };

    // Register the grammar, providing a name and the default parse rule
    return m.registerGrammar("ebnf", g, g.grammar);
};

// Export the grammar for usage by Node.js and CommonJs compatible module loaders 
if (typeof module === "object" && module.exports) 
    module.exports = CreateEbnfGrammar;