import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  BookOpen,
  Sun,
  Moon,
  PlusCircle,
  User as UserIcon,
  LogOut,
  Shield,
  LayoutDashboard,
  Compass,
  Menu,
  X,
  Search,
} from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, playlistId?: string) => void;
  onOpenCreatePlaylist: () => void;
  onSearch?: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenCreatePlaylist,
}) => {
  const { user, isAdmin, logout, openLogin, openRegister } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleNavClick = (view: string) => {
    onNavigate(view);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  const handleCreateClick = () => {
    if (!user) {
      openLogin();
    } else {
      onOpenCreatePlaylist();
    }
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/95 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/95 transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-zinc-900 via-indigo-950 to-zinc-800 bg-clip-text text-transparent dark:from-white dark:via-zinc-200 dark:to-zinc-400">
                Study<span className="text-indigo-600 dark:text-indigo-400">Playlist</span>
              </span>
              <span className="hidden sm:block text-[10px] uppercase font-semibold tracking-wider text-zinc-500 dark:text-zinc-400 -mt-1">
                Learn • Organize • Grow
              </span>
            </div>
          </button>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1 ml-8">
            <button
              onClick={() => handleNavClick('home')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'home'
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                  : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick('explore')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'explore'
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                  : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
              }`}
            >
              <Compass className="h-4 w-4" />
              Explore
            </button>
            {user && (
              <button
                onClick={() => handleNavClick('dashboard')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  currentView === 'dashboard'
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                    : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() => handleNavClick('admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                  currentView === 'admin'
                    ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-300'
                    : 'text-amber-600 hover:text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                }`}
              >
                <Shield className="h-4 w-4" />
                Admin Panel
              </button>
            )}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Search Button */}
          <button
            onClick={() => handleNavClick('explore')}
            aria-label="Search playlists"
            className="flex items-center justify-center p-2 rounded-lg text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="flex items-center justify-center p-2 rounded-lg text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-zinc-700" />}
          </button>

          {/* Create Playlist Button */}
          <button
            onClick={handleCreateClick}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 active:scale-95 transition shadow-sm shadow-indigo-600/20"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Create Playlist</span>
          </button>

          {/* Auth State */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1 pl-2 rounded-full border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition"
              >
                <span className="hidden md:inline text-xs font-semibold text-zinc-700 dark:text-zinc-200 max-w-[120px] truncate">
                  {user.name}
                </span>
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-8 w-8 rounded-full object-cover ring-2 ring-indigo-500/30"
                />
              </button>

              {/* Dropdown Menu */}
              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-zinc-100 dark:border-zinc-800">
                    <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">{user.name}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{user.email}</p>
                    <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-md bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                      {user.role}
                    </span>
                  </div>

                  <button
                    onClick={() => handleNavClick('dashboard')}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-left"
                  >
                    <LayoutDashboard className="h-4 w-4 text-zinc-400" />
                    My Dashboard
                  </button>

                  <button
                    onClick={handleCreateClick}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-left sm:hidden"
                  >
                    <PlusCircle className="h-4 w-4 text-zinc-400" />
                    Create Playlist
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => handleNavClick('admin')}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-left font-medium"
                    >
                      <Shield className="h-4 w-4 text-amber-500" />
                      Admin Control
                    </button>
                  )}

                  <div className="border-t border-zinc-100 dark:border-zinc-800 my-1"></div>

                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={openLogin}
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-zinc-700 hover:text-zinc-900 dark:text-zinc-200 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                Sign In
              </button>
              <button
                onClick={openRegister}
                className="hidden sm:inline-flex px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 active:scale-95 transition shadow-sm"
              >
                Sign Up
              </button>
            </div>
          )}

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 pt-2 pb-6 space-y-2">
          <button
            onClick={() => handleNavClick('home')}
            className="w-full text-left px-3 py-2 rounded-lg text-base font-medium text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Home
          </button>
          <button
            onClick={() => handleNavClick('explore')}
            className="w-full text-left px-3 py-2 rounded-lg text-base font-medium text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Explore Playlists
          </button>
          {user && (
            <button
              onClick={() => handleNavClick('dashboard')}
              className="w-full text-left px-3 py-2 rounded-lg text-base font-medium text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              My Dashboard
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => handleNavClick('admin')}
              className="w-full text-left px-3 py-2 rounded-lg text-base font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30"
            >
              Admin Moderation
            </button>
          )}

          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <button
              onClick={handleCreateClick}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white font-medium shadow-sm"
            >
              <PlusCircle className="h-5 w-5" />
              Create New Playlist
            </button>
          </div>

          {!user && (
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openLogin();
                }}
                className="w-full py-2 text-center rounded-lg border border-zinc-300 dark:border-zinc-700 text-sm font-medium text-zinc-700 dark:text-zinc-200"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openRegister();
                }}
                className="w-full py-2 text-center rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-sm font-medium"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
