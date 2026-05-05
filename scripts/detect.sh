#!/usr/bin/env bash
# detect.sh — Stage 1 phrase detection
#
# Usage: detect.sh <input-file> <list-file>
# Output (TSV, one per finding): line_number\tphrase\tseverity\tcategory\tmatched_text
#
# Exit codes:
#   0 — completed (output may be empty, that's OK)
#   1 — input file missing or unreadable
#   2 — list file missing or parse error

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/parse-phrases.sh
source "$SCRIPT_DIR/lib/parse-phrases.sh"

main() {
    local input_file="${1:?usage: detect.sh <input-file> <list-file>}"
    local list_file="${2:?usage: detect.sh <input-file> <list-file>}"

    if [[ ! -f "$input_file" ]]; then
        echo "detect.sh: input file not found: $input_file" >&2
        return 1
    fi

    if [[ ! -f "$list_file" ]]; then
        echo "detect.sh: list file not found: $list_file" >&2
        return 2
    fi

    # Stream phrases from the list. For each, scan the input with grep -nE.
    # grep returns 1 when nothing matches — that is not a failure here, so
    # we capture non-zero with `|| true`.
    while IFS=$'\t' read -r phrase _language severity category pattern; do
        # grep -n: line number; -E: extended regex; -o: only matched text
        # Output of grep -nEo: "lineNum:matched"
        local matches
        matches="$(grep -nEo "$pattern" "$input_file" 2>/dev/null || true)"
        if [[ -n "$matches" ]]; then
            while IFS=: read -r line_num matched; do
                printf '%s\t%s\t%s\t%s\t%s\n' \
                    "$line_num" "$phrase" "$severity" "$category" "$matched"
            done <<< "$matches"
        fi
    done < <(parse_phrases "$list_file")
}

main "$@"
