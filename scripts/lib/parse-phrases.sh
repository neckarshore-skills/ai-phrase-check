#!/usr/bin/env bash
# parse-phrases.sh — read a phrase list (Markdown with multi-doc YAML)
# and output TSV: phrase\tlanguage\tseverity\tcategory\tpattern (one per line)
#
# Dependencies: yq (mikefarah/yq v4+)
# Usage: parse_phrases <path-to-list.md>

set -euo pipefail

parse_phrases() {
    local list_file="${1:?usage: parse_phrases <list-file>}"

    if [[ ! -f "$list_file" ]]; then
        echo "parse_phrases: file not found: $list_file" >&2
        return 1
    fi

    # The list is multi-document YAML embedded in Markdown.
    # Strip leading lines until first '---', then count the documents with yq,
    # and extract each one individually so we get exactly one TSV row per phrase.
    local stripped doc_count
    stripped="$(awk '/^---$/{found=1} found{print}' "$list_file")"
    doc_count="$(printf '%s' "$stripped" | yq eval-all 'select(.phrase != null) | .phrase' - 2>/dev/null | wc -l | tr -d ' ')"

    local i
    for ((i = 0; i < doc_count; i++)); do
        printf '%s' "$stripped" | \
            yq eval-all "select(documentIndex == $i) | select(.phrase != null) | [.phrase, .language, .severity, .category, .pattern] | @tsv" -
    done | grep -v '^$' || true
}

# Allow direct invocation as well as sourcing
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    parse_phrases "$@"
fi
