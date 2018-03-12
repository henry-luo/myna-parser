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
		"m." {this.model.filter(r => r.constructor && r.constructor.name == 'alternation').length && 'seq' || 'choice'} "("
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
			{if is:{this.model[0][0] == '1*'}
				'.oneOrMore'
			}
			{else if:{this.model[0][0] == '*'}
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
	
	{char_val
		{apply}
	}

	{char
		{if is:{this.ch === "'"}
			"\\'"
		}
		{else if:{this.ch === "\t"}  "\\t"}
		{else if:{this.ch === "\r"}  "\\r"}
		{else if:{this.ch === "\n"}  "\\n"}
		{else if:{this.ch === "\\"}  "\\\\"}
		{else {this.ch}}		
	}
	
	{num_val
		// {this.model[0]}
		// this.model[0].startsWith('%d') && 
		{if is:{this.model[0].indexOf('-')>0}
			// todo: should ensure char in range 32 - 126 inclusive
			"m.range('"
			{char ch:{String.fromCharCode(this.model[0].substring(2, this.model[0].indexOf('-')))}}
			"','"
			{char ch:{String.fromCharCode(this.model[0].substr(this.model[0].indexOf('-')+1))}}
			"')"
		}
		{else
			{let ch:{this.model[0].substr(2)}
				"'"
				{if is:{ch.indexOf('.')>=0}
					{for each:'c' of:{ch.split('.')}
						{char ch:{String.fromCharCode(c)}}
					}
				}
				{else 
					{char ch:{String.fromCharCode(ch)}}
				}
				"'"
			}
		}
	}
	
	{rulename
		'this.' {apply}
	}
}