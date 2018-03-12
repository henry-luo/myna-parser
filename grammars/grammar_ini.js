"use strict";

function CreateGrammar(myna) {
  let m = myna;
  let g = new function() {
    this.any = m.choice(m.range(" ", "~"), "\t");
    this.digit = m.seq(m.range("0", "9"));
    this.alpha = m.choice(m.range("A", "Z"), m.range("a", "z"));
    this.wsp = m.seq(m.choice(" ", "\t").zeroOrMore);
    this.comment = m.seq(m.choice(";", "#"), this.any.zeroOrMore);
    this.LineEnd = m.choice("\r\n", "\n", "\r");
    this.BadBlankLine = m.seq(
      m.choice(" ", "\t"),
      this.wsp,
      m.choice(m.range("!", ":"), m.range("<", "~")),
      this.any.zeroOrMore,
      this.LineEnd
    );
    this.GoodBlankLine = m.seq(this.wsp, m.seq(this.comment).opt, this.LineEnd);
    this.BlankLine = m.choice(this.GoodBlankLine, this.BadBlankLine);
    this.AlphaDigit = m.seq(m.choice(this.alpha, this.digit).oneOrMore);
    this.SQuotedString = m.seq(
      "'",
      m.choice(m.range(" ", "&"), m.range("(", "~")).oneOrMore,
      "'"
    );
    this.DQuotedString = m.seq(
      '"',
      m.choice(m.range(" ", "!"), m.range("#", "~")).oneOrMore,
      '"'
    );
    this.Value = m.choice(
      this.DQuotedString,
      this.SQuotedString,
      this.AlphaDigit
    ).ast;
    this.KeyName = m.seq(
      m.choice(this.alpha, "_"),
      m.choice(this.alpha, this.digit, "_").zeroOrMore
    ).ast;
    this.SectionName = m.seq(
      m.choice(this.alpha, "_"),
      m.choice(this.alpha, this.digit, "_").zeroOrMore
    );
    this.ValueArray = m.seq(
      this.Value,
      m.seq(this.wsp, ",", this.wsp, this.Value).zeroOrMore
    );
    this.BadValueLine = m.seq(
      m.choice(m.range("!", "Z"), m.range("\\", "~")),
      this.any.zeroOrMore,
      this.LineEnd
    );
    this.GoodValueLine = m.seq(
      this.KeyName,
      this.wsp,
      "=",
      this.wsp,
      this.ValueArray,
      this.wsp,
      m.seq(this.comment).opt,
      this.LineEnd
    );
    this.ValueLine = m.choice(this.GoodValueLine, this.BadValueLine).ast;
    this.BadSectionLine = m.seq("[", this.any.zeroOrMore, this.LineEnd);
    this.GoodSectionLine = m.seq(
      "[",
      this.wsp,
      this.SectionName,
      this.wsp,
      "]",
      this.wsp,
      m.seq(this.comment).opt,
      this.LineEnd
    );
    this.SectionLine = m.choice(this.GoodSectionLine, this.BadSectionLine);
    this.Section = m.seq(
      this.SectionLine,
      m.choice(this.BlankLine, this.ValueLine).zeroOrMore
    );
    this.IniFile = m.seq(
      m.choice(this.BlankLine, this.ValueLine).zeroOrMore,
      this.Section.zeroOrMore
    ).ast;
  }();

  // Register the grammar, providing a name and the default parse rule
  return m.registerGrammar("ini", g, g.IniFile);
}

// Export the grammar for usage by Node.js and CommonJs compatible module loaders
if (typeof module === "object" && module.exports)
  module.exports = CreateGrammar;
