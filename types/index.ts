export type Role = "SUPER_ADMIN" | "RADIO_ADMIN" | "PRESENTER" | "EDITOR";

export type RequestStatus = "PENDING" | "APPROVED" | "PLAYED" | "REJECTED";

export type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar?: string | null;
}

export interface UniversityItem {
  id: string;
  name: string;
  shortName?: string | null;
  location?: string | null;
  country: string;
  isActive: boolean;
  listenerCount?: number;
  sessionCount?: number;
  totalDurationSeconds?: number;
  avgDurationMinutes?: number;
  lastActivity?: string | Date | null;
  createdAt: string | Date;
}

export type EventType =
  | "LISTEN_STARTED"
  | "LISTEN_PAUSED"
  | "LISTEN_RESUMED"
  | "LISTEN_STOPPED"
  | "LISTEN_SESSION_STARTED"
  | "LISTEN_SESSION_ENDED"
  | "PROGRAMME_VIEWED"
  | "PODCAST_PLAYED"
  | "NEWS_VIEWED"
  | "REQUEST_SUBMITTED"
  | "UNIVERSITY_SELECTED";

export interface ProgrammeWithRelations {
  id: string;
  title: string;
  slug: string;
  tagline: string;
  description: string;
  coverImage: string;
  categoryId: string;
  category: {
    id: string;
    name: string;
    slug: string;
    color: string;
  };
  presenterId: string;
  presenter: {
    id: string;
    name: string;
    slug: string;
    roleTitle: string;
    avatar: string;
  };
  schedules?: ScheduleItem[];
}

export interface ScheduleItem {
  id: string;
  programmeId: string;
  dayOfWeek: DayOfWeek;
  startTime: string; // "08:00"
  endTime: string;   // "10:00"
  isLive: boolean;
  programme: {
    id: string;
    title: string;
    slug: string;
    tagline: string;
    coverImage: string;
    category: {
      name: string;
      color: string;
    };
    presenter: {
      name: string;
      roleTitle: string;
      avatar: string;
    };
  };
}

export interface PresenterProfile {
  id: string;
  name: string;
  slug: string;
  roleTitle: string;
  bio: string;
  avatar: string;
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    facebook?: string;
  } | null;
  isActive: boolean;
  programmes?: {
    id: string;
    title: string;
    slug: string;
    coverImage: string;
  }[];
}

export interface PodcastEpisode {
  id: string;
  title: string;
  slug: string;
  description: string;
  audioUrl: string;
  duration: number;
  coverImage: string;
  categoryId: string;
  category: {
    name: string;
    slug: string;
  };
  presenter: {
    name: string;
    slug: string;
    avatar: string;
  };
  isPublished: boolean;
  publishedAt: string | Date;
}

export interface SongRequestItem {
  id: string;
  studentName: string;
  course?: string | null;
  songTitle: string;
  artist: string;
  dedication?: string | null;
  status: RequestStatus;
  adminNote?: string | null;
  createdAt: string | Date;
}

export interface ArticleItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  categoryId: string;
  category: {
    name: string;
    slug: string;
  };
  author: {
    name: string;
    avatar?: string | null;
  };
  isFeatured: boolean;
  isPublished: boolean;
  publishedAt: string | Date;
}

export interface StationSettings {
  stationName: string;
  tagline: string;
  frequency: string;
  streamUrl: string;
  fallbackStreamUrl?: string | null;
  isLiveManualOverride: boolean;
  contactEmail: string;
  contactPhone: string;
  socialLinks?: Record<string, string> | null;
}

export interface TrackMetadata {
  title: string;
  subtitle: string;
  artwork?: string;
  isLive: boolean;
  audioUrl: string;
}

export type AudioPlaybackState =
  | "idle"
  | "loading"
  | "playing"
  | "buffering"
  | "paused"
  | "offline"
  | "error";

export interface AudioPlayerContextType {
  state: AudioPlaybackState;
  isPlaying: boolean;
  isLoading: boolean;
  isLiveStream: boolean;
  currentTrack: TrackMetadata | null;
  volume: number;
  isMuted: boolean;
  streamOnline: boolean;
  currentProgrammeTitle?: string;
  playLiveStream: () => void;
  playTrack: (track: TrackMetadata) => void;
  pause: () => void;
  togglePlay: () => void;
  setVolume: (val: number) => void;
  toggleMute: () => void;
  checkStreamStatus: () => Promise<boolean>;
}

export interface ListenerOverviewAnalytics {
  activeListeners: number;
  totalListeners: number;
  totalSessions: number;
  avgSessionDurationSeconds: number;
  universitiesReached: number;
  universityAudience: {
    universityId: string;
    universityName: string;
    shortName: string | null;
    listeners: number;
    sessions: number;
    avgDurationMinutes: number;
    percentage: number;
    lastSeenAt?: string | null;
  }[];
  listeningTrends: {
    label: string;
    sessions: number;
    listeners: number;
  }[];
  programmeAnalytics: {
    programmeId: string;
    title: string;
    listeners: number;
    sessions: number;
    avgDurationMinutes: number;
  }[];
}
