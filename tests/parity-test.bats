#!/usr/bin/env bats

setup() {
    REPO_ROOT="$(git rev-parse --show-toplevel)"
}

assert_parity_for_dir() {
    for fixture in "$REPO_ROOT"/tests/fixtures/"$1"/*.md; do
        bash_out="$("$REPO_ROOT/scripts/detect.sh" "$fixture")"
        js_out="$(cd "$REPO_ROOT/web" && npx tsx "$REPO_ROOT/tests/run-js-detect.mjs" "$fixture")"
        if [ "$bash_out" != "$js_out" ]; then
            echo "PARITY FAILURE on $fixture" >&2
            echo "===== BASH =====" >&2
            echo "$bash_out" >&2
            echo "===== JS =====" >&2
            echo "$js_out" >&2
            return 1
        fi
    done
}

@test "parity: EN positive fixtures" { assert_parity_for_dir en-positive; }
@test "parity: DE positive fixtures" { assert_parity_for_dir de-positive; }
@test "parity: EN negative fixtures" { assert_parity_for_dir en-negative; }
@test "parity: DE negative fixtures" { assert_parity_for_dir de-negative; }
