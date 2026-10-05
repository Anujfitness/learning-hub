import { Router } from 'express';
import { db } from '../db.js';
import { authMiddleware, adminMiddleware, AuthRequest } from '../auth.js';

const router = Router();

// Apply auth and admin check to all routes in this router
router.use(authMiddleware);
router.use(adminMiddleware);

// GET admin system statistics
router.get('/stats', (_req, res) => {
  try {
    const stats = db.getAdminStats();
    res.json({ stats });
  } catch (err) {
    console.error('Error fetching admin stats:', err);
    res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
});

// GET all reports
router.get('/reports', (_req, res) => {
  try {
    const reports = db.getReports();
    res.json({ reports });
  } catch (err) {
    console.error('Error fetching reports:', err);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// UPDATE report status
router.put('/reports/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'resolved', 'dismissed'].includes(status)) {
      res.status(400).json({ error: 'Invalid status. Must be pending, resolved, or dismissed.' });
      return;
    }

    const success = db.updateReportStatus(id, status);
    if (!success) {
      res.status(404).json({ error: 'Report not found' });
      return;
    }

    res.json({ message: `Report marked as ${status}` });
  } catch (err) {
    console.error('Error updating report:', err);
    res.status(500).json({ error: 'Failed to update report' });
  }
});

// DELETE report
router.delete('/reports/:id', (req, res) => {
  try {
    const { id } = req.params;
    const success = db.deleteReport(id);
    if (!success) {
      res.status(404).json({ error: 'Report not found' });
      return;
    }
    res.json({ message: 'Report deleted successfully' });
  } catch (err) {
    console.error('Error deleting report:', err);
    res.status(500).json({ error: 'Failed to delete report' });
  }
});

// GET all users
router.get('/users', (_req, res) => {
  try {
    const users = db.getUsers();
    const playlists = db.getPlaylists();

    const enrichedUsers = users.map(u => {
      const userPlaylists = playlists.filter(p => p.userId === u.id);
      const { passwordHash: _, ...safeUser } = u;
      return {
        ...safeUser,
        playlistCount: userPlaylists.length,
      };
    });

    res.json({ users: enrichedUsers });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// TOGGLE or UPDATE user role (admin / user)
router.put('/users/:id/role', (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (id === req.user?.id) {
      res.status(400).json({ error: 'You cannot change your own admin role.' });
      return;
    }

    if (!['admin', 'user'].includes(role)) {
      res.status(400).json({ error: 'Role must be admin or user.' });
      return;
    }

    const updated = db.updateUser(id, { role });
    if (!updated) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const { passwordHash: _, ...safeUser } = updated;
    res.json({ message: `User role updated to ${role}`, user: safeUser });
  } catch (err) {
    console.error('Error changing user role:', err);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// BAN or UNBAN user
router.put('/users/:id/ban', (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { isBanned } = req.body;

    if (id === req.user?.id) {
      res.status(400).json({ error: 'You cannot ban your own account.' });
      return;
    }

    const updated = db.updateUser(id, { isBanned: Boolean(isBanned) });
    if (!updated) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const { passwordHash: _, ...safeUser } = updated;
    res.json({
      message: isBanned ? 'User has been banned.' : 'User ban has been lifted.',
      user: safeUser,
    });
  } catch (err) {
    console.error('Error updating ban status:', err);
    res.status(500).json({ error: 'Failed to update user ban status' });
  }
});

// DELETE user
router.delete('/users/:id', (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    if (id === req.user?.id) {
      res.status(400).json({ error: 'You cannot delete your own account.' });
      return;
    }

    const success = db.deleteUser(id);
    if (!success) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ message: 'User and all associated data deleted successfully.' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// ADMIN DELETE inappropriate playlist
router.delete('/playlists/:id', (req, res) => {
  try {
    const { id } = req.params;
    const playlist = db.getPlaylistById(id);
    if (!playlist) {
      res.status(404).json({ error: 'Playlist not found' });
      return;
    }

    db.deletePlaylist(id);

    // Also mark related reports as resolved
    const reports = db.getReports().filter(r => r.playlistId === id);
    for (const rep of reports) {
      db.updateReportStatus(rep.id, 'resolved');
    }

    res.json({ message: 'Playlist removed and associated reports resolved.' });
  } catch (err) {
    console.error('Error deleting playlist:', err);
    res.status(500).json({ error: 'Failed to remove playlist' });
  }
});

export default router;
