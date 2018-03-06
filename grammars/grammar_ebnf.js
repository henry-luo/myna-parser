"use strict";

// Implements a EBNF grammar using the Myna parsing library
// See https://www.w3.org/TR/2004/REC-xml11-20040204/#sec-notation
function CreateEbnfGrammar(myna) {
    // Setup a shorthand for the Myna parsing library object
    let m = myna;    

    let g = new function() 
    {
        // comment and whitespace 
        this.comment    	= m.seq("/*", m.advanceUntilPast("*/"));
        this.ws             = this.comment.or(m.atWs.then(m.advance)).zeroOrMore;	
	
		// char class
		this.rangChar		= m.letter.or(m.digit);
		this.charRange		= m.seq(this.rangChar, '-', this.rangChar);
		this.hashChar		= m.seq('#x', m.hexDigit.oneOrMore);
		this.hashRange		= m.seq('#', this.hashChar, '-', this.hashChar);
		this.rangeSeq		= m.choice(this.hashRange, this.charRange).oneOrMore;
		this.charSeq		= m.notChar('-]'); 
		
		this.includeClass	= m.choice(this.rangeSeq, this.charSeq).ast;
		this.excludeClass	= m.seq('^', m.choice(this.hashRange, this.charRange, this.charSeq)).ast;
		this.charClass		= m.seq("[", m.choice(this.excludeClass, this.includeClass), "]");
		
        // literal string
        this.singleQuoteStr = m.singleQuoted(m.notChar("'").oneOrMore);
		this.doubleQuoteStr = m.doubleQuoted(m.notChar('"').oneOrMore);
		this.string			= m.choice(this.singleQuoteStr, this.doubleQuoteStr).ast;

		// patterns 
		this.group			= m.parenthesized(this.string); // this.pattern - recursion
		this.term			= m.choice(this.group, this.string, this.charClass);
		this.repeat			= m.seq(this.term, m.char('?+*').opt);
		this.concat			= m.repeat.oneOrMore;
		this.alternate		= m.choice(m.seq('|', this.concat), m.seq('-', this.concat));  // precedence of exclusion '-' not clear
		this.pattern 		= m.seq(this.concat, this.alternate.zeroOrMore).ast;
		/*
        let _this = this;
        this.value = m.choice(this.string, this.bool, this.null, this.number, 
            // Using a lazy evaluation rule to allow recursive rule definitions  
            m.delay(function() { return m.choice(_this.object, _this.array); 
        }));
		*/
		
		this.identifier		= m.choice(this.letter, '_', this.digit).oneOrMore;
		this.rule 			= m.seq(this.ws, this.identifier, this.ws, '::=', this.ws, this.pattern, this.ws);
		this.grammar		= this.rule.oneOrMore;
    };

    // Register the grammar, providing a name and the default parse rule
    return m.registerGrammar("ebnf", g, g.grammar);
};

// Export the grammar for usage by Node.js and CommonJs compatible module loaders 
if (typeof module === "object" && module.exports) 
    module.exports = CreateEbnfGrammar;