package tree_sitter_taskjuggler_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_taskjuggler "git@github.com:jahagirdar/taskjuggler-treesitter.git/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_taskjuggler.Language())
	if language == nil {
		t.Errorf("Error loading Taskjuggler grammar")
	}
}
