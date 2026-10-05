import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db, User } from '../db.js';
import { generateToken, authMiddleware, AuthRequest } from '../auth.js';

const router = Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email, and password are required.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = db.getUserByEmail(normalizedEmail);
    if (existingUser) {
      res.status(409).json({ error: 'An account with this email address already exists.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    // Allow admin role if explicitly chosen or first user, default to 'user'
    const assignedRole = role === 'admin' ? 'admin' : 'user';

    // Nice avatar placeholder based on initials
    const avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=0284c7,2563eb,4f46e5`;

    const newUser: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: assignedRole,
      avatar,
      bio: '',
      isBanned: false,
      createdAt: new Date().toISOString(),
    };

    db.createUser(newUser);
    const token = generateToken(newUser);

    // Return user without sensitive password hash
    const { passwordHash: _, ...safeUser } = newUser;
    res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: safeUser,
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Failed to create account. Please try again.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = db.getUserByEmail(normalizedEmail);

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    if (user.isBanned) {
      res.status(403).json({ error: 'Your account has been suspended by an administrator.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const token = generateToken(user);
    const { passwordHash: _, ...safeUser } = user;

    res.json({
      message: 'Logged in successfully!',
      token,
      user: safeUser,
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login. Please try again.' });
  }
});

// Get current user profile
router.get('/me', authMiddleware, (req: AuthRequest, res) => {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  const { passwordHash: _, ...safeUser } = req.user;
  res.json({ user: safeUser });
});

// Update profile
router.put('/profile', authMiddleware, (req: AuthRequest, res) => {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  const { name, bio, avatar } = req.body;
  const updates: Partial<User> = {};

  if (name && name.trim()) updates.name = name.trim();
  if (bio !== undefined) updates.bio = bio;
  if (avatar && avatar.trim()) updates.avatar = avatar.trim();

  const updated = db.updateUser(req.user.id, updates);
  if (!updated) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const { passwordHash: _, ...safeUser } = updated;
  res.json({ message: 'Profile updated successfully', user: safeUser });
});

export default router;
