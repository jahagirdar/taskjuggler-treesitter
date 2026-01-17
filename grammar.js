/**
 * @file Treesitter grammar for Taskjuggler Tasks
 * @author Vijayvithal Jahagirdar <jahagirdar.vs@gmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const mklist1 =(sep,rule) => seq(rule,repeat(seq(sep,rule)));
const mklist =(sep,rule) => optional(mklist1(sep,rule));
function kw(word) {
  return alias(token(word), word);
};
export default grammar({
  name: "taskjuggler",

  extras: ($) => [
    /\s/, // whitespace
    $.comment,
  ],
  rules: {
    // TODO: add the actual grammar rules
    source_file: $ => repeat($.task),
    string: $ => choice($.stringSQ,$.stringDQ),
    stringSQ: $ => token(seq( "'", repeat(choice( /[^'\\\n]+/, seq('\\', /./) )), "'")),
    stringDQ: $ => token(seq( '"', repeat(choice( /[^"\\\n]+/, seq('\\', /./) )), '"')),
    comment: ($) =>
      token(
        choice(seq("//", /.*/), seq("/*", /[^*]*\*+([^/*][^*]*\*+)*/, "/")),
      ),
    _decimal: $ =>/[0-9_\.]+/,
    date: $ => seq( field('year', $.year), '-', field('month', $.month), '-', field('day', $.day)),

    // YYYY: Exactly 4 digits
    year: $ => /\d{4}/,

    // MM: 01-12
    month: $ => token(choice( seq(optional('0'), /[1-9]/), seq('1', /[0-2]/))),

    // DD: 01-31
    day: $ => token(choice( seq(optional('0'), /[1-9]/), seq(/[1-2]/, /\d/), seq('3', /[01]/))),

    resource_id: $ => /[a-zA-Z][a-z0-9A-Z_]*/,
    task_id: $ => /[a-zA-Z][a-z0-9A-Z_]*/,
    //id: $=> /[a-zA-X][a-z0-9A-Z_]*/,
    taskname: $=> $.string,
    complete: $=> seq(kw('complete'), $._decimal),
    priority:$=> seq(kw('priority'), $._decimal),
    timeunit:$=> choice('h','d','w','m','y'),
    effort:$=> seq(kw('effort'),$._decimal, $.timeunit),
    taskpath:$=>seq(optional(field('absolute','!')),mklist1('.',$.id)),
    depends:$=>seq(kw('depends'), mklist1(',',$.taskpath)),
    macro :$=> seq('$','{',$.id,'}'),
    allocate:$=> seq(kw('allocate'),choice($.id,$.macro)),
    journalentry:$=> seq(kw('journalentry'),$.date,$.string,'{','}'),
    start:$=> seq(kw('start'),$.date),
    end:$=> seq(kw('end'),$.date),
    minstart:$=> seq(kw('minstart'),$.date),
    maxend:$=> seq(kw('maxend'),$.date),
    scenario:$=>seq(field('name',$.id),':',field('value',$.attribute)),
    attribute:$=>choice($.complete,$.priority,$.effort,$.depends,$.macro,$.allocate,$.journalentry,$.start,$.end,$.minstart,$.maxend,$.scenario),
    task: $=> seq(kw('task'), $.id, $.taskname, '{', repeat(choice($.attribute,$.task)), '}'),
  }
});
