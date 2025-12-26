// Simple fuzzy dedupe utilities
function levenshtein(a: string, b: string) {
  const m = a.length; const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

function similarity(a: string, b: string) {
  if (!a && !b) return 1;
  if (!a || !b) return 0;
  const lev = levenshtein(a, b);
  const maxLen = Math.max(a.length, b.length);
  return maxLen === 0 ? 1 : 1 - lev / maxLen;
}

interface TransactionLike {
  id: string;
  amount: number;
  date: number;
  description?: string;
}

export function detectFuzzyDuplicates(existing: TransactionLike[], incoming: TransactionLike[], options?: { threshold?: number; dateWindowDays?: number; amountTolerancePercent?: number; }) {
  const threshold = options?.threshold ?? 0.8;
  const dateWindow = (options?.dateWindowDays ?? 3) * 24 * 60 * 60 * 1000;
  const amountTol = options?.amountTolerancePercent ?? 20; // percent

  const result: Record<string, string> = {};

  // build signature maps
  const byId = new Map<string, TransactionLike>();
  existing.forEach(e => byId.set(e.id, e));

  const bySig: TransactionLike[] = existing.slice();

  incoming.forEach(inc => {
    if (byId.has(inc.id)) {
      result[inc.id] = 'Exact ID match';
      return;
    }

    // check by date window and amount tolerance + description similarity
    for (const ex of bySig) {
      const dateDiff = Math.abs(ex.date - inc.date);
      const amountDiffPct = Math.abs(ex.amount - inc.amount) / Math.max(1, Math.abs(ex.amount)) * 100;
      const descSim = similarity((ex.description||'').toLowerCase(), (inc.description||'').toLowerCase());

      const score = (descSim * 0.6) + ((1 - Math.min(amountDiffPct / amountTol, 1)) * 0.3) + ((dateDiff <= dateWindow) ? 0.1 : 0);

      if (score >= threshold) {
        result[inc.id] = `Possible duplicate (score ${Math.round(score*100)/100})`;
        break;
      }
    }
  });

  return result;
}

export default { detectFuzzyDuplicates };
