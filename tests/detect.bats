#!/usr/bin/env bats

setup() {
    REPO_ROOT="$(git rev-parse --show-toplevel)"
}

@test "detect.sh finds 'delve into' in EN positive fixture" {
    run "$REPO_ROOT/scripts/detect.sh" \
        "$REPO_ROOT/tests/fixtures/en-positive/delve-into.md" \
        "$REPO_ROOT/references/ai-phrases-en.md"
    [ "$status" -eq 0 ]
    # Output should contain the phrase
    [[ "$output" == *"delve into"* ]]
    # Output should contain "tapestry" (also in fixture)
    [[ "$output" == *"tapestry"* ]]
}

@test "detect.sh produces no findings for EN negative fixture" {
    run "$REPO_ROOT/scripts/detect.sh" \
        "$REPO_ROOT/tests/fixtures/en-negative/clean-pre-2023.md" \
        "$REPO_ROOT/references/ai-phrases-en.md"
    [ "$status" -eq 0 ]
    [ -z "$output" ]
}

@test "detect.sh outputs line numbers" {
    run "$REPO_ROOT/scripts/detect.sh" \
        "$REPO_ROOT/tests/fixtures/en-positive/delve-into.md" \
        "$REPO_ROOT/references/ai-phrases-en.md"
    [ "$status" -eq 0 ]
    # First column of any output line is a number
    first_field="$(echo "$output" | head -1 | cut -f1)"
    [[ "$first_field" =~ ^[0-9]+$ ]]
}

@test "detect.sh fails on missing input file" {
    run "$REPO_ROOT/scripts/detect.sh" \
        "/nonexistent.md" \
        "$REPO_ROOT/references/ai-phrases-en.md"
    [ "$status" -ne 0 ]
}

@test "detect.sh DE list finds 'tauchen wir ein' in DE fixture" {
    run "$REPO_ROOT/scripts/detect.sh" \
        "$REPO_ROOT/tests/fixtures/de-positive/tauchen-wir-ein.md" \
        "$REPO_ROOT/references/ai-phrases-de.md"
    [ "$status" -eq 0 ]
    [[ "$output" == *"tauchen wir ein in"* ]]
}

@test "detect.sh auto-mode picks EN for English fixture" {
    run "$REPO_ROOT/scripts/detect.sh" \
        "$REPO_ROOT/tests/fixtures/en-positive/delve-into.md"
    [ "$status" -eq 0 ]
    [[ "$output" == *"delve into"* ]]
    [[ "$output" == *"# language: en"* ]]
}

@test "detect.sh auto-mode picks DE for German fixture" {
    run "$REPO_ROOT/scripts/detect.sh" \
        "$REPO_ROOT/tests/fixtures/de-positive/tauchen-wir-ein.md"
    [ "$status" -eq 0 ]
    [[ "$output" == *"tauchen wir ein in"* ]]
    [[ "$output" == *"# language: de"* ]]
}

@test "detect.sh auto-mode reports zero findings for clean text" {
    run "$REPO_ROOT/scripts/detect.sh" \
        "$REPO_ROOT/tests/fixtures/en-negative/clean-pre-2023.md"
    [ "$status" -eq 0 ]
    [[ "$output" == *"# language: "* ]]
    [[ "$output" == *"# findings: 0"* ]]
}
