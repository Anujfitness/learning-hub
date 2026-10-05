import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { ExplorePage } from './pages/ExplorePage';
import { PlaylistDetailPage } from './pages/PlaylistDetailPage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminPage } from './pages/AdminPage';
import { AuthModal } from './components/AuthModal';
import { PlaylistFormModal } from './components/PlaylistFormModal';
import { Playlist } from './types';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}

function MainApp() {
  const [currentView, setCurrentView] = useState<'home' | 'explore' | 'detail' | 'dashboard' | 'admin'>('home');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Playlist Form Modal (Create or Edit)
  const [playlistModalOpen, setPlaylistModalOpen] = useState(false);
  const [playlistToEdit, setPlaylistToEdit] = useState<Playlist | null>(null);

  // Sync with browser hash if user shares a link e.g. #playlist-pl_devops_roadmap
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash.startsWith('playlist-')) {
        const id = hash.replace('playlist-', '');
        setSelectedPlaylistId(id);
        setCurrentView('detail');
      } else if (hash === 'explore') {
        setCurrentView('explore');
      } else if (hash === 'dashboard') {
        setCurrentView('dashboard');
      } else if (hash === 'admin') {
        setCurrentView('admin');
      } else if (hash === 'home' || !hash) {
        setCurrentView('home');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (view: string, playlistId?: string) => {
    if (view.startsWith('explore')) {
      const qIndex = view.indexOf('?q=');
      if (qIndex !== -1) {
        const query = decodeURIComponent(view.substring(qIndex + 3));
        setSearchFilter(query);
      }
      setCurrentView('explore');
      window.location.hash = 'explore';
    } else if (view === 'detail' && playlistId) {
      setSelectedPlaylistId(playlistId);
      setCurrentView('detail');
      window.location.hash = `playlist-${playlistId}`;
    } else {
      setSelectedPlaylistId(null);
      setCurrentView(view as any);
      window.location.hash = view;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectPlaylist = (id: string) => {
    setSelectedPlaylistId(id);
    setCurrentView('detail');
    window.location.hash = `playlist-${id}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenCreatePlaylist = () => {
    setPlaylistToEdit(null);
    setPlaylistModalOpen(true);
  };

  const handleEditPlaylist = (playlist: Playlist) => {
    setPlaylistToEdit(playlist);
    setPlaylistModalOpen(true);
  };

  const handleCategoryFromHome = (cat: string) => {
    setCategoryFilter(cat);
    setCurrentView('explore');
    window.location.hash = 'explore';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Navigation Bar */}
      <Navbar
        currentView={currentView}
        onNavigate={navigateTo}
        onOpenCreatePlaylist={handleOpenCreatePlaylist}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'home' && (
          <HomePage
            onSelectPlaylist={handleSelectPlaylist}
            onNavigate={navigateTo}
            onOpenCreatePlaylist={handleOpenCreatePlaylist}
            onFilterByCategory={handleCategoryFromHome}
          />
        )}

        {currentView === 'explore' && (
          <ExplorePage
            initialCategory={categoryFilter}
            initialSearch={searchFilter}
            onSelectPlaylist={handleSelectPlaylist}
            onOpenCreatePlaylist={handleOpenCreatePlaylist}
          />
        )}

        {currentView === 'detail' && selectedPlaylistId && (
          <PlaylistDetailPage
            playlistId={selectedPlaylistId}
            onBack={() => navigateTo('explore')}
            onPlaylistDeleted={() => navigateTo('explore')}
          />
        )}

        {currentView === 'dashboard' && (
          <DashboardPage
            onSelectPlaylist={handleSelectPlaylist}
            onOpenCreatePlaylist={handleOpenCreatePlaylist}
            onEditPlaylist={handleEditPlaylist}
          />
        )}

        {currentView === 'admin' && (
          <AdminPage onSelectPlaylist={handleSelectPlaylist} />
        )}
      </main>

      {/* Global Modals */}
      <AuthModal />

      <PlaylistFormModal
        isOpen={playlistModalOpen}
        onClose={() => setPlaylistModalOpen(false)}
        playlistToEdit={playlistToEdit}
        onSuccess={newOrUpdated => {
          handleSelectPlaylist(newOrUpdated.id);
        }}
      />

      {/* Footer */}
      <Footer
        onCategorySelect={handleCategoryFromHome}
        onNavigate={navigateTo}
      />
    </div>
  );
}
