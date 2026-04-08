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
  /** If true, also render the full list manager below the create form */
  showManager?: boolean;
}

// ─── Create / Edit form ───────────────────────────────────────────────────────

interface CategoryFormProps {
  type?: TransactionType;
  defaultType: TransactionType;
  initial?: Category;
  onSave: (values: Omit<Category, 'id'>) => void;
  onCancel?: () => void;
  saveLabel?: string;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ type, defaultType, initial, onSave, onCancel, saveLabel = 'Save category' }) => {
  const [categoryType, setCategoryType] = useState<TransactionType>(initial?.type ?? type ?? defaultType);
  const [name, setName] = useState(initial?.name ?? '');
  const [icon, setIcon] = useState(initial?.icon ?? CATEGORY_ICON_PRESETS[initial?.type ?? type ?? defaultType][0]);
  const [color, setColor] = useState(initial?.color ?? CATEGORY_COLOR_SWATCHES[0]);
  const [budgetable, setBudgetable] = useState(initial?.budgetable ?? true);
  const [status, setStatus] = useState('');

  const iconChoices = useMemo(() => CATEGORY_ICON_PRESETS[type ?? categoryType], [categoryType, type]);

  const handleSave = () => {
    if (!name.trim()) { setStatus('Enter a category name to continue.'); return; }
    onSave({ name: name.trim(), icon, color, type: type ?? categoryType, isCustom: true, budgetable });
  };

  return (
    <div className="space-y-4">
      {!type && (
        <div className="grid grid-cols-2 gap-3">
          {(['expense', 'income'] as const).map((opt) => (
            <button key={opt} type="button"
              onClick={() => { setCategoryType(opt); setIcon(CATEGORY_ICON_PRESETS[opt][0]); }}
              className={`rounded-2xl border px-4 py-3 text-sm font-medium transition-colors ${categoryType === opt ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-500/10 dark:text-blue-300' : 'border-gray-200 bg-white text-gray-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-gray-300'}`}>
              {opt === 'expense' ? 'Expense' : 'Income'}
            </button>
          ))}
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <input type="text" value={name} onChange={(e) => setName(e.target.value)}
          placeholder={categoryType === 'income' ? 'Dividend, consulting, stipend…' : 'Coffee, maintenance, childcare…'}
          className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white" />
        <input type="text" value={icon} maxLength={2}
          onChange={(e) => setIcon(e.target.value || CATEGORY_ICON_PRESETS[type ?? categoryType][0])}
          className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-center text-xl outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white sm:w-24"
          aria-label="Icon" />
      </div>
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">Suggested icons</p>
        <div className="grid grid-cols-6 gap-2 sm:grid-cols-8">
          {iconChoices.map((choice) => (
            <button key={choice} type="button" onClick={() => setIcon(choice)}
              className={`rounded-2xl border px-2 py-3 text-xl transition-colors ${icon === choice ? 'border-blue-500 bg-blue-50 dark:border-blue-500 dark:bg-blue-500/10' : 'border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'}`}>
              {choice}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">Color</p>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_COLOR_SWATCHES.map((swatch) => (
            <button key={swatch} type="button" onClick={() => setColor(swatch)}
              className={`h-10 w-10 rounded-2xl border-2 ${color === swatch ? 'border-gray-900 dark:border-white' : 'border-transparent'}`}
              style={{ backgroundColor: swatch }} aria-label={`Select ${swatch}`} />
          ))}
        </div>
      </div>
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input type="checkbox" checked={budgetable} onChange={(e) => setBudgetable(e.target.checked)}
          className="w-4 h-4 accent-blue-600 rounded" />
        <span className="text-sm text-gray-700 dark:text-gray-300">Show in budget planner</span>
      </label>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
          <span className="text-2xl">{icon}</span>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{name.trim() || 'Preview category'}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{type ?? categoryType}</p>
          </div>
          <span className="h-4 w-4 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
        </div>
        <div className="flex gap-2">
          {onCancel && (
            <button type="button" onClick={onCancel} className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-gray-300">
              Cancel
            </button>
          )}
          <button type="button" onClick={handleSave} className="flex-1 rounded-2xl bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700 sm:flex-none">
            {saveLabel}
          </button>
        </div>
      </div>
      {status && <p className="text-sm text-red-500 dark:text-red-400">{status}</p>}
    </div>
  );
};

// ─── Category manager (list with edit/delete/archive/merge) ───────────────────

export const CategoryManager: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const { customCategories, transactions, addCustomCategory, updateCustomCategory, removeCustomCategory, archiveCustomCategory, mergeCustomCategories } = useContext(AppContext)!;
  const [editingId, setEditingId] = useState<string | null>(null);
  const [mergingFrom, setMergingFrom] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const visible = useMemo(
    () => customCategories.filter((c) => showArchived ? c.archived : !c.archived),
    [customCategories, showArchived]
  );

  const usageCount = useMemo(() => {
    const counts: Record<string, number> = {};
    transactions.forEach((t) => { counts[t.category] = (counts[t.category] || 0) + 1; });
    return counts;
  }, [transactions]);

  const mergeTargets = useMemo(() => {
    if (!mergingFrom) return [];
    const from = customCategories.find((c) => c.id === mergingFrom);
    return customCategories.filter((c) => c.id !== mergingFrom && c.type === from?.type && !c.archived);
  }, [mergingFrom, customCategories]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
          {customCategories.filter((c) => !c.archived).length} active custom categories
        </p>
        <div className="flex gap-2 items-center">
          <label className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
            <input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} className="accent-blue-600" />
            Show archived
          </label>
          {onClose && (
            <button type="button" onClick={onClose} className="text-xs text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">✕ Close</button>
          )}
        </div>
      </div>

      {visible.length === 0 && (
        <p className="text-sm text-gray-400 dark:text-gray-500 py-4 text-center">
          {showArchived ? 'No archived categories.' : 'No custom categories yet. Create one below.'}
        </p>
      )}

      <div className="space-y-2">
        {visible.map((cat) => {
          const txCount = usageCount[cat.name] ?? 0;
          const isEditing = editingId === cat.id;
          const isMergingThis = mergingFrom === cat.id;

          if (isEditing) {
            return (
              <div key={cat.id} className="rounded-2xl border border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-900/10 p-4">
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-3">Editing: {cat.name}</p>
                <CategoryForm
                  initial={cat}
                  defaultType={cat.type}
                  onSave={(values) => { updateCustomCategory({ ...cat, ...values }); setEditingId(null); }}
                  onCancel={() => setEditingId(null)}
                  saveLabel="Update category"
                />
              </div>
            );
          }

          return (
            <div key={cat.id} className={`rounded-2xl border p-3 flex items-center gap-3 flex-wrap ${cat.archived ? 'opacity-50 border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/30' : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900'}`}>
              <span className="text-xl w-8 text-center flex-shrink-0">{cat.icon}</span>
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white truncate">{cat.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {cat.type} · {txCount} transaction{txCount !== 1 ? 's' : ''}
                  {cat.archived ? ' · archived' : ''}
                  {cat.budgetable === false ? ' · not budgetable' : ''}
                </p>
              </div>
              {!cat.archived && (
                <div className="flex gap-1.5 flex-wrap">
                  <button type="button" onClick={() => setEditingId(cat.id)} className="px-2.5 py-1 rounded-xl text-xs bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600">
                    Edit
                  </button>
                  <button type="button" onClick={() => setMergingFrom(isMergingThis ? null : cat.id)} className={`px-2.5 py-1 rounded-xl text-xs ${isMergingThis ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-600'}`}>
                    {isMergingThis ? 'Cancel merge' : 'Merge'}
                  </button>
                  <button type="button" onClick={() => archiveCustomCategory(cat.id)} className="px-2.5 py-1 rounded-xl text-xs bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200">
                    Archive
                  </button>
                  <button type="button" onClick={() => setConfirmDeleteId(cat.id === confirmDeleteId ? null : cat.id)} className={`px-2.5 py-1 rounded-xl text-xs ${confirmDeleteId === cat.id ? 'bg-red-600 text-white' : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'}`}>
                    {confirmDeleteId === cat.id ? 'Confirm delete' : 'Delete'}
                  </button>
                  {confirmDeleteId === cat.id && (
                    <button type="button" onClick={() => setConfirmDeleteId(null)} className="px-2.5 py-1 rounded-xl text-xs bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300">Cancel</button>
                  )}
                </div>
              )}
              {cat.archived && (
                <button type="button" onClick={() => updateCustomCategory({ ...cat, archived: false })} className="px-2.5 py-1 rounded-xl text-xs bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300">
                  Restore
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Merge target picker */}
      {mergingFrom && mergeTargets.length > 0 && (
        <div className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10 p-4 space-y-2">
          <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
            Merge "{customCategories.find((c) => c.id === mergingFrom)?.name}" into:
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-400">All transactions will be re-assigned and the source category will be archived.</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {mergeTargets.map((t) => (
              <button key={t.id} type="button" onClick={() => { mergeCustomCategories(mergingFrom, t.id); setMergingFrom(null); }}
                className="rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-sm text-gray-800 dark:text-gray-200 hover:border-amber-500">
                {t.icon} {t.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Delete confirmation — remove category, transactions keep their name as text */}
      {confirmDeleteId && (
        <div className="rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10 p-4 space-y-3">
          <p className="text-sm font-semibold text-red-700 dark:text-red-300">
            Permanently delete "{customCategories.find((c) => c.id === confirmDeleteId)?.name}"?
          </p>
          <p className="text-xs text-red-500 dark:text-red-400">
            {(usageCount[customCategories.find((c) => c.id === confirmDeleteId)?.name ?? ''] ?? 0)} transaction(s) will keep the category name as plain text. This cannot be undone.
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={() => { removeCustomCategory(confirmDeleteId); setConfirmDeleteId(null); }}
              className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
              Delete permanently
            </button>
            <button type="button" onClick={() => setConfirmDeleteId(null)}
              className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Original CategoryCreator (create form + optional manager) ────────────────

export const CategoryCreator: React.FC<CategoryCreatorProps> = ({
  type,
  defaultType = 'expense',
  onCreated,
  title = 'Create custom category',
  description = 'Add your own category, icon, and color.',
  buttonLabel = 'Add category',
  defaultOpen = false,
  showManager = false,
}) => {
  const { addCustomCategory } = useContext(AppContext)!;
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [showMgr, setShowMgr] = useState(false);
  const [status, setStatus] = useState('');

  return (
    <div className="rounded-3xl border border-dashed border-gray-300 bg-gray-50/80 p-4 dark:border-zinc-700 dark:bg-zinc-950/40 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 dark:text-white">{title}</p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{description}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {showManager && (
            <button type="button" onClick={() => setShowMgr((v) => !v)}
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:border-gray-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-gray-300 sm:w-auto">
              {showMgr ? 'Hide manager' : 'Manage categories'}
            </button>
          )}
          <button type="button" onClick={() => { setIsOpen((c) => !c); setStatus(''); }}
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-blue-500 hover:text-blue-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-gray-300 dark:hover:text-blue-400 sm:w-auto">
            {isOpen ? 'Hide' : buttonLabel}
          </button>
        </div>
      </div>

      {showMgr && <CategoryManager />}

      {isOpen && (
        <div>
          <CategoryForm
            type={type}
            defaultType={defaultType}
            onSave={(values) => {
              const created = addCustomCategory(values);
              if (!created) { setStatus('Enter a category name to continue.'); return; }
              setStatus(created.name.toLowerCase() === values.name.toLowerCase() ? 'Category ready to use.' : 'Category already existed — reusing it.');
              onCreated?.(created);
            }}
          />
          {status && <p className="mt-2 text-sm text-blue-600 dark:text-blue-400">{status}</p>}
        </div>
      )}
    </div>
  );
};


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
