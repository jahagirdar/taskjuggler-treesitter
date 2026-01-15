/**
 * @file Treesitter grammar for Taskjuggler Tasks
 * @author Vijayvithal Jahagirdar <jahagirdar.vs@gmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

export default grammar({
  name: "taskjuggler",

  rules: {
    // TODO: add the actual grammar rules
    source_file: $ => "hello"
  }
});
