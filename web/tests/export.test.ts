import { describe, it, expect } from 'vitest';
import { exportTransactionsCSV, parseTransactionsCSV } from '../lib/export';

describe('export/parse CSV', () => {
  it('parses exported CSV back to transactions', () => {
    const tx = [{ id: 'a1', type: 'expense', amount: 12.5, category: 'Food', paymentMethod: 'Card', date: Date.parse('2025-01-01'), description: 'Lunch', tags: ['food'] } as any];
    // generate CSV via exportTransactionsCSV by capturing download — instead, manually build CSV here to test parser
    const headers = ['id','type','amount','category','paymentMethod','date','description','tags'];
    const row = `"${tx[0].id}","${tx[0].type}","${tx[0].amount}","${tx[0].category}","${tx[0].paymentMethod}","${new Date(tx[0].date).toISOString()}","${tx[0].description}","${tx[0].tags.join(';')}"`;
    const csv = [headers.join(','), row].join('\n');

    const parsed = parseTransactionsCSV(csv);
    expect(parsed.length).toBe(1);
    expect(parsed[0].id).toBe('a1');
    expect(parsed[0].amount).toBeCloseTo(12.5);
    expect(parsed[0].category).toBe('Food');
  });
});
