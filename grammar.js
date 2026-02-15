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
  return alias(token(prec(10,word)), word);
};
export default grammar({
  name: "taskjuggler",
    word: $ => $.identifier,  // Add this

  conflicts: $ => [
    [$.task_id],  // May need to add more here
  ],

  extras: ($) => [
    /\s/, // whitespace
    $.comment,
  ],
  rules: {
    source_file: $ => repeat($.task),
    string: $ => choice($.stringSQ,$.stringDQ),
    stringSQ: $ => token(seq( "'", repeat(choice( /[^'\\\n]+/, seq('\\', /./) )), "'")),
    stringDQ: $ => token(seq( '"', repeat(choice( /[^"\\\n]+/, seq('\\', /./) )), '"')),
    comment: ($) =>
      token(
        choice(seq("//", /.*/), seq("/*", /[^*]*\*+([^/*][^*]*\*+)*/, "/")),
      ),
    decimal: $ =>/[0-9_\.]+/,

    date: ($) => seq(
      field('year', $.year),
      '-',
      field('month', $.month),
      '-',
      field('day', $.day)
    ),

    year: $ => /\d{4}/,
    month: $ => token(choice( seq(optional('0'), /[1-9]/), seq('1', /[0-2]/))),
    day: $ => token(choice( seq(optional('0'), /[1-9]/), seq(/[1-2]/, /\d/), seq('3', /[01]/))),

        identifier: $ => /[a-zA-X][a-z0-9A-Z_]*/,
    task_id: ($) => $.identifier,
    resource_id: ($) => $.identifier,
    macro_id: ($) => $.identifier,
    scenario_id: ($) => $.identifier,
    flag_id: ($) => $.identifier,

    taskname: $=> $.string,
    // Attributes mapped to potential CIF semantic entities
    complete: ($) => seq(kw('complete'), field('value', $.decimal)),
    priority: ($) => seq(kw('priority'), field('value', $.decimal)),
    timeunit: ($) => choice('h', 'd', 'w', 'm', 'y'),
    effort: ($) => seq(kw('effort'), field('value', $.decimal), field('unit', $.timeunit)),

    // Taskpath needs to handle the UTS concept of global vs relative addressing
    taskpath: ($) => seq(
      field('absolute', optional('!')),
      mklist1('.', $.task_id)
    ),

    depends: ($) => seq(kw('depends'), field('targets', mklist1(',', $.taskpath))),
    macro: ($) => seq('$', '{', $.macro_id, '}'),

    // Distinguish between raw IDs and macros for allocations
    allocate: ($) => seq(kw('allocate'), choice(field('resource', $.resource_id), $.macro)),

    note: ($) => seq (kw('note'), field('text',$.string)),
    journalentry: ($) => seq(
      kw('journalentry'),
      field('date', $.date),
      field('text', $.string),
      '{', '}'
    ),

    // flags: ($) => seq ( kw('flags'), mklist1(',',field('flagid',$.flag_id))),
    flags: ($) => seq ( kw('flags'), field('flagid',$.flag_id)),

    start: ($) => seq(kw('start'), field('date', $.date)),
    end: ($) => seq(kw('end'), field('date', $.date)),
    minstart: ($) => seq(kw('minstart'), field('date', $.date)),
    maxend: ($) => seq(kw('maxend'), field('date', $.date)),
    milestone: ($) => kw('milestone'),

    // Critical for Inheritance Model: Capturing scenario-specific overrides
    scenario: ($) => seq(
      field('id', $.scenario_id),
      ':',
      field('override', $.attribute)
    ),

    attribute: ($) => choice(
      $.complete,
      $.priority,
      $.effort,
      $.depends,
      $.macro,
      $.allocate,
      $.journalentry,
      $.note,
      prec(2,$.flags),
      $.start,
      $.end,
      $.minstart,
      $.maxend,
      $.scenario,
      $.milestone
    ),

    // The core task container
    task: ($) => seq(
      kw('task'),
      field('id', $.task_id),
      field('name', $.taskname),
      '{',
      repeat(choice($.attribute, $.task)),
      '}'
    ),
  }
});
