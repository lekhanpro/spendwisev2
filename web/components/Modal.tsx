
import React from 'react';
import { Icons } from './Icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl shadow-2xl max-h-[90vh] overflow-hidden animate-slide-up">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-zinc-800 bg-gradient-to-r from-gray-50 to-white dark:from-zinc-900 dark:to-zinc-900">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-xl transition-all hover:scale-110 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <Icons.Close />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)] custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};
