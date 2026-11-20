import React, { useState, useEffect } from 'react';
import { X, Check, Loader2 } from 'lucide-react';

export default function TodoModal({ isOpen, onClose, onSubmit, initialData = null }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = Boolean(initialData);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setCompleted(Boolean(initialData.completed));
    } else {
      setTitle('');
      setDescription('');
      setCompleted(false);
    }
    setError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        ...(isEditing ? { completed } : {}),
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save todo. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Dimmed backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="min-h-full flex items-end sm:items-center justify-center p-0 sm:p-4 text-center">
        {/* Modal Window: Bottom-sheet on mobile, centered dialog on desktop */}
        <div className="relative w-full sm:max-w-md bg-white rounded-t-[28px] sm:rounded-2xl p-6 text-left shadow-2xl transition-all border border-slate-100 pb-safe animate-slide-up">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {isEditing ? 'Edit Task' : 'New Task'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isEditing ? 'Update task details or toggle status' : 'Add something you want to get done'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 active:scale-95 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200/70 text-red-600 text-xs font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Pick up groceries"
                autoFocus
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition placeholder:text-slate-400 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add notes, links, or sub-points..."
                rows={3}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition placeholder:text-slate-400 resize-none"
              />
            </div>

            {/* In Edit mode, allow toggling completion status directly */}
            {isEditing && (
              <div className="pt-1">
                <label className="inline-flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={completed}
                    onChange={(e) => setCompleted(e.target.checked)}
                    className="w-5 h-5 rounded-lg text-brand-600 focus:ring-brand-500 border-slate-300"
                  />
                  <span className="text-sm font-semibold text-slate-700">Mark as completed</span>
                </label>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-3 flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 min-h-[48px] px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 active:scale-95 transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting || !title.trim()}
                className="flex-1 min-h-[48px] px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-95 text-white text-sm font-bold shadow-md shadow-brand-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>{isEditing ? 'Save Changes' : 'Create Task'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
