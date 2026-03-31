import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Icons } from './Icons';
import { generateId } from '../constants';

export const ReceiptScanner: React.FC = () => {
  const { addTransaction, categories } = useContext(AppContext)!;
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<any>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Simulate OCR extraction (in production, use Tesseract.js or cloud OCR)
    setTimeout(() => {
      // Mock extracted data
      const mockData = {
        amount: Math.floor(Math.random() * 200) + 10,
        merchant: ['Walmart', 'Target', 'Amazon', 'Starbucks', 'McDonald\'s'][Math.floor(Math.random() * 5)],
        date: Date.now(),
        category: 'shopping'
      };
      setExtractedData(mockData);
      setUploading(false);
    }, 2000);
  };

  const handleSave = () => {
    if (!extractedData) return;

    const transaction = {
      id: generateId(),
      type: 'expense' as const,
      amount: extractedData.amount,
      category: extractedData.category,
      paymentMethod: 'credit',
      date: extractedData.date,
      description: `Receipt from ${extractedData.merchant}`,
      tags: ['receipt', 'scanned']
    };

    addTransaction(transaction);
    setPreview(null);
    setExtractedData(null);
    alert('Transaction added successfully!');
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">📸 Receipt Scanner</h2>

      {/* Upload Area */}
      <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-2xl p-6">
        <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-zinc-700 rounded-xl cursor-pointer hover:border-blue-500 transition-colors">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Icons.Upload />
          <p className="mt-2 text-sm text-gray-400">Click to upload receipt</p>
          <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
        </label>
      </div>

      {/* Preview & Extracted Data */}
      {uploading && (
        <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-2xl p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Scanning receipt...</p>
        </div>
      )}

      {preview && extractedData && !uploading && (
        <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-2xl p-4 space-y-4">
          <div className="flex gap-4">
            <img src={preview} alt="Receipt" className="w-32 h-32 object-cover rounded-lg border border-zinc-700" />
            <div className="flex-1 space-y-2">
              <div>
                <label className="text-xs text-gray-400">Merchant</label>
                <input
                  type="text"
                  value={extractedData.merchant}
                  onChange={(e) => setExtractedData({ ...extractedData, merchant: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400">Amount</label>
                <input
                  type="number"
                  value={extractedData.amount}
                  onChange={(e) => setExtractedData({ ...extractedData, amount: parseFloat(e.target.value) })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400">Category</label>
                <select
                  value={extractedData.category}
                  onChange={(e) => setExtractedData({ ...extractedData, category: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                >
                  {categories.filter(c => c.type === 'expense').map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setPreview(null); setExtractedData(null); }}
              className="flex-1 py-2 bg-zinc-800 border border-zinc-700 text-white rounded-xl hover:bg-zinc-700"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
            >
              Add Transaction
            </button>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
        <p className="text-sm text-blue-300">
          💡 <strong>Tip:</strong> Take clear photos of your receipts for best results. The scanner will automatically extract amount, merchant, and date.
        </p>
      </div>
    </div>
  );
};
