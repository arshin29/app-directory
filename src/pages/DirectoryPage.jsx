import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';
import SortDropdown from '../components/SortDropdown';
import AppGrid from '../components/AppGrid';
import EmptyState from '../components/EmptyState';
import AppDetailsModal from '../components/AppDetailsModal';
import AddAppModal from '../components/AddAppModal';
import EditAppModal from '../components/EditAppModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import ToastNotification from '../components/ToastNotification';
import { useAuth } from '../contexts/AuthContext';
import { CATEGORIES } from '../data/appsData';
import { getStoredApps, saveStoredApps } from '../utils/appStorage';
import { api } from '../services/api';
import './DirectoryPage.css';

export default function DirectoryPage() {
  const { isAuthenticated, requireAuth, logout } = useAuth();

  const [apps, setApps] = useState(() => getStoredApps());
  const [isDbConnected, setIsDbConnected] = useState(false);
  const [dbInfo, setDbInfo] = useState('');
  const [databaseType, setDatabaseType] = useState('Neon Postgres');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOption, setSortOption] = useState('newest');
  const [selectedModalApp, setSelectedModalApp] = useState(null);
  const [editingApp, setEditingApp] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [appsPendingDeletion, setAppsPendingDeletion] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [recentlyDeleted, setRecentlyDeleted] = useState(null);

  // Load apps from database on initial mount
  useEffect(() => {
    let isMounted = true;
    async function loadFromDb() {
      const result = await api.getApps();
      if (isMounted) {
        setApps(result.apps);
        setIsDbConnected(result.isDatabase);
        setDbInfo(result.path || 'Neon Cloud');
        if (result.database) setDatabaseType(result.database);
      }
    }
    loadFromDb();
    return () => { isMounted = false; };
  }, []);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts = { All: apps.length };
    CATEGORIES.forEach((cat) => {
      if (cat !== 'All') {
        counts[cat] = apps.filter(
          (app) => app.category === cat || (app.secondaryCategories && app.secondaryCategories.includes(cat))
        ).length;
      }
    });
    return counts;
  }, [apps]);

  // Filter and Sort
  const filteredApps = useMemo(() => {
    let result = apps.filter((app) => {
      const matchesCategory =
        selectedCategory === 'All' ||
        app.category === selectedCategory ||
        (app.secondaryCategories && app.secondaryCategories.includes(selectedCategory));
      if (!matchesCategory) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          app.name.toLowerCase().includes(q) ||
          app.description.toLowerCase().includes(q) ||
          app.category.toLowerCase().includes(q) ||
          app.secondaryCategories?.some((sc) => sc.toLowerCase().includes(q)) ||
          app.tech?.toLowerCase().includes(q)
        );
      }
      return true;
    });

    return result.sort((a, b) => {
      switch (sortOption) {
        case 'name-asc': return a.name.localeCompare(b.name);
        case 'name-desc': return b.name.localeCompare(a.name);
        case 'newest': return (b.updatedAt || '').localeCompare(a.updatedAt || '');
        case 'status': {
          const rank = { Ready: 1, 'In Progress': 2, 'Coming Soon': 3 };
          return (rank[a.status] || 4) - (rank[b.status] || 4);
        }
        default: return 0;
      }
    });
  }, [apps, searchQuery, selectedCategory, sortOption]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
  };

  // ── Write Handlers (all use requireAuth) ──────────────────────────────────

  const handleAddApp = async (newApp) => {
    try {
      const created = await api.createApp(newApp);
      const updated = [created, ...apps.filter(a => a.id !== created.id)];
      setApps(updated);
      saveStoredApps(updated);
      setSearchQuery('');
      setSelectedCategory('All');
      setSortOption('newest');
      setToastMessage(`Saved "${created.name}" to ${databaseType}`);
    } catch (err) {
      if (err.status === 401) {
        setToastMessage('Session expired. Please sign in again.');
      } else {
        setToastMessage(`Error: ${err.message}`);
      }
    }
  };

  const handleUpdateApp = async (updatedApp) => {
    const targetId = updatedApp.id;
    // Optimistic update
    setApps((prev) => {
      const next = prev.map((a) => (a.id === targetId ? { ...a, ...updatedApp } : a));
      saveStoredApps(next);
      return next;
    });
    setEditingApp(null);
    setSelectedModalApp(null);

    try {
      const saved = await api.updateApp(targetId, updatedApp);
      if (saved && saved.id) {
        setApps((prev) => {
          const next = prev.map((a) => (a.id === saved.id ? { ...a, ...saved } : a));
          saveStoredApps(next);
          return next;
        });
        setToastMessage(`Updated "${saved.name || updatedApp.name}" in ${databaseType}`);
      } else {
        setToastMessage(`Updated "${updatedApp.name}" in ${databaseType}`);
      }
    } catch (err) {
      if (err.status === 401) setToastMessage('Session expired. Please sign in again.');
      else setToastMessage(`Updated "${updatedApp.name}"`);
    }
  };

  const requestDeleteSingle = (app) => {
    setSelectedModalApp(null);
    setAppsPendingDeletion([app]);
  };

  const handleConfirmDelete = async () => {
    if (!appsPendingDeletion || appsPendingDeletion.length === 0) return;
    const deletedIds = Array.from(new Set(appsPendingDeletion.map((a) => a.id)));
    const deletedIdSet = new Set(deletedIds);
    const remaining = apps.filter((app) => !deletedIdSet.has(app.id));
    const backup = [...appsPendingDeletion];

    try {
      await api.batchDeleteApps(deletedIds);
    } catch (err) {
      if (err.status === 401) {
        setToastMessage('Session expired. Please sign in again.');
        setAppsPendingDeletion(null);
        return;
      }
    }

    setApps(remaining);
    saveStoredApps(remaining);
    setRecentlyDeleted(backup);
    setToastMessage(
      backup.length === 1
        ? `Deleted "${backup[0].name}" from ${databaseType}`
        : `Deleted ${backup.length} applications from ${databaseType}`
    );
    setAppsPendingDeletion(null);
  };

  const handleUndoDelete = async () => {
    if (!recentlyDeleted || recentlyDeleted.length === 0) return;
    const existingIds = new Set(apps.map((a) => a.id));
    const toRestore = recentlyDeleted.filter((a) => !existingIds.has(a.id));
    for (const app of toRestore) {
      await api.createApp(app);
    }
    const restored = [...toRestore, ...apps];
    setApps(restored);
    saveStoredApps(restored);
    setRecentlyDeleted(null);
    setToastMessage(`Restored application(s) to ${databaseType}`);
  };

  // ── Auth-gated handlers ───────────────────────────────────────────────────

  const handleEditApp = useCallback((app) => {
    requireAuth(() => setEditingApp(app));
  }, [requireAuth]);

  const handleOpenAdd = useCallback(() => {
    requireAuth(() => setIsAddModalOpen(true));
  }, [requireAuth]);

  const totalCount = apps.length;

  return (
    <div className="directory-page">
      {/* Hero Header — sign in opens login modal via requireAuth */}
      <Header onSignIn={() => requireAuth(() => {})} />

      {/* Search, Add App Button, and Filter Controls Toolbar */}
      <div className="directory-toolbar">
        <div className="search-and-action-row">
          <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

          <button
            type="button"
            className="apple-button apple-button-primary add-app-btn"
            onClick={handleOpenAdd}
            id="btn-open-add-app"
            title="Add a new application to the directory"
          >
            <Plus size={16} />
            <span>Add App</span>
          </button>
        </div>

        <CategoryFilter
          categories={CATEGORIES}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          categoryCounts={categoryCounts}
        />

        <div className="directory-subtoolbar">
          <div className="results-counter">
            Showing <strong>{filteredApps.length}</strong> of {totalCount} app{totalCount !== 1 ? 's' : ''}
            {selectedCategory !== 'All' && <span> in <strong>{selectedCategory}</strong></span>}
          </div>

          <div className="subtoolbar-actions">
            <SortDropdown sortOption={sortOption} onSortChange={setSortOption} />
          </div>
        </div>
      </div>

      {/* Grid or Empty State */}
      <main className="directory-results-section" aria-live="polite">
        {filteredApps.length > 0 ? (
          <AppGrid
            apps={filteredApps}
            onSelectDetails={setSelectedModalApp}
            onEditApp={handleEditApp}
          />
        ) : (
          <EmptyState
            onClearFilters={handleClearFilters}
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
          />
        )}
      </main>

      {/* Modals */}
      <AddAppModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddApp={handleAddApp}
      />

      <EditAppModal
        isOpen={Boolean(editingApp)}
        app={editingApp}
        onClose={() => setEditingApp(null)}
        onUpdateApp={handleUpdateApp}
        onDeleteApp={(app) => requireAuth(() => requestDeleteSingle(app))}
      />

      {selectedModalApp && (
        <AppDetailsModal
          app={selectedModalApp}
          onClose={() => setSelectedModalApp(null)}
          onDeleteApp={(app) => requireAuth(() => requestDeleteSingle(app))}
          onEditApp={(app) => requireAuth(() => setEditingApp(app))}
        />
      )}

      <DeleteConfirmationModal
        isOpen={Boolean(appsPendingDeletion && appsPendingDeletion.length > 0)}
        appsToDelete={appsPendingDeletion || []}
        onConfirm={handleConfirmDelete}
        onClose={() => setAppsPendingDeletion(null)}
      />

      <ToastNotification
        message={toastMessage}
        onUndo={recentlyDeleted ? handleUndoDelete : null}
        onClose={() => setToastMessage('')}
      />
    </div>
  );
}
