#!/usr/bin/env bats

setup() {
    REPO_ROOT="$(git rev-parse --show-toplevel)"
    # shellcheck source=/dev/null
    source "$REPO_ROOT/scripts/lib/parse-phrases.sh"
}

@test "parse_phrases reads EN list and outputs TSV" {
    run parse_phrases "$REPO_ROOT/references/ai-phrases-en.md"
    [ "$status" -eq 0 ]
    # 15 phrases (3 seed + 4 batch 1 + 4 batch 2 + 4 batch 3)
    [ "$(echo "$output" | wc -l | tr -d ' ')" -eq 15 ]
    # First phrase is "delve into"
    first_line="$(echo "$output" | head -1)"
    [[ "$first_line" == "delve into"* ]]
    # Each line has exactly 4 tabs (5 fields)
    tab_count="$(echo "$first_line" | tr -cd '\t' | wc -c | tr -d ' ')"
    [ "$tab_count" -eq 4 ]
}

@test "parse_phrases reads DE list and outputs TSV" {
    run parse_phrases "$REPO_ROOT/references/ai-phrases-de.md"
    [ "$status" -eq 0 ]
    # 8 phrases (3 seed + 5 batch 1)
    [ "$(echo "$output" | wc -l | tr -d ' ')" -eq 8 ]
    first_line="$(echo "$output" | head -1)"
    [[ "$first_line" == "tauchen wir ein in"* ]]
}

@test "parse_phrases extracts pattern field" {
    run parse_phrases "$REPO_ROOT/references/ai-phrases-en.md"
    [ "$status" -eq 0 ]
    # The pattern for "delve into" is "\bdelve into\b"
    [[ "$output" == *"\\bdelve into\\b"* ]]
}

@test "parse_phrases fails on missing file" {
    run parse_phrases "/nonexistent/file.md"
    [ "$status" -ne 0 ]
}
