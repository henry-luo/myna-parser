"use strict";

function CreateGrammar(myna) {
    // Setup a shorthand for the Myna parsing library object
    let m = myna;    

    let g = new function() {
		this.escapedChar    = m.char("#$%^&_{}~\\");  // escapedChar rule not very solid
		this.emptyLine		= m.seq(m.char(" \t").zeroOrMore, m.newLine).ast;
		this.emptyLines		= this.emptyLine.zeroOrMore;
		
		// command
		this.option			= m.notChar(",]").oneOrMore.ast;
		this.params			= m.seq('[', this.option.opt, m.seq(',', this.option).zeroOrMore, ']').ast;
		this.end			= m.seq('{', m.letters, '}').ast;
		this.argument		= m.seq('{', m.choice(m.notChar("\\}").oneOrMore, m.seq('\\', this.escapedChar)).zeroOrMore, '}').ast; // it seems {} can be nested in argument
		this.name			= m.letters.ast;
		this.command		= m.seq(m.not('end{'), this.name, this.params.opt, this.argument.zeroOrMore, this.emptyLines).ast;
		
		// comment and text
		this.comment		= m.seq('%', m.advanceUntilPast(m.newLine)).ast;
		this.text			= m.notChar("#$%^&_{}~\\").oneOrMore.ast;
		this.amp			= m.text('&').ast;
		
		// high-level structures
		let _this = this;
		this.group			= m.seq('{', m.delay(function() { return _this.latex; }), '}').ast;
		this.environment	= m.seq('begin', this.argument, this.params.opt, m.delay(function() { return _this.latex; }), '\\end', this.end, this.emptyLines).ast;
		this.escapedCmd		= m.seq(this.escapedChar, this.argument.opt).ast;  
		this.escaped		= m.seq('\\', m.choice(this.environment, this.command, this.escapedCmd));
		
        this.latex			= m.choice(this.escaped, this.group, m.seq(this.comment, this.emptyLines), this.amp, this.text).zeroOrMore.ast;
    };

    // Register the grammar, providing a name and the default parse rule
    return m.registerGrammar("latex", g, g.latex);
};

// Export the grammar for usage by Node.js and CommonJs compatible module loaders 
if (typeof module === "object" && module.exports) 
    module.exports = CreateGrammar;