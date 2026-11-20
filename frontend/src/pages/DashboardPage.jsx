import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import TodoItem from '../components/TodoItem';
import TodoModal from '../components/TodoModal';
import Pagination from '../components/Pagination';
import EmptyState from '../components/EmptyState';
import LoadingSkeleton from '../components/LoadingSkeleton';
import BottomBar from '../components/BottomBar';
import { todoApi } from '../api/client';
import { useDebounce } from '../hooks/useDebounce';
import { Search, X, Plus, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function DashboardPage() {
  const [todos, setTodos] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [searchInput, setSearchInput] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'active' | 'completed'

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);

  const debouncedSearch = useDebounce(searchInput, 350);

  // Show temporary toast notification
  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  // Fetch todos from API
  const fetchTodos = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await todoApi.getTodos({
        search: debouncedSearch,
        page,
        limit,
      });

      setTodos(data.items || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('Error fetching todos:', err);
      setError(err.response?.data?.error || 'Failed to load todos. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, page, limit]);

  // Reset page to 1 when debounced search query changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  // Trigger fetch on query, page, or limit changes
  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  // Create or Update handler
  const handleModalSubmit = async (formData) => {
    if (editingTodo) {
      // Update
      const updated = await todoApi.updateTodo(editingTodo.id, formData);
      setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      showToast('Task updated successfully');
    } else {
      // Create
      await todoApi.createTodo(formData);
      showToast('New task added!');
      // If we are not on page 1, reset to page 1 to see newest todo at the top
      if (page !== 1) {
        setPage(1);
      } else {
        fetchTodos();
      }
    }
  };

  // Toggle todo completion
  const handleToggle = async (todo) => {
    try {
      const updated = await todoApi.updateTodo(todo.id, {
        completed: !todo.completed,
      });
      setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      showToast(updated.completed ? 'Task completed! 🎉' : 'Task marked active');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update task status.');
    }
  };

  // Delete todo
  const handleDelete = async (id) => {
    try {
      await todoApi.deleteTodo(id);
      showToast('Task deleted');
      // If last item on page > 1, go back one page
      if (todos.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        fetchTodos();
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete task.');
    }
  };

  // Client-side quick filter view
  const filteredTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-brand-500 selection:text-white pb-24 sm:pb-12">
      {/* Top Navbar */}
      <Navbar />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 z-50 animate-fade-in-down">
          <div className="bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-xl flex items-center space-x-2 border border-slate-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 pt-5">
        {/* Controls Card: Search + Desktop Action */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-3 sm:p-4 mb-4">
          <div className="flex items-center space-x-2">
            {/* Search Input */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search tasks by title or details..."
                className="w-full pl-10 pr-9 py-2.5 text-sm rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition font-medium"
              />
              {searchInput && (
                <button
                  onClick={() => setSearchInput('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Desktop Add Button */}
            <button
              onClick={() => {
                setEditingTodo(null);
                setIsModalOpen(true);
              }}
              className="hidden sm:flex items-center space-x-1.5 px-4 py-2.5 bg-brand-600 text-white text-sm font-bold rounded-xl shadow-sm hover:bg-brand-700 active:scale-95 transition shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>New Task</span>
            </button>
          </div>

          {/* Desktop Filter Tabs */}
          <div className="hidden sm:flex items-center justify-between mt-3 pt-3 border-t border-slate-100 text-xs">
            <div className="flex items-center space-x-1">
              {[
                { id: 'all', label: 'All Tasks' },
                { id: 'active', label: 'Active' },
                { id: 'completed', label: 'Completed' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    filter === f.id
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="text-slate-400 font-medium">
              Total {total} tasks
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-4 rounded-2xl bg-red-50 border border-red-200/80 text-red-700 text-sm flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
            <button
              onClick={fetchTodos}
              className="px-3 py-1 bg-white border border-red-200 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 transition flex items-center space-x-1 shrink-0"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Todos List Section */}
        {isLoading ? (
          <LoadingSkeleton count={4} />
        ) : filteredTodos.length === 0 ? (
          <EmptyState
            isSearching={Boolean(debouncedSearch)}
            onAddNew={() => {
              setEditingTodo(null);
              setIsModalOpen(true);
            }}
            onClearSearch={() => setSearchInput('')}
          />
        ) : (
          <div className="space-y-2.5">
            {filteredTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={handleToggle}
                onEdit={(item) => {
                  setEditingTodo(item);
                  setIsModalOpen(true);
                }}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        <div className="mt-4">
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            limit={limit}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </div>
      </main>

      {/* Mobile-Friendly Bottom Navigation Bar & FAB */}
      <BottomBar
        activeFilter={filter}
        onFilterChange={setFilter}
        onAddNew={() => {
          setEditingTodo(null);
          setIsModalOpen(true);
        }}
      />

      {/* Add / Edit Task Modal */}
      <TodoModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTodo(null);
        }}
        onSubmit={handleModalSubmit}
        initialData={editingTodo}
      />
    </div>
  );
}
