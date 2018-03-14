"use strict";

function CreateGrammar(myna) {
    // Setup a shorthand for the Myna parsing library object
    let m = myna;    

    let g = new function() {
		// tex command
		this.option			= m.advanceUntilPast("]").ast;
		this.params			= m.seq('[', this.option, m.seq(',', this.option).zeroOrMore, ']').opt;
		this.argument		= m.seq('{', m.advanceUntilPast("}")).ast; // it seems {} can be nested in argument
		this.name			= m.letters.ast;
		this.command		= m.seq(m.not('end{'), this.name, this.params.opt, this.argument.zeroOrMore).ast;
		
        this.escapedChar    = m.seq('\\', m.char("#$%^&_{}~\\"), this.argument.opt).ast;  // escapedChar rule not very solid
		this.comment		= m.seq('%', m.advanceUntilPast(m.newLine), m.char(" \t").zeroOrMore);
		this.text			= m.notChar("#$%^&_{}~\\").oneOrMore.ast;
		
		// high-level structures
		let _this = this;
		this.group			= m.seq('{', m.delay(function() { return _this.latex; }), '}').ast;
		this.environment	= m.seq('begin', this.argument, m.delay(function() { return _this.latex; }), '\\end', this.argument).ast;
		this.escaped		= m.seq('\\', m.choice(this.environment, this.command, this.escapedChar));
		
        this.latex			= m.choice(this.escaped, this.group, this.comment, this.text).zeroOrMore.ast;
    };

    // Register the grammar, providing a name and the default parse rule
    return m.registerGrammar("latex", g, g.latex);
};

// Export the grammar for usage by Node.js and CommonJs compatible module loaders 
if (typeof module === "object" && module.exports) 
    module.exports = CreateGrammar;