#!/usr/bin/env bash
# apply.sh — Stage 3: apply user-chosen substitutions to text
#
# Usage: apply.sh <input-file> <substitutions-tsv>
#
# substitutions-tsv format: each line is "<regex>\t<replacement>"
# Output: modified text on stdout
#
# Exit: 0 ok, 1 input missing, 2 subs file missing

set -euo pipefail

main() {
    local input_file="${1:?usage: apply.sh <input-file> <subs-tsv>}"
    local subs_file="${2:?usage: apply.sh <input-file> <subs-tsv>}"

    if [[ ! -f "$input_file" ]]; then
        echo "apply.sh: input not found: $input_file" >&2
        return 1
    fi
    if [[ ! -f "$subs_file" ]]; then
        echo "apply.sh: substitutions file not found: $subs_file" >&2
        return 2
    fi

    # Build a perl substitution program from the TSV. Each line: regex\treplacement.
    # Perl is used (instead of sed) because BSD sed on macOS does not support
    # `\b` word boundaries that the phrase patterns rely on.
    # `|` is used as the substitution delimiter to avoid escaping `/`.
    local perl_expr=""
    while IFS=$'\t' read -r pattern replacement; do
        [[ -z "$pattern" ]] && continue
        perl_expr+="s|${pattern}|${replacement}|g; "
    done < "$subs_file"

    if [[ -z "$perl_expr" ]]; then
        cat "$input_file"
        return 0
    fi

    perl -pe "$perl_expr" "$input_file"
}

main "$@"
