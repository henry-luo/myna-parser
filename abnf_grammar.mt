{template
	{grammar 
		'''
		"use strict";
		
		function CreateGrammar(myna) {
			let m = myna;
			let g = new function() {
			'''
			{apply to:{this.model.contents().reverse()}}
			'''
			};

			// Register the grammar, providing a name and the default parse rule
			return m.registerGrammar("abnf", g, g.grammar);
		};

		// Export the grammar for usage by Node.js and CommonJs compatible module loaders 
		if (typeof module === "object" && module.exports) 
			module.exports = CreateAbnfGrammar;
		'''
	}
	{rule
		"this." {this.model[0][0]} " = " {apply to:{this.model[1]}} ";\n"
	}
	{pattern
		'pattern'
	}
	{alternation
		'alternation'
	}
}