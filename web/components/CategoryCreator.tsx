import React, { useContext, useMemo, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { CATEGORY_COLOR_SWATCHES, CATEGORY_ICON_PRESETS } from '../constants';
import { Category, TransactionType } from '../types';

interface CategoryCreatorProps {
  type?: TransactionType;
  defaultType?: TransactionType;
  onCreated?: (category: Category) => void;
  title?: string;
  description?: string;
  buttonLabel?: string;
  defaultOpen?: boolean;
}

export const CategoryCreator: React.FC<CategoryCreatorProps> = ({
  type,
  defaultType = 'expense',
  onCreated,
  title = 'Create custom category',
  description = 'Add your own category, icon, and color.',
  buttonLabel = 'Add category',
  defaultOpen = false,
}) => {
  const { addCustomCategory } = useContext(AppContext)!;
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [categoryType, setCategoryType] = useState<TransactionType>(type ?? defaultType);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState(CATEGORY_ICON_PRESETS[type ?? defaultType][0]);
  const [color, setColor] = useState(CATEGORY_COLOR_SWATCHES[0]);
  const [status, setStatus] = useState('');

  const iconChoices = useMemo(
    () => CATEGORY_ICON_PRESETS[type ?? categoryType],
    [categoryType, type]
  );

  const reset = (nextType = type ?? defaultType) => {
    setCategoryType(nextType);
    setName('');
    setIcon(CATEGORY_ICON_PRESETS[nextType][0]);
    setColor(CATEGORY_COLOR_SWATCHES[0]);
  };

  const handleCreate = () => {
    const created = addCustomCategory({
      name,
      icon,
      color,
      type: type ?? categoryType,
      isCustom: true,
    });

    if (!created) {
      setStatus('Enter a category name to continue.');
      return;
    }

    setStatus(created.name.trim().toLowerCase() === name.trim().toLowerCase() ? 'Category ready to use.' : 'Category already existed. Reusing it.');
    onCreated?.(created);
    reset(type ?? categoryType);
  };

  return (
    <div className="rounded-3xl border border-dashed border-gray-300 bg-gray-50/80 p-4 dark:border-zinc-700 dark:bg-zinc-950/40">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 dark:text-white">{title}</p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{description}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setIsOpen((current) => !current);
            setStatus('');
          }}
          className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-blue-500 hover:text-blue-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-gray-300 dark:hover:text-blue-400 sm:w-auto"
        >
          {isOpen ? 'Hide' : buttonLabel}
        </button>
      </div>

      {isOpen && (
        <div className="mt-4 space-y-4">
          {!type && (
            <div className="grid grid-cols-2 gap-3">
              {(['expense', 'income'] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setCategoryType(option);
                    setIcon(CATEGORY_ICON_PRESETS[option][0]);
                  }}
                  className={`rounded-2xl border px-4 py-3 text-sm font-medium transition-colors ${
                    categoryType === option
                      ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-500/10 dark:text-blue-300'
                      : 'border-gray-200 bg-white text-gray-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-gray-300'
                  }`}
                >
                  {option === 'expense' ? 'Expense' : 'Income'}
                </button>
              ))}
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={type === 'income' || categoryType === 'income' ? 'Dividend payout, consulting, stipend...' : 'Coffee, maintenance, childcare...'}
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
            />
            <input
              type="text"
              value={icon}
              maxLength={2}
              onChange={(event) => setIcon(event.target.value || CATEGORY_ICON_PRESETS[type ?? categoryType][0])}
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-center text-xl outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white sm:w-24"
              aria-label="Custom category icon"
            />
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">Suggested icons</p>
            <div className="grid grid-cols-6 gap-2 sm:grid-cols-8">
              {iconChoices.map((choice) => (
                <button
                  key={choice}
                  type="button"
                  onClick={() => setIcon(choice)}
                  className={`rounded-2xl border px-2 py-3 text-xl transition-colors ${
                    icon === choice
                      ? 'border-blue-500 bg-blue-50 dark:border-blue-500 dark:bg-blue-500/10'
                      : 'border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'
                  }`}
                >
                  {choice}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">Color</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_COLOR_SWATCHES.map((swatch) => (
                <button
                  key={swatch}
                  type="button"
                  onClick={() => setColor(swatch)}
                  className={`h-10 w-10 rounded-2xl border-2 ${color === swatch ? 'border-gray-900 dark:border-white' : 'border-transparent'}`}
                  style={{ backgroundColor: swatch }}
                  aria-label={`Select ${swatch}`}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
              <span className="text-2xl">{icon}</span>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{name.trim() || 'Preview category'}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{type ?? categoryType}</p>
              </div>
              <span className="h-4 w-4 rounded-full" style={{ backgroundColor: color }} />
            </div>
            <button
              type="button"
              onClick={handleCreate}
              className="w-full rounded-2xl bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700 sm:w-auto"
            >
              Save custom category
            </button>
          </div>

          {status && <p className="text-sm text-blue-600 dark:text-blue-400">{status}</p>}
        </div>
      )}
    </div>
  );
};
