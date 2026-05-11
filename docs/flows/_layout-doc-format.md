# KredBook Layout Doc Format

Use this format for all flow/layout docs so each screen is visually scannable and state-aware.

## Required Structure

1. `Purpose`
2. `Routes / Entry Points`
3. `Reference Layout States` (ASCII blocks)
4. `Behavior Notes`
5. `Validation / Rules`

## Reference Layout States Pattern

Always show at least these states when applicable:

- `Default`
- `Alternate` (toggle/tab/filter switched)
- `Empty`
- `Loading`
- `Error` (if meaningful)
- `Disabled CTA` (if meaningful)

## ASCII Guidelines

- Keep width visually consistent.
- Keep labels realistic (`Balance due`, `Amount received`, etc.).
- Show CTA text exactly as product copy.
- If toggle/tab changes layout, show separate blocks for each mode.

## Canonical Snippet Template

```text
#### <State Name>

[Header / Identity]                      [Close]
Context line

┌────────────────────────────────────┐
│ Section title                      │
│ Main value                          │
│ [Toggle A] [Toggle B]               │
└────────────────────────────────────┘

Hint / helper text

ACTION AREA
[Primary] [Secondary]

[Primary CTA]
```

## Notes

- Keep product nouns canonical: `Customer`, `Entry`, `Payment`.
- Legacy code terms may be mentioned only as transitional notes.
- Do not hardcode implementation claims that conflict with current app behavior.
