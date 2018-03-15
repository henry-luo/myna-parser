{template

	{comment
		{apply}
	}
	{text
		{apply}
	}
	{amp
		'&'
	}
	{escapedCmd
		'\\' {apply}
	}
	{emptyLine
		{apply}
	}
	
	{argument
		{apply}
	}
	{option
		{apply}
	}
	{params
		'[' {apply} ']'
	}
	{name 
		{apply}
	}
	
	{command
		'\\' {apply}
	}
	{group
		'{' {apply} '}'
	}
	
	{start
		'\\begin{' {apply} '}'
	}
	{end
		'\\end{' {apply} '}'
	}
	{environment
		{apply}
	}
	
	{latex
		{apply}
	}
}