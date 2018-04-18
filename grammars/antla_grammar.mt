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
			return m.registerGrammar("''' {this.model.name} '", g, g.' {this.model[0][0][0]} ''');
		};

		// Export the grammar for usage by Node.js and CommonJs compatible module loaders 
		if (typeof module === "object" && module.exports) 
			module.exports = CreateGrammar;
		'''
	}
	
	{rule
		"this." 
		{this.model[0][0]} " = " {apply to:{this.model[2]}}
		{if is:{this.model[1][0] === '\:'}
			".ast"
		}
		";\n"
	}
	
	{pattern
		"m." {this.model.filter(r => r.constructor && r.constructor.name == 'alternation').length && 'choice' || 'seq'} "("
		{for each:'r' of:{this.model}
			{if not:{Object.is(r, this.model[0])} 
				", "
			}
			{apply to:{r}}
		}
		")"
	}
	
	{option
		{apply} ".opt"
	}
	
	{alternation
		{apply}
	}
	
	{repetition
		{if is:{this.model[0].constructor && this.model[0].constructor.name == 'repeat'}
			{apply to:{this.model[1]}}
			{if is:{this.model[0][0] === '1*'}
				'.oneOrMore'
			}
			{else if:{this.model[0][0] === '*'}
				'.zeroOrMore'
			}
			{else
				{this.model[0][0]}
			}
		}
		{else 
			{apply}
		}
	}
	
	{repeat
		{apply}
	}

	{string
		{if is:{this.model[0] === "'"}
			"\\'"
		}
		{else if:{this.model[0] === "\t"}  "\\t"}
		{else if:{this.model[0] === "\r"}  "\\r"}
		{else if:{this.model[0] === "\n"}  "\\n"}
		{else if:{this.model[0] === "\\"}  "\\\\"}
		{else {apply}}		
	}
	
	{rulename
		'this.' {apply}
	}
}