#!/usr/bin/env bash
# detect.sh — Stage 1 phrase detection
#
# Usage:
#   detect.sh <input-file>                 # auto-detect language
#   detect.sh <input-file> <list-file>     # explicit list
#
# Output (TSV, one per finding): line_number\tphrase\tseverity\tcategory\tmatched_text
# In auto-mode, output starts with metadata comments:
#   # language: en|de
#   # findings: <count>
#
# Exit codes: 0 ok, 1 input missing, 2 list missing

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
# shellcheck source=lib/parse-phrases.sh
source "$SCRIPT_DIR/lib/parse-phrases.sh"

scan_with_list() {
    local input_file="$1"
    local list_file="$2"

    while IFS=$'\t' read -r phrase _language severity category pattern; do
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

main() {
    local input_file="${1:?usage: detect.sh <input-file> [<list-file>]}"

    if [[ ! -f "$input_file" ]]; then
        echo "detect.sh: input file not found: $input_file" >&2
        return 1
    fi

    # Two-arg explicit-list mode
    if [[ $# -ge 2 ]]; then
        local list_file="$2"
        if [[ ! -f "$list_file" ]]; then
            echo "detect.sh: list file not found: $list_file" >&2
            return 2
        fi
        scan_with_list "$input_file" "$list_file"
        return 0
    fi

    # Auto-detect mode: scan with both lists, pick the one with more findings
    local en_list="$REPO_ROOT/references/ai-phrases-en.md"
    local de_list="$REPO_ROOT/references/ai-phrases-de.md"

    local en_findings de_findings
    en_findings="$(scan_with_list "$input_file" "$en_list")"
    de_findings="$(scan_with_list "$input_file" "$de_list")"

    local en_count de_count
    en_count="$(printf '%s' "$en_findings" | grep -c . || true)"
    de_count="$(printf '%s' "$de_findings" | grep -c . || true)"

    local picked_language picked_findings picked_count
    if [[ "$de_count" -gt "$en_count" ]]; then
        picked_language="de"
        picked_findings="$de_findings"
        picked_count="$de_count"
    else
        # Tie or EN-leading goes to EN. Stage 2 LLM resolves true ties downstream.
        picked_language="en"
        picked_findings="$en_findings"
        picked_count="$en_count"
    fi

    echo "# language: $picked_language"
    echo "# findings: $picked_count"
    if [[ -n "$picked_findings" ]]; then
        echo "$picked_findings"
    fi
}

main "$@"
