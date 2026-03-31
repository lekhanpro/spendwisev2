import { Transaction } from '../types';

function downloadFile(filename: string, content: string, mime = 'text/csv') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function exportTransactionsCSV(transactions: Transaction[]) {
  const headers = ['id', 'type', 'amount', 'category', 'paymentMethod', 'date', 'description', 'tags'];
  const rows = transactions.map(t => [
    t.id,
    t.type,
    t.amount.toString(),
    t.category,
    t.paymentMethod || '',
    new Date(t.date).toISOString(),
    (t.description || '').replace(/\n/g, ' '),
    (t.tags || []).join(';')
  ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));

  const csv = [headers.join(','), ...rows].join('\n');
  downloadFile(`spendwise-transactions-${new Date().toISOString().slice(0,10)}.csv`, csv, 'text/csv');
}

export function parseTransactionsCSV(content: string): Transaction[] {
  const lines = content.split(/\r?\n/).filter(Boolean);
  if (lines.length <= 1) return [];
  const header = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim());
  const idx = (name: string) => header.indexOf(name);

  const results: Transaction[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    // simple CSV parse for quoted values
    const values = line.match(/("[^"]*(""[^"]*)*"|[^,]+)/g)?.map(v => v.replace(/^"|"$/g, '').replace(/""/g, '"')) || [];
    const id = values[idx('id')] || `imp-${i}-${Date.now()}`;
    const type = (values[idx('type')] || 'expense') as any;
    const amount = parseFloat(values[idx('amount')] || '0') || 0;
    const category = values[idx('category')] || 'Uncategorized';
    const paymentMethod = values[idx('paymentMethod')] || '';
    const dateStr = values[idx('date')] || '';
    const date = dateStr ? Date.parse(dateStr) : Date.now();
    const description = values[idx('description')] || '';
    const tags = (values[idx('tags')] || '').split(';').map(s => s.trim()).filter(Boolean);

    results.push({ id, type, amount, category, paymentMethod, date: isNaN(date) ? Date.now() : date, description, tags });
  }

  return results;
}

export function exportTransactionsOFX(transactions: Transaction[]) {
  // Minimal OFX-like XML export for compatibility
  const header = `<?xml version="1.0" encoding="UTF-8"?>\n<OFX>\n  <BANKMSGSRSV1>\n    <STMTTRNRS>\n      <STMTRS>\n        <BANKTRANLIST>`;

  const tail = `\n        </BANKTRANLIST>\n      </STMTRS>\n    </STMTTRNRS>\n  </BANKMSGSRSV1>\n</OFX>`;

  const body = transactions.map(t => `\n          <STMTTRN>\n            <TRNTYPE>${t.type === 'income' ? 'CREDIT' : 'DEBIT'}</TRNTYPE>\n            <DTPOSTED>${new Date(t.date).toISOString()}</DTPOSTED>\n            <TRNAMT>${t.amount}</TRNAMT>\n            <NAME>${t.description || t.category}</NAME>\n            <MEMO>${t.tags?.join(';') || ''}</MEMO>\n          </STMTTRN>`).join('');

  const ofx = header + body + tail;
  downloadFile(`spendwise-transactions-${new Date().toISOString().slice(0,10)}.ofx`, ofx, 'application/ofx');
}
