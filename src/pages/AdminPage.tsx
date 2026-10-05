import React, { useState, useEffect } from 'react';
import { AdminStats, Report, User, Playlist } from '../types';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  AlertTriangle,
  Users,
  Film,
  CheckCircle,
  XCircle,
  Trash2,
  Lock,
  Unlock,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface AdminPageProps {
  onSelectPlaylist: (playlistId: string) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onSelectPlaylist }) => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'reports' | 'users' | 'playlists'>('reports');
  const [userSearch, setUserSearch] = useState('');

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, reportsRes, usersRes, playlistsRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminReports(),
        api.getAdminUsers(),
        api.getPlaylists(),
      ]);
      setStats(statsRes.stats);
      setReports(reportsRes.reports);
      setUsers(usersRes.users);
      setPlaylists(playlistsRes.playlists);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center space-y-4">
        <div className="p-4 rounded-3xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 inline-block">
          <ShieldAlert className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Admin Access Restricted</h2>
        <p className="text-sm text-zinc-500">
          This section requires administrative privileges. Please log in with an administrator account (e.g. admin@studyplaylist.com).
        </p>
      </div>
    );
  }

  const handleUpdateReportStatus = async (id: string, status: 'resolved' | 'dismissed') => {
    try {
      await api.updateAdminReport(id, status);
      loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to update report');
    }
  };

  const handleDeleteReport = async (id: string) => {
    if (confirm('Delete this report entry?')) {
      try {
        await api.deleteAdminReport(id);
        loadAdminData();
      } catch (err: any) {
        alert(err.message || 'Failed to delete report');
      }
    }
  };

  const handleToggleUserRole = async (targetUser: User) => {
    const newRole = targetUser.role === 'admin' ? 'user' : 'admin';
    if (confirm(`Change ${targetUser.name}'s role to "${newRole}"?`)) {
      try {
        await api.updateUserRole(targetUser.id, newRole);
        loadAdminData();
      } catch (err: any) {
        alert(err.message || 'Failed to change role');
      }
    }
  };

  const handleToggleUserBan = async (targetUser: User) => {
    const nextBanState = !targetUser.isBanned;
    const actionWord = nextBanState ? 'suspend/ban' : 'unban';
    if (confirm(`Are you sure you want to ${actionWord} ${targetUser.name}?`)) {
      try {
        await api.updateUserBan(targetUser.id, nextBanState);
        loadAdminData();
      } catch (err: any) {
        alert(err.message || 'Failed to update ban state');
      }
    }
  };

  const handleDeleteUser = async (targetUser: User) => {
    if (confirm(`Permanently delete user "${targetUser.name}" and all their playlists?`)) {
      try {
        await api.deleteUser(targetUser.id);
        loadAdminData();
      } catch (err: any) {
        alert(err.message || 'Failed to delete user');
      }
    }
  };

  const handleAdminDeletePlaylist = async (playlistId: string, title: string) => {
    if (confirm(`ADMIN ACTION: Permanently remove playlist "${title}" and all its videos?`)) {
      try {
        await api.adminDeletePlaylist(playlistId);
        loadAdminData();
      } catch (err: any) {
        alert(err.message || 'Failed to remove playlist');
      }
    }
  };

  const filteredUsers = users.filter(
    u =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl border border-amber-200 dark:border-amber-900/50 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-amber-500 text-white shadow-md shadow-amber-500/20">
            <Shield className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white">
                Admin Moderation Panel
              </h1>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                Staff Only
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Manage reported content, user permissions, and platform-wide playlists
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 sm:p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-white">
                {stats.totalUsers}
              </p>
              <p className="text-xs text-zinc-500">Registered Users</p>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
              <Film className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-white">
                {stats.totalPlaylists}
              </p>
              <p className="text-xs text-zinc-500">Active Playlists</p>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
              <Film className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-white">
                {stats.totalVideos}
              </p>
              <p className="text-xs text-zinc-500">Curated Lessons</p>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-white">
                {stats.pendingReports}
              </p>
              <p className="text-xs text-zinc-500">Pending Reports</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="space-y-6">
        <div className="flex border-b border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 text-sm font-semibold transition ${
              activeTab === 'reports'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <AlertTriangle className="h-4 w-4" />
            <span>Reports ({reports.length})</span>
            {reports.filter(r => r.status === 'pending').length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-bold">
                {reports.filter(r => r.status === 'pending').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 text-sm font-semibold transition ${
              activeTab === 'users'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>User Management ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('playlists')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 text-sm font-semibold transition ${
              activeTab === 'playlists'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Film className="h-4 w-4" />
            <span>All Playlists ({playlists.length})</span>
          </button>
        </div>

        {/* Tab 1: Moderation Reports */}
        {activeTab === 'reports' && (
          <div className="space-y-3">
            {reports.length === 0 ? (
              <div className="text-center py-12 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800">
                <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">Clean Queue</h3>
                <p className="text-xs text-zinc-500">No inappropriate content reports have been submitted.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reports.map(rep => (
                  <div
                    key={rep.id}
                    className="p-4 sm:p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            rep.status === 'pending'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : rep.status === 'resolved'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300'
                          }`}
                        >
                          {rep.status}
                        </span>
                        <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                          Target: "{rep.playlistTitle}"
                        </h4>
                      </div>

                      <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                        Reason: {rep.reason}
                      </p>

                      {rep.details && (
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/50 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800">
                          {rep.details}
                        </p>
                      )}

                      <p className="text-[11px] text-zinc-400">
                        Reported by {rep.reporterName} ({rep.reporterEmail}) on {new Date(rep.createdAt).toLocaleString()}
                      </p>
                    </div>

                    {/* Report Actions */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        onClick={() => onSelectPlaylist(rep.playlistId)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                      >
                        Inspect
                      </button>

                      {rep.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleUpdateReportStatus(rep.id, 'resolved')}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition"
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                            <span>Resolve</span>
                          </button>
                          <button
                            onClick={() => handleUpdateReportStatus(rep.id, 'dismissed')}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 text-xs font-semibold transition"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            <span>Dismiss</span>
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => handleAdminDeletePlaylist(rep.playlistId, rep.playlistTitle)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition"
                        title="Delete offending playlist"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Remove Playlist</span>
                      </button>

                      <button
                        onClick={() => handleDeleteReport(rep.id)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition"
                        title="Delete report log"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: User Management */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <input
              type="text"
              value={userSearch}
              onChange={e => setUserSearch(e.target.value)}
              placeholder="Search users by name or email..."
              className="w-full sm:w-72 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />

            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400">
                    <tr>
                      <th className="py-3 px-4 font-semibold">User</th>
                      <th className="py-3 px-4 font-semibold">Role</th>
                      <th className="py-3 px-4 font-semibold">Playlists</th>
                      <th className="py-3 px-4 font-semibold">Status</th>
                      <th className="py-3 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {filteredUsers.map(u => {
                      const isSelf = u.id === user?.id;
                      return (
                        <tr key={u.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={u.avatar}
                                alt={u.name}
                                className="h-8 w-8 rounded-full object-cover"
                              />
                              <div>
                                <p className="font-semibold text-zinc-900 dark:text-white">
                                  {u.name} {isSelf && '(You)'}
                                </p>
                                <p className="text-[11px] text-zinc-400">{u.email}</p>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                u.role === 'admin'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300'
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>

                          <td className="py-3 px-4 font-medium text-zinc-700 dark:text-zinc-300">
                            {u.playlistCount ?? 0}
                          </td>

                          <td className="py-3 px-4">
                            {u.isBanned ? (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">
                                Banned
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                Active
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-right">
                            {!isSelf && (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleToggleUserRole(u)}
                                  className="px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-[11px] font-semibold text-zinc-700 dark:text-zinc-300"
                                >
                                  {u.role === 'admin' ? 'Demote to User' : 'Make Admin'}
                                </button>

                                <button
                                  onClick={() => handleToggleUserBan(u)}
                                  className={`p-1.5 rounded-lg border text-[11px] font-semibold transition ${
                                    u.isBanned
                                      ? 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                                      : 'border-amber-200 text-amber-600 hover:bg-amber-50'
                                  }`}
                                  title={u.isBanned ? 'Unban user' : 'Ban user'}
                                >
                                  {u.isBanned ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                                </button>

                                <button
                                  onClick={() => handleDeleteUser(u)}
                                  className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                                  title="Delete user"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Platform Playlists */}
        {activeTab === 'playlists' && (
          <div className="space-y-3">
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400">
                    <tr>
                      <th className="py-3 px-4 font-semibold">Title</th>
                      <th className="py-3 px-4 font-semibold">Creator</th>
                      <th className="py-3 px-4 font-semibold">Category</th>
                      <th className="py-3 px-4 font-semibold">Lessons</th>
                      <th className="py-3 px-4 font-semibold text-right">Moderation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {playlists.map(p => (
                      <tr key={p.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                        <td className="py-3 px-4">
                          <button
                            onClick={() => onSelectPlaylist(p.id)}
                            className="font-bold text-zinc-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 text-left line-clamp-1"
                          >
                            {p.title}
                          </button>
                        </td>

                        <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">
                          {p.authorName}
                        </td>

                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                            {p.category}
                          </span>
                        </td>

                        <td className="py-3 px-4 font-medium text-zinc-700 dark:text-zinc-300">
                          {p.videoCount || 0}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => onSelectPlaylist(p.id)}
                              className="px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-[11px] font-semibold"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleAdminDeletePlaylist(p.id, p.title)}
                              className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                              title="Delete playlist"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
