import { Transaction, Budget, Goal, Category } from '../types';

export const generatePDFReport = (
  transactions: Transaction[],
  budgets: Budget[],
  goals: Goal[],
  categories: Category[],
  formatCurrency: (amount: number) => string,
  dateRange: { start: number; end: number }
) => {
  // Create HTML content for PDF
  const income = transactions
    .filter(t => t.type === 'income' && t.date >= dateRange.start && t.date <= dateRange.end)
    .reduce((sum, t) => sum + t.amount, 0);
  
  const expenses = transactions
    .filter(t => t.type === 'expense' && t.date >= dateRange.start && t.date <= dateRange.end)
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = income - expenses;

  const expensesByCategory = transactions
    .filter(t => t.type === 'expense' && t.date >= dateRange.start && t.date <= dateRange.end)
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const categoryBreakdown = Object.entries(expensesByCategory)
    .map(([catId, amount]) => {
      const cat = categories.find(c => c.id === catId);
      return {
        name: cat?.name || catId,
        amount: amount as number,
        percentage: ((amount as number) / expenses) * 100
      };
    })
    .sort((a, b) => b.amount - a.amount);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>SpendWise Financial Report</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 40px;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
          border-bottom: 3px solid #3b82f6;
          padding-bottom: 20px;
        }
        .header h1 {
          color: #3b82f6;
          margin: 0;
          font-size: 32px;
        }
        .header p {
          color: #666;
          margin: 10px 0 0 0;
        }
        .summary {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 40px;
        }
        .summary-card {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
        }
        .summary-card h3 {
          margin: 0 0 10px 0;
          color: #666;
          font-size: 14px;
          text-transform: uppercase;
        }
        .summary-card p {
          margin: 0;
          font-size: 24px;
          font-weight: bold;
        }
        .income { color: #10b981; }
        .expense { color: #ef4444; }
        .balance { color: #3b82f6; }
        .section {
          margin-bottom: 40px;
        }
        .section h2 {
          color: #333;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th, td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }
        th {
          background: #f8f9fa;
          font-weight: 600;
          color: #666;
        }
        .progress-bar {
          width: 100%;
          height: 20px;
          background: #e5e7eb;
          border-radius: 10px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          background: #3b82f6;
        }
        .footer {
          text-align: center;
          margin-top: 60px;
          padding-top: 20px;
          border-top: 2px solid #e5e7eb;
          color: #666;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>💰 SpendWise Financial Report</h1>
        <p>${new Date(dateRange.start).toLocaleDateString()} - ${new Date(dateRange.end).toLocaleDateString()}</p>
      </div>

      <div class="summary">
        <div class="summary-card">
          <h3>Total Income</h3>
          <p class="income">${formatCurrency(income)}</p>
        </div>
        <div class="summary-card">
          <h3>Total Expenses</h3>
          <p class="expense">${formatCurrency(expenses)}</p>
        </div>
        <div class="summary-card">
          <h3>Net Balance</h3>
          <p class="balance">${formatCurrency(balance)}</p>
        </div>
      </div>

      <div class="section">
        <h2>📊 Spending by Category</h2>
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Amount</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
            ${categoryBreakdown.map(cat => `
              <tr>
                <td>${cat.name}</td>
                <td>${formatCurrency(cat.amount)}</td>
                <td>${cat.percentage.toFixed(1)}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="section">
        <h2>💰 Budget Overview</h2>
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Budget</th>
              <th>Spent</th>
              <th>Remaining</th>
            </tr>
          </thead>
          <tbody>
            ${budgets.map(budget => {
              const spent = transactions
                .filter(t => t.type === 'expense' && t.category === budget.category && t.date >= dateRange.start && t.date <= dateRange.end)
                .reduce((sum, t) => sum + t.amount, 0);
              const remaining = budget.limit - spent;
              const cat = categories.find(c => c.id === budget.category);
              return `
                <tr>
                  <td>${cat?.name || budget.category}</td>
                  <td>${formatCurrency(budget.limit)}</td>
                  <td>${formatCurrency(spent)}</td>
                  <td style="color: ${remaining < 0 ? '#ef4444' : '#10b981'}">${formatCurrency(remaining)}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <div class="section">
        <h2>🎯 Savings Goals</h2>
        <table>
          <thead>
            <tr>
              <th>Goal</th>
              <th>Target</th>
              <th>Current</th>
              <th>Progress</th>
            </tr>
          </thead>
          <tbody>
            ${goals.map(goal => {
              const progress = (goal.currentAmount / goal.targetAmount) * 100;
              return `
                <tr>
                  <td>${goal.name}</td>
                  <td>${formatCurrency(goal.targetAmount)}</td>
                  <td>${formatCurrency(goal.currentAmount)}</td>
                  <td>${progress.toFixed(0)}%</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <div class="footer">
        <p>Generated by SpendWise on ${new Date().toLocaleDateString()}</p>
        <p>This report is for personal use only</p>
      </div>
    </body>
    </html>
  `;

  // Create a new window and print
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }
};
