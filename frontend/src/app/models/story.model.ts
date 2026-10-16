export type PillarType = 'imagined' | 'lived' | 'unsaid';

export interface ReactionCounts {
  relatable: number;
  feltThis: number;
  support: number;
  laugh: number;
}

export interface Story {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  pillar: PillarType;
  pillarLabel: string;
  category: string;
  categorySlug: string;
  authorPseudonym: string;
  authorBatch?: string;
  publishedAt: string;
  readingTime: string;
  contentWarning?: string;
  tags: string[];
  reactions: ReactionCounts;
  userReaction?: 'relatable' | 'feltThis' | 'support' | 'laugh' | null;
  isSaved?: boolean;
  status: 'published' | 'pending' | 'rejected';
  rejectionReason?: string;
  moderationNote?: string;
  appealStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | null;
  submittedAt?: string;
}

export interface StoryCategory {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  storyCount: number;
}

export interface ReportItem {
  id: string;
  storyId: string;
  storyTitle: string;
  reporterPseudonym: string;
  reason: string;
  details: string;
  status: 'pending' | 'reviewed' | 'actioned' | 'dismissed';
  reportedAt: string;
}

export interface SavedCollection {
  id: string;
  name: string;
  description?: string;
  emoji: string;
  storyIds: string[];
  createdAt: string;
}

export interface PlatformStats {
  totalStories: number;
  nostalgiaCount: number;
  regretCount: number;
  hopeCount: number;
  totalReactions: number;
  totalViews: number;
  contributorCount: number;
  topTrendingTag?: string;
}

export interface AppealItem {
  id: string;
  storyId: string;
  storyTitle: string;
  storyExcerpt: string;
  storyContent: string;
  authorPseudonym: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminNotes?: string;
  createdAt: string;
  resolvedAt?: string;
}

