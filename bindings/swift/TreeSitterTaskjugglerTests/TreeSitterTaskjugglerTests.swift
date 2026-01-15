import XCTest
import SwiftTreeSitter
import TreeSitterTaskjuggler

final class TreeSitterTaskjugglerTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_taskjuggler())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading Taskjuggler grammar")
    }
}
