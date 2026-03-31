import { describe, it, expect } from 'vitest';
import { detectFuzzyDuplicates } from '../lib/dedupe';

describe('detectFuzzyDuplicates', () => {
  it('flags exact id matches', () => {
    const existing = [{ id: 't1', amount: 50, date: 1700000000000, description: 'Coffee' }];
    const incoming = [{ id: 't1', amount: 50, date: 1700000000000, description: 'Coffee' }];
    const res = detectFuzzyDuplicates(existing as any, incoming as any);
    expect(res['t1']).toBeDefined();
    expect(res['t1']).toContain('Exact ID');
  });

  it('detects probable duplicates by similarity', () => {
    const existing = [{ id: 'e1', amount: 100, date: Date.now(), description: 'Netflix Subscription' }];
    const incoming = [{ id: 'i1', amount: 102, date: Date.now(), description: 'netflix subscription' }];
    const res = detectFuzzyDuplicates(existing as any, incoming as any, { threshold: 0.5, dateWindowDays: 2, amountTolerancePercent: 10 });
    expect(res['i1']).toBeDefined();
    expect(res['i1']).toMatch(/Possible duplicate/);
  });
});
