# Developer Notes

This document describes running tests and the new Export/Import features added to SpendWise.

Running tests (web):

1. Change to the web directory:

```bash
cd web
```

2. Install dev dependencies (once):

```bash
npm install
```

3. Run tests:

```bash
npm test
```

Files added/changed:
- `web/lib/export.ts` — CSV export/parse, simple OFX exporter
- `web/lib/dedupe.ts` — fuzzy duplicate detection
- `web/components/Settings.tsx` — CSV import preview, editing, fuzzy thresholds
- `web/components/Bills.tsx` — bills dashboard MVP
- `web/components/AIChatbot.tsx` — insights button wired to AI

Testing:
- Unit tests added in `web/tests/` for dedupe and CSV parse.

Next steps:
- Add OFX import parsing
- Add undo/history for bulk imports
- Add more tests for UI flows (use testing-library + vitest/jsdom)
