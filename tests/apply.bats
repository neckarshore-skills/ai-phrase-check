#!/usr/bin/env bats

setup() {
    REPO_ROOT="$(git rev-parse --show-toplevel)"
    TMP_INPUT="$(mktemp)"
    TMP_SUBS="$(mktemp)"
}

teardown() {
    rm -f "$TMP_INPUT" "$TMP_SUBS"
}

@test "apply.sh substitutes a single phrase" {
    cat > "$TMP_INPUT" <<EOF
We will delve into the system.
EOF
    cat > "$TMP_SUBS" <<EOF
\bdelve into\b	explore
EOF
    run "$REPO_ROOT/scripts/apply.sh" "$TMP_INPUT" "$TMP_SUBS"
    [ "$status" -eq 0 ]
    [[ "$output" == *"We will explore the system."* ]]
}

@test "apply.sh substitutes multiple phrases" {
    cat > "$TMP_INPUT" <<EOF
We will delve into the tapestry of ideas.
EOF
    cat > "$TMP_SUBS" <<EOF
\bdelve into\b	explore
\btapestry\b	mix
EOF
    run "$REPO_ROOT/scripts/apply.sh" "$TMP_INPUT" "$TMP_SUBS"
    [ "$status" -eq 0 ]
    [[ "$output" == *"explore"* ]]
    [[ "$output" == *"mix"* ]]
}

@test "apply.sh leaves unmatched text unchanged" {
    cat > "$TMP_INPUT" <<EOF
This text has no AI tells.
EOF
    cat > "$TMP_SUBS" <<EOF
\bdelve into\b	explore
EOF
    run "$REPO_ROOT/scripts/apply.sh" "$TMP_INPUT" "$TMP_SUBS"
    [ "$status" -eq 0 ]
    [[ "$output" == *"This text has no AI tells."* ]]
}

@test "apply.sh fails on missing input" {
    cat > "$TMP_SUBS" <<EOF
\bdelve into\b	explore
EOF
    run "$REPO_ROOT/scripts/apply.sh" "/nonexistent.md" "$TMP_SUBS"
    [ "$status" -ne 0 ]
}
