import React, { useState } from 'react';
import { Check, Edit2, Trash2, Calendar } from 'lucide-react';

export default function TodoItem({ todo, onToggle, onEdit, onDelete }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggle = async () => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      await onToggle(todo);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    if (window.confirm(`Delete "${todo.title}"?`)) {
      setIsDeleting(true);
      try {
        await onDelete(todo.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    });
  };

  return (
    <div
      className={`group relative p-4 rounded-2xl border transition-all duration-200 ${
        todo.completed
          ? 'bg-slate-50/80 border-slate-200/60 opacity-80'
          : 'bg-white border-slate-200/90 shadow-card hover:border-brand-200 hover:shadow-md'
      } ${isUpdating || isDeleting ? 'pointer-events-none opacity-50' : ''}`}
    >
      <div className="flex items-start space-x-3.5">
        {/* Thumb-friendly Big Checkbox */}
        <button
          type="button"
          onClick={handleToggle}
          aria-label={todo.completed ? 'Mark uncompleted' : 'Mark completed'}
          className={`shrink-0 w-7 h-7 rounded-xl flex items-center justify-center transition-all duration-200 border mt-0.5 min-w-[28px] min-h-[28px] focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1 active:scale-90 ${
            todo.completed
              ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-500/20'
              : 'border-slate-300 bg-slate-50 hover:border-brand-500 hover:bg-brand-50/50 text-transparent'
          }`}
        >
          <Check className={`w-4 h-4 stroke-[3] transition-transform ${todo.completed ? 'scale-100' : 'scale-50'}`} />
        </button>

        {/* Content Body */}
        <div className="flex-1 min-w-0" onClick={handleToggle} role="button" tabIndex={0}>
          <h4
            className={`text-sm sm:text-base font-semibold leading-snug break-words transition-all ${
              todo.completed ? 'text-slate-400 line-through' : 'text-slate-800'
            }`}
          >
            {todo.title}
          </h4>

          {todo.description && (
            <p
              className={`text-xs sm:text-sm mt-1 line-clamp-2 break-words leading-relaxed ${
                todo.completed ? 'text-slate-400 line-through' : 'text-slate-500'
              }`}
            >
              {todo.description}
            </p>
          )}

          {/* Metadata Footer */}
          <div className="flex items-center space-x-2 mt-2 text-[11px] text-slate-400">
            <span className="flex items-center space-x-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>{formatDate(todo.created_at)}</span>
            </span>

            {todo.completed && (
              <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-600 font-medium">
                Done
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons with Mobile-friendly touch targets */}
        <div className="flex items-center space-x-1 shrink-0 pt-0.5">
          <button
            type="button"
            onClick={() => onEdit(todo)}
            aria-label="Edit todo"
            className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-brand-600 hover:bg-brand-50 active:scale-95 transition"
          >
            <Edit2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleDelete}
            aria-label="Delete todo"
            className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 active:scale-95 transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
