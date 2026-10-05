import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'user';
  avatar: string;
  bio?: string;
  isBanned?: boolean;
  createdAt: string;
}

export interface Video {
  id: string;
  playlistId: string;
  title: string;
  youtubeUrl: string;
  youtubeId: string;
  description: string;
  duration: string;
  order: number;
  notesUrl?: string;
  createdAt: string;
}

export interface Playlist {
  id: string;
  userId: string;
  authorName: string;
  authorEmail: string;
  title: string;
  description: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  tags: string[];
  thumbnailUrl: string;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface Favorite {
  id: string;
  userId: string;
  playlistId: string;
  createdAt: string;
}

export interface VideoProgress {
  id: string;
  userId: string;
  playlistId: string;
  videoId: string;
  completed: boolean;
  completedAt?: string;
}

export interface Report {
  id: string;
  playlistId: string;
  playlistTitle: string;
  reporterId: string;
  reporterName: string;
  reporterEmail: string;
  reason: string;
  details: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface DatabaseSchema {
  users: User[];
  playlists: Playlist[];
  videos: Video[];
  favorites: Favorite[];
  videoProgress: VideoProgress[];
  reports: Report[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'database.json');

// Helper to extract YouTube ID
export function extractYouTubeId(url: string): string {
  if (!url) return '';
  const cleanUrl = url.trim();
  const match = cleanUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
  if (match && match[1]) {
    return match[1];
  }
  // If it's already an 11-char ID
  if (/^[\w-]{11}$/.test(cleanUrl)) {
    return cleanUrl;
  }
  return '';
}

// In-memory cache + persistent disk store
class Database {
  private data: DatabaseSchema = {
    users: [],
    playlists: [],
    videos: [],
    favorites: [],
    videoProgress: [],
    reports: [],
  };

  constructor() {
    this.init();
  }

  private init() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        // Ensure all collections exist
        this.data.users = this.data.users || [];
        this.data.playlists = this.data.playlists || [];
        this.data.videos = this.data.videos || [];
        this.data.favorites = this.data.favorites || [];
        this.data.videoProgress = this.data.videoProgress || [];
        this.data.reports = this.data.reports || [];
      } catch (err) {
        console.error('Error reading database, creating new one:', err);
        this.seedInitialData();
      }
    } else {
      this.seedInitialData();
    }
  }

  private persist() {
    try {
      const tempPath = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  private seedInitialData() {
    console.log('Seeding initial database with rich educational study playlists...');
    const adminHash = bcrypt.hashSync('AdminPass123!', 10);
    const learnerHash = bcrypt.hashSync('Learner123!', 10);
    const educatorHash = bcrypt.hashSync('Teacher123!', 10);

    const now = new Date().toISOString();

    const adminUser: User = {
      id: 'usr_admin_1',
      name: 'Admin Supervisor',
      email: 'admin@studyplaylist.com',
      passwordHash: adminHash,
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      bio: 'Study Playlist Platform Administrator & Lead Curriculum Reviewer',
      createdAt: now,
    };

    const learnerUser: User = {
      id: 'usr_learner_1',
      name: 'Alex Rivera',
      email: 'alex@example.com',
      passwordHash: learnerHash,
      role: 'user',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      bio: 'Cloud Architect & Self-taught Linux Enthusiast',
      createdAt: now,
    };

    const educatorUser: User = {
      id: 'usr_educator_1',
      name: 'Sarah Chen',
      email: 'sarah@example.com',
      passwordHash: educatorHash,
      role: 'user',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      bio: 'Senior Staff Engineer & DevOps Instructor',
      createdAt: now,
    };

    this.data.users = [adminUser, learnerUser, educatorUser];

    // Seed Playlists
    const p1: Playlist = {
      id: 'pl_devops_roadmap',
      userId: educatorUser.id,
      authorName: educatorUser.name,
      authorEmail: educatorUser.email,
      title: 'DevOps & CI/CD Pipeline Masterclass',
      description: 'A comprehensive curated journey covering GitOps, Jenkins, GitHub Actions, Docker containers, Kubernetes orchestration, and Infrastructure as Code.',
      category: 'DevOps',
      level: 'Intermediate',
      tags: ['DevOps', 'CI/CD', 'Docker', 'Kubernetes', 'GitHub Actions'],
      thumbnailUrl: 'https://images.unsplash.com/photo-1618401471353-b98aedd04e11?w=800&auto=format&fit=crop&q=80',
      views: 1420,
      createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
      updatedAt: now,
    };

    const p2: Playlist = {
      id: 'pl_linux_sysadmin',
      userId: learnerUser.id,
      authorName: learnerUser.name,
      authorEmail: learnerUser.email,
      title: 'Linux Command Line & System Administration',
      description: 'From fundamental bash commands, file permissions, and piping to systemd services, SSH hardening, and kernel monitoring in production.',
      category: 'Linux',
      level: 'Beginner',
      tags: ['Linux', 'Ubuntu', 'Bash', 'SysAdmin', 'Terminal'],
      thumbnailUrl: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=800&auto=format&fit=crop&q=80',
      views: 980,
      createdAt: new Date(Date.now() - 86400000 * 9).toISOString(),
      updatedAt: now,
    };

    const p3: Playlist = {
      id: 'pl_python_automation',
      userId: educatorUser.id,
      authorName: educatorUser.name,
      authorEmail: educatorUser.email,
      title: 'Modern Python: Zero to Automation & APIs',
      description: 'Learn modern Python syntax, object-oriented design, web scraping with BeautifulSoup, FastAPI backend microservices, and asynchronous tasks.',
      category: 'Python',
      level: 'All Levels',
      tags: ['Python', 'FastAPI', 'Automation', 'Backend', 'Scripting'],
      thumbnailUrl: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&auto=format&fit=crop&q=80',
      views: 2150,
      createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
      updatedAt: now,
    };

    const p4: Playlist = {
      id: 'pl_aws_cloud_architect',
      userId: adminUser.id,
      authorName: adminUser.name,
      authorEmail: adminUser.email,
      title: 'AWS Cloud Solutions Architecture Deep Dive',
      description: 'Hands-on architectural designs with Amazon EC2, VPC networking, S3 storage, IAM least-privilege policies, Lambda serverless, and RDS databases.',
      category: 'AWS',
      level: 'Advanced',
      tags: ['AWS', 'Cloud', 'EC2', 'S3', 'Architecture'],
      thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
      views: 1840,
      createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
      updatedAt: now,
    };

    const p5: Playlist = {
      id: 'pl_docker_production',
      userId: educatorUser.id,
      authorName: educatorUser.name,
      authorEmail: educatorUser.email,
      title: 'Docker & Microservices for Production Systems',
      description: 'Step-by-step containerization: multi-stage builds, Docker Compose orchestration, volume management, networking, and security best practices.',
      category: 'Docker',
      level: 'Intermediate',
      tags: ['Docker', 'Containers', 'DevOps', 'Microservices'],
      thumbnailUrl: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=800&auto=format&fit=crop&q=80',
      views: 1310,
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      updatedAt: now,
    };

    const p6: Playlist = {
      id: 'pl_fullstack_react_node',
      userId: learnerUser.id,
      authorName: learnerUser.name,
      authorEmail: learnerUser.email,
      title: 'Full-Stack Web Development with React 19 & Node.js',
      description: 'Build modern responsive fullstack apps: React state, Tailwind CSS, TypeScript interfaces, REST APIs with Express, JWT authentication, and SQL.',
      category: 'Web Development',
      level: 'Intermediate',
      tags: ['React', 'Node.js', 'TypeScript', 'TailwindCSS', 'FullStack'],
      thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
      views: 3200,
      createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
      updatedAt: now,
    };

    this.data.playlists = [p1, p2, p3, p4, p5, p6];

    // Seed Videos
    this.data.videos = [
      // DevOps Videos
      {
        id: 'vid_devops_1',
        playlistId: p1.id,
        title: 'DevOps Roadmap: What is DevOps in 2026?',
        youtubeUrl: 'https://www.youtube.com/watch?v=9pZ2xmsSDdo',
        youtubeId: '9pZ2xmsSDdo',
        description: 'Complete breakdown of what a modern DevOps Engineer does, key skillsets, CI/CD pipelines, and tools overview.',
        duration: '14:25',
        order: 1,
        notesUrl: 'https://roadmap.sh/devops',
        createdAt: now,
      },
      {
        id: 'vid_devops_2',
        playlistId: p1.id,
        title: 'CI/CD Pipeline with GitHub Actions Crash Course',
        youtubeUrl: 'https://www.youtube.com/watch?v=R8_veQiYBjI',
        youtubeId: 'R8_veQiYBjI',
        description: 'Automate testing, linting, building, and deployment workflows triggered on git push with GitHub Actions YAML.',
        duration: '22:40',
        order: 2,
        notesUrl: 'https://docs.github.com/actions',
        createdAt: now,
      },
      {
        id: 'vid_devops_3',
        playlistId: p1.id,
        title: 'Kubernetes in 100 Seconds & Full Architectural Tour',
        youtubeUrl: 'https://www.youtube.com/watch?v=PivpCKEiQOQ',
        youtubeId: 'PivpCKEiQOQ',
        description: 'Understand pods, deployments, replicaSets, ingress controllers, and services inside a Kubernetes cluster.',
        duration: '18:15',
        order: 3,
        notesUrl: 'https://kubernetes.io/docs/tutorials/',
        createdAt: now,
      },
      {
        id: 'vid_devops_4',
        playlistId: p1.id,
        title: 'Terraform Explained: Infrastructure as Code (IaC)',
        youtubeUrl: 'https://www.youtube.com/watch?v=tomUWcQ0P3k',
        youtubeId: 'tomUWcQ0P3k',
        description: 'Provision cloud resources reproducibly on AWS, GCP, and Azure using HashiCorp Terraform configuration.',
        duration: '28:10',
        order: 4,
        notesUrl: 'https://developer.hashicorp.com/terraform',
        createdAt: now,
      },

      // Linux Videos
      {
        id: 'vid_linux_1',
        playlistId: p2.id,
        title: 'Linux for Beginners - Full Course',
        youtubeUrl: 'https://www.youtube.com/watch?v=sWbGOq4inl8',
        youtubeId: 'sWbGOq4inl8',
        description: 'Get started with Linux filesystem navigation, file permissions (chmod, chown), pipes, grep, and vi/nano.',
        duration: '35:00',
        order: 1,
        notesUrl: 'https://linuxcommand.org',
        createdAt: now,
      },
      {
        id: 'vid_linux_2',
        playlistId: p2.id,
        title: 'Linux File Permissions and Ownership Explained',
        youtubeUrl: 'https://www.youtube.com/watch?v=5OKUe2O1V9s',
        youtubeId: '5OKUe2O1V9s',
        description: 'Deep dive into Read, Write, Execute flags, octal permission notation, SUID, and SGID in Unix environments.',
        duration: '16:30',
        order: 2,
        notesUrl: 'https://wiki.archlinux.org/title/File_permissions_and_attributes',
        createdAt: now,
      },
      {
        id: 'vid_linux_3',
        playlistId: p2.id,
        title: 'Systemd, Services, and Process Management in Linux',
        youtubeUrl: 'https://www.youtube.com/watch?v=a8sX5g3T_y8',
        youtubeId: 'a8sX5g3T_y8',
        description: 'How systemctl manages background services, targets, journalctl logs, and boot sequencing.',
        duration: '21:12',
        order: 3,
        createdAt: now,
      },

      // Python Videos
      {
        id: 'vid_python_1',
        playlistId: p3.id,
        title: 'Python for Beginners - Full Crash Course',
        youtubeUrl: 'https://www.youtube.com/watch?v=_uQrJ0TkZlc',
        youtubeId: '_uQrJ0TkZlc',
        description: 'Master variables, data structures (lists, dicts, tuples, sets), control flow, and functions in modern Python.',
        duration: '45:10',
        order: 1,
        notesUrl: 'https://docs.python.org/3/tutorial/',
        createdAt: now,
      },
      {
        id: 'vid_python_2',
        playlistId: p3.id,
        title: 'Automate Boring Tasks with Python Scripts',
        youtubeUrl: 'https://www.youtube.com/watch?v=1F_Ogq45eDV',
        youtubeId: '1F_Ogq45eDV',
        description: 'Automate Excel spreadsheets, file organization, PDF parsing, and web scraping with Requests and BeautifulSoup.',
        duration: '31:45',
        order: 2,
        createdAt: now,
      },
      {
        id: 'vid_python_3',
        playlistId: p3.id,
        title: 'FastAPI in 20 Minutes: High Performance Python APIs',
        youtubeUrl: 'https://www.youtube.com/watch?v=gQTRsZqcXJw',
        youtubeId: 'gQTRsZqcXJw',
        description: 'Build fast async microservice APIs with automatic Swagger docs, Pydantic type validation, and dependency injection.',
        duration: '20:18',
        order: 3,
        notesUrl: 'https://fastapi.tiangolo.com',
        createdAt: now,
      },

      // AWS Videos
      {
        id: 'vid_aws_1',
        playlistId: p4.id,
        title: 'AWS Certified Solutions Architect Associate Introduction',
        youtubeUrl: 'https://www.youtube.com/watch?v=Ia-UEYYR44s',
        youtubeId: 'Ia-UEYYR44s',
        description: 'Overview of AWS Global Infrastructure: Regions, Availability Zones, Edge Locations, and Core Services.',
        duration: '29:50',
        order: 1,
        notesUrl: 'https://aws.amazon.com/certification/certified-solutions-architect-associate/',
        createdAt: now,
      },
      {
        id: 'vid_aws_2',
        playlistId: p4.id,
        title: 'AWS EC2, Security Groups & VPC Networking Deep Dive',
        youtubeUrl: 'https://www.youtube.com/watch?v=HIwQ3Y8Hh48',
        youtubeId: 'HIwQ3Y8Hh48',
        description: 'Launch and configure Linux virtual servers on EC2, set up elastic IPs, SSH keys, security group ingress rules, and subnets.',
        duration: '34:20',
        order: 2,
        createdAt: now,
      },
      {
        id: 'vid_aws_3',
        playlistId: p4.id,
        title: 'AWS S3, IAM Roles and Serverless Lambda Functions',
        youtubeUrl: 'https://www.youtube.com/watch?v=71M_Zq0hYlM',
        youtubeId: '71M_Zq0hYlM',
        description: 'Architecting secure static hosting, event-driven compute with AWS Lambda, and least-privilege IAM policies.',
        duration: '26:40',
        order: 3,
        createdAt: now,
      },

      // Docker Videos
      {
        id: 'vid_docker_1',
        playlistId: p5.id,
        title: 'Docker Tutorial for Beginners [Full Course]',
        youtubeUrl: 'https://www.youtube.com/watch?v=fqMOX6JJhGo',
        youtubeId: 'fqMOX6JJhGo',
        description: 'Understand containers vs VMs, Dockerfile instructions (FROM, RUN, CMD, COPY, WORKDIR), and docker cli commands.',
        duration: '38:00',
        order: 1,
        notesUrl: 'https://docs.docker.com/get-started/',
        createdAt: now,
      },
      {
        id: 'vid_docker_2',
        playlistId: p5.id,
        title: 'Docker Compose Explained in 12 Minutes',
        youtubeUrl: 'https://www.youtube.com/watch?v=HG6yIjZapSA',
        youtubeId: 'HG6yIjZapSA',
        description: 'Spin up multi-container applications (frontend, backend, database) with a single `docker-compose up` command.',
        duration: '12:35',
        order: 2,
        createdAt: now,
      },

      // Web Development Videos
      {
        id: 'vid_web_1',
        playlistId: p6.id,
        title: 'React 19 Full Course - Everything You Need to Know',
        youtubeUrl: 'https://www.youtube.com/watch?v=bMknfKXIFA8',
        youtubeId: 'bMknfKXIFA8',
        description: 'Hooks, component architecture, state management, memoization, and responsive styling with modern React.',
        duration: '48:30',
        order: 1,
        notesUrl: 'https://react.dev',
        createdAt: now,
      },
      {
        id: 'vid_web_2',
        playlistId: p6.id,
        title: 'Node.js & Express REST API Architecture',
        youtubeUrl: 'https://www.youtube.com/watch?v=Oe421EPjeBE',
        youtubeId: 'Oe421EPjeBE',
        description: 'Routing, middleware, JWT authentication, request validation, error handlers, and database connections.',
        duration: '32:15',
        order: 2,
        createdAt: now,
      },
      {
        id: 'vid_web_3',
        playlistId: p6.id,
        title: 'Tailwind CSS From Scratch to Responsive UI',
        youtubeUrl: 'https://www.youtube.com/watch?v=dFgzHOX84xQ',
        youtubeId: 'dFgzHOX84xQ',
        description: 'Master utility-first CSS, flexbox, grid, responsive prefixes (sm, md, lg), and custom theme design tokens.',
        duration: '27:10',
        order: 3,
        createdAt: now,
      }
    ];

    // Seed Favorites
    this.data.favorites = [
      { id: 'fav_1', userId: learnerUser.id, playlistId: p1.id, createdAt: now },
      { id: 'fav_2', userId: learnerUser.id, playlistId: p4.id, createdAt: now },
      { id: 'fav_3', userId: educatorUser.id, playlistId: p2.id, createdAt: now },
    ];

    // Seed Video Progress (Learner has completed some videos)
    this.data.videoProgress = [
      { id: 'prog_1', userId: learnerUser.id, playlistId: p1.id, videoId: 'vid_devops_1', completed: true, completedAt: now },
      { id: 'prog_2', userId: learnerUser.id, playlistId: p1.id, videoId: 'vid_devops_2', completed: true, completedAt: now },
      { id: 'prog_3', userId: learnerUser.id, playlistId: p2.id, videoId: 'vid_linux_1', completed: true, completedAt: now },
    ];

    // Seed Reports (one sample pending report for Admin to test moderation)
    this.data.reports = [
      {
        id: 'rep_sample_1',
        playlistId: p3.id,
        playlistTitle: p3.title,
        reporterId: learnerUser.id,
        reporterName: learnerUser.name,
        reporterEmail: learnerUser.email,
        reason: 'Outdated or broken link in description',
        details: 'The reference link in video 2 points to an older documentation site version. Please review.',
        status: 'pending',
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      }
    ];

    this.persist();
  }

  // Users
  getUsers(): User[] {
    return this.data.users;
  }

  getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(user: User): User {
    this.data.users.push(user);
    this.persist();
    return user;
  }

  updateUser(id: string, updates: Partial<User>): User | null {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    this.data.users[idx] = { ...this.data.users[idx], ...updates };
    this.persist();
    return this.data.users[idx];
  }

  deleteUser(id: string): boolean {
    const initialLen = this.data.users.length;
    this.data.users = this.data.users.filter(u => u.id !== id);
    if (this.data.users.length !== initialLen) {
      // Cascade delete user playlists, favorites, progress
      const userPlaylists = this.data.playlists.filter(p => p.userId === id).map(p => p.id);
      this.data.playlists = this.data.playlists.filter(p => p.userId !== id);
      this.data.videos = this.data.videos.filter(v => !userPlaylists.includes(v.playlistId));
      this.data.favorites = this.data.favorites.filter(f => f.userId !== id);
      this.data.videoProgress = this.data.videoProgress.filter(vp => vp.userId !== id);
      this.persist();
      return true;
    }
    return false;
  }

  // Playlists
  getPlaylists(): Playlist[] {
    return this.data.playlists;
  }

  getPlaylistById(id: string): Playlist | undefined {
    return this.data.playlists.find(p => p.id === id);
  }

  createPlaylist(playlist: Playlist): Playlist {
    this.data.playlists.unshift(playlist);
    this.persist();
    return playlist;
  }

  updatePlaylist(id: string, updates: Partial<Playlist>): Playlist | null {
    const idx = this.data.playlists.findIndex(p => p.id === id);
    if (idx === -1) return null;
    this.data.playlists[idx] = {
      ...this.data.playlists[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.persist();
    return this.data.playlists[idx];
  }

  incrementPlaylistViews(id: string): void {
    const p = this.data.playlists.find(item => item.id === id);
    if (p) {
      p.views = (p.views || 0) + 1;
      this.persist();
    }
  }

  deletePlaylist(id: string): boolean {
    const idx = this.data.playlists.findIndex(p => p.id === id);
    if (idx === -1) return false;
    this.data.playlists.splice(idx, 1);
    this.data.videos = this.data.videos.filter(v => v.playlistId !== id);
    this.data.favorites = this.data.favorites.filter(f => f.playlistId !== id);
    this.data.videoProgress = this.data.videoProgress.filter(vp => vp.playlistId !== id);
    this.data.reports = this.data.reports.filter(r => r.playlistId !== id);
    this.persist();
    return true;
  }

  // Videos
  getVideosByPlaylistId(playlistId: string): Video[] {
    return this.data.videos
      .filter(v => v.playlistId === playlistId)
      .sort((a, b) => a.order - b.order);
  }

  getVideoById(id: string): Video | undefined {
    return this.data.videos.find(v => v.id === id);
  }

  createVideo(video: Video): Video {
    this.data.videos.push(video);
    this.persist();
    return video;
  }

  updateVideo(id: string, updates: Partial<Video>): Video | null {
    const idx = this.data.videos.findIndex(v => v.id === id);
    if (idx === -1) return null;
    this.data.videos[idx] = { ...this.data.videos[idx], ...updates };
    this.persist();
    return this.data.videos[idx];
  }

  deleteVideo(id: string): boolean {
    const idx = this.data.videos.findIndex(v => v.id === id);
    if (idx === -1) return false;
    const [removed] = this.data.videos.splice(idx, 1);
    this.data.videoProgress = this.data.videoProgress.filter(vp => vp.videoId !== id);
    // Reorder remaining videos in that playlist
    const remaining = this.data.videos
      .filter(v => v.playlistId === removed.playlistId)
      .sort((a, b) => a.order - b.order);
    remaining.forEach((v, index) => {
      v.order = index + 1;
    });
    this.persist();
    return true;
  }

  // Favorites
  getFavoritesByUserId(userId: string): Favorite[] {
    return this.data.favorites.filter(f => f.userId === userId);
  }

  getFavoriteCount(playlistId: string): number {
    return this.data.favorites.filter(f => f.playlistId === playlistId).length;
  }

  isFavorite(userId: string, playlistId: string): boolean {
    return this.data.favorites.some(f => f.userId === userId && f.playlistId === playlistId);
  }

  toggleFavorite(userId: string, playlistId: string): boolean {
    const existingIdx = this.data.favorites.findIndex(f => f.userId === userId && f.playlistId === playlistId);
    if (existingIdx !== -1) {
      this.data.favorites.splice(existingIdx, 1);
      this.persist();
      return false; // Removed
    } else {
      this.data.favorites.push({
        id: `fav_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        userId,
        playlistId,
        createdAt: new Date().toISOString(),
      });
      this.persist();
      return true; // Added
    }
  }

  // Progress
  getVideoProgressForUserAndPlaylist(userId: string, playlistId: string): VideoProgress[] {
    return this.data.videoProgress.filter(vp => vp.userId === userId && vp.playlistId === playlistId);
  }

  getAllProgressForUser(userId: string): VideoProgress[] {
    return this.data.videoProgress.filter(vp => vp.userId === userId);
  }

  toggleVideoProgress(userId: string, playlistId: string, videoId: string, completed?: boolean): boolean {
    const existing = this.data.videoProgress.find(
      vp => vp.userId === userId && vp.playlistId === playlistId && vp.videoId === videoId
    );

    let isCompleted = completed !== undefined ? completed : !(existing && existing.completed);

    if (existing) {
      existing.completed = isCompleted;
      existing.completedAt = isCompleted ? new Date().toISOString() : undefined;
    } else {
      this.data.videoProgress.push({
        id: `vp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        userId,
        playlistId,
        videoId,
        completed: isCompleted,
        completedAt: isCompleted ? new Date().toISOString() : undefined,
      });
    }

    this.persist();
    return isCompleted;
  }

  // Reports
  getReports(): Report[] {
    return this.data.reports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  createReport(report: Report): Report {
    this.data.reports.unshift(report);
    this.persist();
    return report;
  }

  updateReportStatus(id: string, status: 'pending' | 'resolved' | 'dismissed'): boolean {
    const r = this.data.reports.find(item => item.id === id);
    if (!r) return false;
    r.status = status;
    this.persist();
    return true;
  }

  deleteReport(id: string): boolean {
    const idx = this.data.reports.findIndex(r => r.id === id);
    if (idx === -1) return false;
    this.data.reports.splice(idx, 1);
    this.persist();
    return true;
  }

  // Categories & statistics
  getCategories(): { name: string; count: number }[] {
    const categoryMap: Record<string, number> = {};
    for (const p of this.data.playlists) {
      categoryMap[p.category] = (categoryMap[p.category] || 0) + 1;
    }
    return Object.entries(categoryMap).map(([name, count]) => ({ name, count }));
  }

  getAdminStats() {
    return {
      totalUsers: this.data.users.length,
      totalPlaylists: this.data.playlists.length,
      totalVideos: this.data.videos.length,
      totalReports: this.data.reports.length,
      pendingReports: this.data.reports.filter(r => r.status === 'pending').length,
    };
  }
}

export const db = new Database();
