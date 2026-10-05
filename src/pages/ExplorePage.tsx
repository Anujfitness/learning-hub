import React, { useState, useEffect } from 'react';
import { Playlist } from '../types';
import { api } from '../lib/api';
import { PlaylistCard } from '../components/PlaylistCard';
import { Search, Filter, SlidersHorizontal, BookOpen, PlusCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ExplorePageProps {
  initialCategory?: string;
  initialSearch?: string;
  onSelectPlaylist: (playlistId: string) => void;
  onOpenCreatePlaylist: () => void;
}

const CATEGORIES = [
  'All',
  'DevOps',
  'Linux',
  'Python',
  'AWS',
  'Docker',
  'Web Development',
  'Data Science',
  'AI & ML',
  'Cybersecurity',
];

const LEVELS = ['All', 'Beginner', 'Intermediate', 'Advanced'];

export const ExplorePage: React.FC<ExplorePageProps> = ({
  initialCategory = 'All',
  initialSearch = '',
  onSelectPlaylist,
  onOpenCreatePlaylist,
}) => {
  const { user, openLogin } = useAuth();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [sortOption, setSortOption] = useState('popular');

  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      const res = await api.getPlaylists({
        category: selectedCategory === 'All' ? undefined : selectedCategory,
        search: searchQuery.trim() || undefined,
        level: selectedLevel === 'All' ? undefined : selectedLevel,
        sort: sortOption,
      });
      setPlaylists(res.playlists);
    } catch (err) {
      console.error('Failed to load playlists:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylists();
  }, [selectedCategory, selectedLevel, sortOption]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPlaylists();
  };

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
    setSelectedLevel('All');
    setSortOption('popular');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Page Title & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Explore Study Playlists
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Discover curated tutorials, roadmaps, and community courses
          </p>
        </div>

        <form
          onSubmit={handleSearchSubmit}
          className="relative flex items-center w-full md:w-80 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 focus-within:ring-2 focus-within:ring-indigo-500"
        >
          <Search className="h-4 w-4 text-zinc-400 shrink-0 mr-2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search keywords, topics..."
            className="w-full bg-transparent text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setTimeout(fetchPlaylists, 0);
              }}
              className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Filter and Category Pills */}
      <div className="space-y-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition active:scale-95 ${
                selectedCategory.toLowerCase() === cat.toLowerCase()
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Secondary Filters Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-zinc-500 font-medium">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Filters:</span>
            </div>

            {/* Level Selector */}
            <div className="flex items-center gap-1">
              <span className="text-zinc-400">Level:</span>
              <select
                value={selectedLevel}
                onChange={e => setSelectedLevel(e.target.value)}
                className="bg-transparent font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none cursor-pointer"
              >
                {LEVELS.map(l => (
                  <option key={l} value={l} className="dark:bg-zinc-800">
                    {l}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-1 border-l border-zinc-200 dark:border-zinc-800 pl-3">
              <span className="text-zinc-400">Sort by:</span>
              <select
                value={sortOption}
                onChange={e => setSortOption(e.target.value)}
                className="bg-transparent font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none cursor-pointer"
              >
                <option value="popular" className="dark:bg-zinc-800">
                  Most Popular
                </option>
                <option value="newest" className="dark:bg-zinc-800">
                  Newest Added
                </option>
                <option value="videos" className="dark:bg-zinc-800">
                  Lesson Count
                </option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 text-zinc-500">
            <span>
              Showing <strong className="text-zinc-900 dark:text-white">{playlists.length}</strong> playlists
            </span>
            {(selectedCategory !== 'All' || selectedLevel !== 'All' || searchQuery) && (
              <button
                onClick={handleResetFilters}
                className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid of Results */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-80 rounded-2xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
          ))}
        </div>
      ) : playlists.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 space-y-4">
          <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
            <BookOpen className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">No playlists found</h3>
            <p className="text-sm text-zinc-500 max-w-sm">
              We couldn't find any study playlists matching your current filter criteria.
            </p>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-xl text-xs font-semibold border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              Reset Filters
            </button>
            <button
              onClick={() => {
                if (!user) openLogin();
                else onOpenCreatePlaylist();
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition"
            >
              <PlusCircle className="h-4 w-4" />
              Create First in this Category
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {playlists.map(playlist => (
            <PlaylistCard
              key={playlist.id}
              playlist={playlist}
              onClick={() => onSelectPlaylist(playlist.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
