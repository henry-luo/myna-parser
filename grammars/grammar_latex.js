"use strict";

function CreateGrammar(myna) {
    // Setup a shorthand for the Myna parsing library object
    let m = myna;    

    let g = new function() {
        // These are helper rules, they do not create nodes in the parse tree.  
        this.escapedChar    = m.seq('\\', m.char("#$%^&_{}~\\"));
		
		this.text			= m.
		
		this.option			= m.advanceUntilPast("]");
		this.commandParams	= m.seq('[', this.option, ',', this.option, ']');
		this.argument		= m.advanceUntilPast("}");
		this.commandArgs	= m.seq('{', this.argument, '}')
		this.command		= m.seq('\', m.letters, this.commandParams.opt, this.commandArgs.zeroOrMore).ast;
		
		
       
		
        this.latex         = m.braced(m.delimited(this.pair.ws, this.comma)).ast;
    };

    // Register the grammar, providing a name and the default parse rule
    return m.registerGrammar("latex", g, g.latex);
};

// Export the grammar for usage by Node.js and CommonJs compatible module loaders 
if (typeof module === "object" && module.exports) 
    module.exports = CreateGrammar;