import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Story, StoryCategory, ReportItem, PillarType, SavedCollection, PlatformStats, AppealItem } from '../models/story.model';
import { AuthService } from './auth.service';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { getApiBaseUrl } from './api-config';

interface BackendStoryResponse {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  pillar: string;
  categorySlug: string;
  pseudonym: string;
  contentWarning?: string;
  tags: string[];
  status: string;
  moderationNote?: string;
  readingTime: number;
  viewsCount: number;
  createdAt: string;
  reactionCounts: Record<string, number>;
  userReactions: string[];
}

interface BackendCollectionResponse {
  id: string;
  name: string;
  iconEmoji: string;
  storyCount: number;
  storyIds: string[];
  createdAt: string;
}

interface BackendPageResponse {
  content: BackendStoryResponse[];
  totalElements: number;
  totalPages?: number;
  number?: number;
  size?: number;
  last?: boolean;
  first?: boolean;
  empty?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class StoryService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private get apiUrl(): string {
    return getApiBaseUrl();
  }

  private readonly categoriesList: StoryCategory[] = [
    {
      slug: 'love-crushes-friendships',
      name: 'Love, Crushes & Friendships',
      tagline: 'Silent glances, lost best friends, and unspoken farewells',
      description: 'Stories about the people who shared our benches, our corridors, and our hearts — and whether they stayed or vanished into separate cities.',
      storyCount: 38
    },
    {
      slug: 'academic-career-regrets',
      name: 'Academic & Career Regrets',
      tagline: 'Rote memorization, CGPA panic, and placement season dread',
      description: 'Honest accounts of fighting for marks that did not matter, chasing streams we hated, and the exhaustion of early adulthood expectations.',
      storyCount: 45
    },
    {
      slug: 'hostel-midnight-chai',
      name: 'Hostel & Midnight Chai',
      tagline: 'Terrace debates, shared kettles, and 3:00 AM survival pacts',
      description: 'The real texture of campus life: shared hotplates, monsoon power cuts, corridor cricket, and finding family among strangers.',
      storyCount: 31
    },
    {
      slug: 'funny-chaotic-moments',
      name: 'Funny & Embarrassing Moments',
      tagline: 'Proxy blunders, lab disasters, and surviving strict wardens',
      description: 'The absurd, hilarious, and deeply humiliating stories that make us laugh till we cry years later.',
      storyCount: 26
    },
    {
      slug: 'missed-opportunities',
      name: 'Missed Opportunities',
      tagline: 'Clubs never joined, trips never taken, words swallowed down',
      description: 'The events we skipped because we were too scared, too tired, or convinced there would always be another semester.',
      storyCount: 29
    },
    {
      slug: 'understood-after-graduating',
      name: 'Understood Only After Graduating',
      tagline: 'Hindsight, nostalgia, and the sudden weight of the real world',
      description: 'Reflections from the other side of the degree. What was actually precious, and what we should have let go of sooner.',
      storyCount: 41
    }
  ];

  private readonly initialStories: Story[] = [
    {
      id: 'story-1',
      title: 'The 3:00 AM Maggi on the hostel terrace that saved my 4th semester',
      excerpt: 'I had failed both internal assessments in Signals & Systems. I was ready to pack my trunk and catch the morning train back to Lucknow. Then Nikhil knocked on my door with an electric kettle.',
      content: `I had failed both internal assessments in Signals & Systems. My attendance was hovering at 68%, the HOD had threatened to detain me, and for two weeks I hadn’t looked at my father when he video called every Sunday evening.

I was sitting in Room 314 with the lights off, staring at the ceiling fan, fully convinced my life was over. I had packed my heavy blue trolley bag halfway and kept it beside the wooden wardrobe. I genuinely planned to walk to the railway station before dawn.

Around 2:45 AM, Nikhil from the end room kicked my door open. He didn’t ask why I was sitting in the dark. He just plugged his illegal electric kettle into my desk socket, dropped two packets of Maggi into it, and said, *"Chal terrace pe chalte hain. Hawa chal rahi hai."*

We sat on the dusty concrete parapet of Hostel 4 for two hours. We didn't talk about engineering or placements or our parents' expectations. We talked about comic books, old Hindi songs, and how terrible the mess tea was. By 4:30 AM, when the first morning breeze hit our faces and the campus streetlights flickered off, I realized something: the world hadn't ended.

I didn't top that semester. I scraped through with a C grade. But every time life gets unbearable in my corporate job in Bangalore, I remember that kettle boiling on the floor of Room 314. Sometimes you don't need a motivational speech; you just need someone to split a packet of noodles with you in silence.`,
      pillar: 'lived',
      pillarLabel: 'The Life I Actually Lived',
      category: 'Hostel & Midnight Chai',
      categorySlug: 'hostel-midnight-chai',
      authorPseudonym: 'terrace_philosopher',
      authorBatch: "Batch of '21",
      publishedAt: '2 days ago',
      readingTime: '3 min read',
      tags: ['HostelLife', 'MidnightChai', 'Burnout'],
      reactions: {
        relatable: 184,
        feltThis: 142,
        support: 95,
        laugh: 18
      },
      userReaction: null,
      isSaved: true,
      status: 'published'
    },
    {
      id: 'story-2',
      title: 'I thought I would build tech startups; I spent four years memorizing 10-year question papers',
      excerpt: 'In class 12, I read about Steve Jobs and dreamt of tinkering in college dorm labs. The reality was copying 80-page lab records by hand in ballpoint pen so the external examiner would sign with green ink.',
      content: `Before stepping onto campus, my idea of engineering was shaped by Silicon Valley movies and hacker biographies. I bought a second-hand Linux laptop, convinced that college was a sanctuary of curious minds building revolutionary products between midnight coffee runs.

The reality was a rude awakening within the first three weeks.

The curriculum hadn't been updated since 2004. Our first year C programming lab consisted of copying 40 programs from a xeroxed booklet directly onto ruled practical files. If your margin wasn't drawn with a ruler or your flowchart lacked a circular start box, the lab assistant tore the page out.

By third year, the creative spark had been completely replaced by survival instincts: hunting down the "Shivani Guide" or local 10-year question bank xeroxes 48 hours before the semester exam. You didn't need to understand algorithmic complexity; you just needed to reproduce the 7-mark question on Dijkstra’s algorithm verbatim.

I graduated with an 8.2 CGPA and a profound sense of mourning for the curiosity I had entered college with. The degree gave me a job offer, yes, but it took away my wonder. That was the trade-off nobody warned us about.`,
      pillar: 'imagined',
      pillarLabel: 'The Life I Imagined',
      category: 'Academic & Career Regrets',
      categorySlug: 'academic-career-regrets',
      authorPseudonym: 'tier3_dreamer',
      authorBatch: "Batch of '23",
      publishedAt: '4 days ago',
      readingTime: '4 min read',
      tags: ['Academics', 'LostCuriosity', 'ExpectationsVsReality'],
      reactions: {
        relatable: 312,
        feltThis: 265,
        support: 74,
        laugh: 45
      },
      userReaction: null,
      isSaved: false,
      status: 'published'
    },
    {
      id: 'story-3',
      title: 'To the girl in Row 4 of Lecture Hall 2 whose notebook I borrowed in 2018',
      excerpt: 'You always used a turquoise gel pen and drew tiny sun icons beside important formulas. I held onto that notebook for three weeks just so I would have an excuse to walk across the quadrangle to your department.',
      content: `You were in Electrical, and I was in Mechanical. We only shared one common open-elective course in our fifth semester: Environmental Studies in LT-2, every Tuesday and Thursday at 11:15 AM.

You always sat in the fourth row near the left wooden window. While the rest of us were either asleep or playing Mini Militia under our desks, you took immaculate notes in turquoise ink, drawing little sun icons whenever the professor said "This will come in the midterms."

One day I gathered the courage to ask if I could xerox your notes. You smiled, handed me the entire spiral-bound register, and told me to return it whenever I was done.

I xeroxed it that same afternoon at the gate shop for twenty rupees. But I didn't return it for three weeks. Every evening after classes ended, I would carry that register in my bag and linger near the fountain by the Electrical block, rehearsing what witty, charming thing I would say when I handed it back.

When I finally returned it, my hands were shaking. I muttered a clumsy "Thanks, it really helped" and walked away before you could even reply.

Six years have passed. We never spoke again. I don't know where you are or who you became. But every time I see turquoise ink in a stationery shop, I remember the winter sunlight pouring through the dusty windows of LT-2.`,
      pillar: 'unsaid',
      pillarLabel: 'Things I Never Said',
      category: 'Love, Crushes & Friendships',
      categorySlug: 'love-crushes-friendships',
      authorPseudonym: 'silent_cadet',
      authorBatch: "Batch of '20",
      publishedAt: '1 week ago',
      readingTime: '3 min read',
      tags: ['Crushes', 'UnspokenFeelings', 'LectureHallMemories'],
      reactions: {
        relatable: 245,
        feltThis: 389,
        support: 88,
        laugh: 12
      },
      userReaction: null,
      isSaved: true,
      status: 'published'
    },
    {
      id: 'story-4',
      title: 'We promised we would travel to Spiti every December after graduating',
      excerpt: 'On the night after our final project viva, seven of us sat at the chai tapri outside the north gate and made a solemn pact. It felt unbreakable. We didn’t know how quickly life scatters people.',
      content: `We were seven people who had lived in each other’s rooms for four years. We shared clothes, shared Spotify accounts, pooled money to pay the tapri owner’s monthly credit tab, and knew each other’s family traumas inside out.

The night after our final major project viva, we sat on overturned wooden crates by the north gate. The chai wallah gave us free Elaichi biscuits because he knew our batch was leaving.

Someone said, *"Listen. Every December, no matter what happens, no matter what companies we join, we are meeting in Delhi and going to Spiti Valley. Promise."*

We clinked our paper cups. It felt eternal.

Year 1: Two people couldn't get leave during their probation period. We postponed to February, then cancelled.
Year 2: One got married, one moved to Munich, and two had performance reviews. The WhatsApp group went quiet for three months.
Year 5: The WhatsApp group is only used to forward birthday wishes and wedding invites. When someone posts a photo, the replies are polite two-word compliments like *"Looking great bro."*

Nobody had an argument. Nobody betrayed anyone. Life just happens quietly, like water seeping through cracks. I miss them every single day.`,
      pillar: 'unsaid',
      pillarLabel: 'Things I Never Said',
      category: 'Love, Crushes & Friendships',
      categorySlug: 'love-crushes-friendships',
      authorPseudonym: 'convocation_ghost',
      authorBatch: "Batch of '19",
      publishedAt: '1 week ago',
      readingTime: '4 min read',
      tags: ['Friendship', 'Adulthood', 'GrowingApart'],
      reactions: {
        relatable: 480,
        feltThis: 512,
        support: 130,
        laugh: 8
      },
      userReaction: null,
      isSaved: false,
      status: 'published'
    },
    {
      id: 'story-5',
      title: 'Giving proxy attendance for a roommate whose microphone unmuted during the principal surprise visit',
      excerpt: 'Rohan was sound asleep in Room 204. I was sitting in the third row of the seminar hall. The Dean himself opened the attendance register. It was the most stressful thirty seconds of my entire undergraduate degree.',
      content: `There is a specific tactical art to proxy attendance that no syllabus will ever teach you. You have to modulate your voice: if your own roll number is 42 and your friend’s is 68, you can’t sound like the same tenor.

It was a Tuesday afternoon, 2:30 PM, Heatwave outside. Most of the class had bunked for a cinema show at the local single-screen theatre. Only 18 students were present in a 120-capacity hall.

Suddenly, the door swung open and in walked the Dean of Student Welfare with two peons carrying the master register. A cold dread swept across the hall.

He called out roll numbers in a deep booming baritone. Roll 38: "Present Sir." Roll 39: "Present Sir."
Then came Roll 45 (Rohan). I coughed, adjusted my throat, and shouted in a pitched squeak: *"Yes Sir!"*

The Dean paused, looked over his spectacles directly at me, and said: *"You were Roll 21 five minutes ago, weren’t you?"*

My mind went blank. I replied with total earnestness: *"Sir, Roll 21 is my identical twin brother who is also in this section."*

The entire room fell dead silent. For five agonizing seconds, the Dean stared at me. Then he shook his head, sighed *"Tum log sudhroge nahi,"* marked Rohan present, and kept going. That evening, Rohan bought me chicken biryani at the roadside dhaba. Best lunch of my college life.`,
      pillar: 'lived',
      pillarLabel: 'The Life I Actually Lived',
      category: 'Funny & Chaotic Moments',
      categorySlug: 'funny-chaotic-moments',
      authorPseudonym: 'backbencher_proxy',
      authorBatch: "Batch of '21",
      publishedAt: '2 weeks ago',
      readingTime: '3 min read',
      tags: ['Proxy', 'HostelMischief', 'CollegeHumor'],
      reactions: {
        relatable: 320,
        feltThis: 140,
        support: 45,
        laugh: 495
      },
      userReaction: null,
      isSaved: false,
      status: 'published'
    },
    {
      id: 'story-6',
      title: 'Wearing the black convocation gown felt like stepping off a cliff, not a triumph',
      excerpt: 'Everyone was throwing their square hats into the air and posing for photos with their parents. All I felt was a freezing panic: tomorrow morning, the security guard won’t let me past the main gate anymore.',
      content: `On convocation day, parents traveled from small towns in their best sarees and formal suits, beaming with pride. My mother was crying happy tears as she adjusted the black robe around my shoulders.

I smiled for 150 photos. I tossed my mortarboard into the blue November sky along with two hundred other graduates.

But beneath the smile was pure, suffocating terror.

For four years, the campus had been a fortress. As long as you had that laminated student ID card around your neck, you were shielded from real accountability. Rent didn't matter. Tax brackets didn't matter. You could fail an exam, cry over chai, and wake up tomorrow knowing where you belonged.

When I handed my gown back to the auditorium counter at 5:00 PM, the receipt was stamped *"Cleared - No Dues."*

Walking out through the main security gate with my suitcase that evening, the guard who had seen me every day for four years didn't even look up from his register. I wasn't a student anymore. I was just another anonymous adult entering the grinding machinery of the real world.`,
      pillar: 'imagined',
      pillarLabel: 'The Life I Imagined',
      category: 'Understood Only After Graduating',
      categorySlug: 'understood-after-graduating',
      authorPseudonym: 'unready_engineer',
      authorBatch: "Batch of '24",
      publishedAt: '3 weeks ago',
      readingTime: '4 min read',
      tags: ['Convocation', 'Adulthood', 'Nostalgia'],
      reactions: {
        relatable: 388,
        feltThis: 410,
        support: 122,
        laugh: 5
      },
      userReaction: null,
      isSaved: false,
      status: 'published'
    }
  ];

  private readonly userStories: Story[] = [
    {
      id: 'my-story-1',
      title: 'The library cubicle on the 3rd floor where I spent placement week',
      excerpt: 'While companies conducted interviews on the ground floor, I hid in the reference section with my phone on airplane mode.',
      content: `While companies conducted interviews on the ground floor, I hid in the reference section with my phone on airplane mode. The humiliation of not being shortlisted was something I couldn’t face in front of my wingmates.`,
      pillar: 'lived',
      pillarLabel: 'The Life I Actually Lived',
      category: 'Academic & Career Regrets',
      categorySlug: 'academic-career-regrets',
      authorPseudonym: 'wanderer_42',
      publishedAt: 'Yesterday',
      readingTime: '2 min read',
      tags: ['Placements', 'Loneliness'],
      reactions: { relatable: 24, feltThis: 19, support: 15, laugh: 0 },
      status: 'published'
    },
    {
      id: 'my-story-2',
      title: 'To the professor who told me I was wasting my father’s money',
      excerpt: 'You tore my project report in front of the entire class during the 6th semester viva.',
      content: `You tore my project report in front of the entire class during the 6th semester viva. Today I lead an engineering team, but that sting never completely disappeared.`,
      pillar: 'unsaid',
      pillarLabel: 'Things I Never Said',
      category: 'Academic & Career Regrets',
      categorySlug: 'academic-career-regrets',
      authorPseudonym: 'wanderer_42',
      submittedAt: '3 hours ago',
      publishedAt: '',
      readingTime: '2 min read',
      tags: ['Vulnerability', 'Healing'],
      reactions: { relatable: 12, feltThis: 8, support: 4, laugh: 0 },
      status: 'published'
    },
    {
      id: 'my-story-3',
      title: 'Review of the college canteen contractor (Explicit naming)',
      excerpt: 'Submitted draft containing specific personal names of canteen staff.',
      content: `Draft content flagged for community moderation due to containing real personal names.`,
      pillar: 'lived',
      pillarLabel: 'The Life I Actually Lived',
      category: 'Funny & Chaotic Moments',
      categorySlug: 'funny-chaotic-moments',
      authorPseudonym: 'wanderer_42',
      submittedAt: '2 days ago',
      publishedAt: '',
      readingTime: '1 min read',
      tags: ['Draft'],
      reactions: { relatable: 0, feltThis: 0, support: 0, laugh: 0 },
      status: 'rejected',
      rejectionReason: 'Contains real names of staff members. Please edit to remove identifying details to protect community privacy.'
    }
  ];

  private readonly reportsList: ReportItem[] = [
    {
      id: 'rep-1',
      storyId: 'story-mock-flag',
      storyTitle: 'Why Professor K. from Physics Department should be dismissed',
      reporterPseudonym: 'vigilant_student_09',
      reason: 'Real name / doxxing / personal details',
      details: 'This story names a specific faculty member and alleges private conduct without anonymity.',
      status: 'pending',
      reportedAt: '15 mins ago'
    },
    {
      id: 'rep-2',
      storyId: 'story-mock-flag-2',
      storyTitle: 'Late night girls hostel scandal - Room 102 details',
      reporterPseudonym: 'concerned_alum',
      reason: 'Harassment or hate',
      details: 'Contains targetting of specific hostel students with identifiable room numbers.',
      status: 'pending',
      reportedAt: '1 hour ago'
    },
    {
      id: 'rep-3',
      storyId: 'story-mock-flag-3',
      storyTitle: 'Buy semester question leak papers cheap on Telegram',
      reporterPseudonym: 'silent_observer',
      reason: 'Spam or irrelevant',
      details: 'Commercial spam promotion for a paid telegram channel.',
      status: 'reviewed',
      reportedAt: '4 hours ago'
    }
  ];

  // Reactive State Signals
  readonly stories = signal<Story[]>(this.initialStories);
  readonly myStories = signal<Story[]>([]);
  readonly categories = signal<StoryCategory[]>(this.categoriesList);
  readonly reports = signal<ReportItem[]>([]);
  readonly currentPseudonym = computed<string>(() => this.authService.currentUser()?.pseudonym || 'Campus Wanderer');
  readonly isCreateModalOpen = signal<boolean>(false);
  readonly platformStats = signal<PlatformStats | null>(null);
  readonly appeals = signal<AppealItem[]>([]);

  // Pagination & Infinite Scroll Signals
  readonly currentPage = signal<number>(0);
  readonly pageSize = signal<number>(10);
  readonly hasMoreStories = signal<boolean>(false);
  readonly isLoadingMore = signal<boolean>(false);
  readonly isRefreshing = signal<boolean>(false);

  // Instagram-style Saved Collections
  readonly collections = signal<SavedCollection[]>([]);

  // Computed signals
  readonly savedStories = computed(() => this.stories().filter(s => s.isSaved));
  readonly savedCount = computed(() => this.savedStories().length);
  readonly popularTags = computed(() => {
    const counts = new Map<string, number>();
    for (const story of this.stories()) {
      if (story.tags) {
        for (const tag of story.tags) {
          const t = tag.trim();
          if (t) {
            counts.set(t, (counts.get(t) || 0) + 1);
          }
        }
      }
    }
    const sorted = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0]);

    if (sorted.length > 0) {
      return sorted.slice(0, 10);
    }
    return ['HostelLife', 'Proxy', 'LateNightChai', 'PlacementStress', 'Convocation', 'Adulthood', 'CollegeHumor'];
  });

  constructor() {
    this.loadUserCollections();
    this.loadBackendStories();
    this.loadMyStoriesFromBackend();
    this.loadReportsFromBackend();
    this.loadPlatformStats();
    this.loadAppealsFromBackend();
  }

  /**
   * Load saved collections from Spring Boot backend
   */
  loadUserCollections(): void {
    if (!this.authService.getToken()) {
      this.collections.set([]);
      return;
    }
    this.http.get<BackendCollectionResponse[]>(`${this.apiUrl}/collections`).subscribe({
      next: (list) => {
        if (list && Array.isArray(list)) {
          const mappedCols: SavedCollection[] = list.map(c => ({
            id: c.id,
            name: c.name,
            emoji: c.iconEmoji || '📁',
            storyIds: c.storyIds || [],
            createdAt: this.formatDate(c.createdAt)
          }));
          this.collections.set(mappedCols);

          const savedIds = new Set<string>();
          mappedCols.forEach(c => c.storyIds.forEach(id => savedIds.add(id)));
          if (savedIds.size > 0) {
            this.stories.update(all => all.map(s => ({
              ...s,
              isSaved: s.isSaved || savedIds.has(s.id)
            })));
          }
        }
      },
      error: () => {
        this.collections.set([]);
      }
    });
  }

  /**
   * Load real stories from Spring Boot backend with pagination support
   */
  loadBackendStories(page = 0, append = false): Promise<boolean> {
    return new Promise((resolve) => {
      const url = `${this.apiUrl}/stories?page=${page}&size=${this.pageSize()}&sort=newest`;
      this.http.get<BackendPageResponse>(url).subscribe({
        next: (response) => {
          if (response && response.content && response.content.length > 0) {
            const mappedStories = response.content.map(b => this.mapBackendStory(b));
            if (append) {
              this.stories.update(existing => {
                const existingIds = new Set(existing.map(s => s.id));
                const newOnes = mappedStories.filter(m => !existingIds.has(m.id));
                return [...existing, ...newOnes];
              });
            } else {
              this.stories.set(mappedStories);
            }
            this.currentPage.set(page);
            const isLast = response.last !== undefined 
              ? response.last 
              : (response.content.length < this.pageSize());
            this.hasMoreStories.set(!isLast && mappedStories.length > 0);
            resolve(true);
          } else {
            if (!append && this.stories().length === 0) {
              this.stories.set(this.initialStories);
            }
            if (!append) {
              this.hasMoreStories.set(false);
            }
            resolve(false);
          }
        },
        error: () => {
          // If backend is temporarily unreachable, ensure fallback stories remain visible
          if (this.stories().length === 0) {
            this.stories.set(this.initialStories);
          }
          resolve(false);
        }
      });
    });
  }

  /**
   * Instagram-style Pull-To-Refresh: Reloads page 0 and updates live platform telemetry
   */
  async refreshStories(): Promise<void> {
    if (this.isRefreshing()) return;
    this.isRefreshing.set(true);
    try {
      await this.loadBackendStories(0, false);
      this.loadPlatformStats();
      this.loadUserCollections();
    } finally {
      this.isRefreshing.set(false);
    }
  }

  /**
   * Infinite Scroll: Fetches and appends next page of stories
   */
  async loadMoreStories(): Promise<void> {
    if (this.isLoadingMore() || !this.hasMoreStories() || this.isRefreshing()) return;
    this.isLoadingMore.set(true);
    try {
      const nextPage = this.currentPage() + 1;
      await this.loadBackendStories(nextPage, true);
    } finally {
      this.isLoadingMore.set(false);
    }
  }

  loadMyStoriesFromBackend(): void {
    if (!this.authService.getToken()) {
      this.myStories.set([]);
      return;
    }
    this.http.get<BackendStoryResponse[]>(`${this.apiUrl}/stories/my`).subscribe({
      next: (list) => {
        if (list && Array.isArray(list)) {
          this.myStories.set(list.map(b => this.mapBackendStory(b)));
        }
      },
      error: () => {
        this.myStories.set([]);
      }
    });
  }

  private mapBackendStory(b: BackendStoryResponse): Story {
    const pillarMapping: Record<string, { pillar: PillarType; label: string }> = {
      NOSTALGIA: { pillar: 'lived', label: 'The Life I Actually Lived' },
      REGRET: { pillar: 'imagined', label: 'The Life I Imagined' },
      HOPE: { pillar: 'unsaid', label: 'Things I Never Said' }
    };

    const pillarInfo = pillarMapping[b.pillar] || { pillar: 'lived', label: 'The Life I Actually Lived' };
    const categoryObj = this.categories().find(c => c.slug === b.categorySlug);

    const isAlreadySaved = this.collections().some(c => c.storyIds.includes(b.id));

    let userRx: 'relatable' | 'feltThis' | 'support' | 'laugh' | null = null;
    if (b.userReactions && b.userReactions.length > 0) {
      const first = b.userReactions[0].toLowerCase();
      if (first === 'relatable' || first === 'heart') userRx = 'relatable';
      else if (first === 'tear' || first === 'hopeful') userRx = 'feltThis';
      else if (first === 'hug') userRx = 'support';
      else if (first === 'laugh') userRx = 'laugh';
    }

    const rawStatus = (b.status || 'PUBLISHED').toUpperCase();
    let mappedStatus: 'published' | 'pending' | 'rejected' = 'published';
    if (rawStatus === 'PUBLISHED') {
      mappedStatus = 'published';
    } else if (rawStatus === 'PENDING' || rawStatus === 'DRAFT') {
      mappedStatus = 'pending';
    } else {
      // REJECTED, REMOVED, TAKEN_DOWN, FLAGGED, HIDDEN
      mappedStatus = 'rejected';
    }

    return {
      id: b.id,
      title: b.title,
      excerpt: b.excerpt || b.content.slice(0, 160) + '...',
      content: b.content,
      pillar: pillarInfo.pillar,
      pillarLabel: pillarInfo.label,
      category: categoryObj ? categoryObj.name : 'Campus Memories',
      categorySlug: b.categorySlug,
      authorPseudonym: b.pseudonym || 'Campus Wanderer',
      publishedAt: this.formatDate(b.createdAt),
      readingTime: `${b.readingTime || 3} min read`,
      contentWarning: b.contentWarning,
      tags: b.tags || ['CampusLife'],
      reactions: {
        relatable: (b.reactionCounts?.['relatable'] || 0) + (b.reactionCounts?.['heart'] || 0),
        feltThis: (b.reactionCounts?.['tear'] || 0) + (b.reactionCounts?.['hopeful'] || 0),
        support: b.reactionCounts?.['hug'] || 0,
        laugh: b.reactionCounts?.['laugh'] || 0
      },
      userReaction: userRx,
      isSaved: isAlreadySaved,
      status: mappedStatus,
      moderationNote: b.moderationNote,
      rejectionReason: b.moderationNote || (rawStatus === 'REMOVED' ? 'Story was removed by community moderators for guideline violations.' : '')
    };
  }

  private formatDate(dateStr?: string): string {
    if (!dateStr) return 'Recently';
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours < 1) return 'Just now';
      if (diffHours < 24) return `${diffHours} hours ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays === 1) return 'Yesterday';
      return `${diffDays} days ago`;
    } catch {
      return 'Recently';
    }
  }

  openCreateModal(): void {
    this.isCreateModalOpen.set(true);
  }

  closeCreateModal(): void {
    this.isCreateModalOpen.set(false);
  }

  getStories(): Story[] {
    return this.stories();
  }

  getStoryById(id: string): Story | undefined {
    return this.stories().find(s => s.id === id) || this.myStories().find(s => s.id === id);
  }

  getStoriesByPillar(pillar: PillarType): Story[] {
    return this.stories().filter(s => s.pillar === pillar);
  }

  getStoriesByCategory(slug: string): Story[] {
    return this.stories().filter(s => s.categorySlug === slug);
  }

  getCategoryBySlug(slug: string): StoryCategory | undefined {
    return this.categories().find(c => c.slug === slug);
  }

  toggleReaction(storyId: string, reactionType: 'relatable' | 'feltThis' | 'support' | 'laugh'): void {
    // Native mobile haptic feedback
    try {
      Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
    } catch {
      // Browser fallback
    }

    // Optimistic UI update
    this.stories.update(list => list.map(story => {
      if (story.id !== storyId) return story;

      const current = story.userReaction;
      const reactions = { ...story.reactions };

      if (current === reactionType) {
        reactions[reactionType] = Math.max(0, reactions[reactionType] - 1);
        return { ...story, userReaction: null, reactions };
      }

      if (current) {
        reactions[current] = Math.max(0, reactions[current] - 1);
      }

      reactions[reactionType] += 1;
      return { ...story, userReaction: reactionType, reactions };
    }));

    this.myStories.update(list => list.map(story => {
      if (story.id !== storyId) return story;
      const current = story.userReaction;
      const reactions = { ...story.reactions };
      if (current === reactionType) {
        reactions[reactionType] = Math.max(0, reactions[reactionType] - 1);
        return { ...story, userReaction: null, reactions };
      }
      if (current) {
        reactions[current] = Math.max(0, reactions[current] - 1);
      }
      reactions[reactionType] += 1;
      return { ...story, userReaction: reactionType, reactions };
    }));

    // Sync to backend if storyId is a UUID
    if (storyId.length >= 32) {
      const typeMap: Record<string, string> = {
        relatable: 'RELATABLE',
        feltThis: 'TEAR',
        support: 'HUG',
        laugh: 'LAUGH'
      };
      const backendType = typeMap[reactionType] || 'RELATABLE';
      this.http.post<any>(`${this.apiUrl}/stories/${storyId}/reactions`, { reactionType: backendType }).subscribe({
        next: (summary) => {
          if (summary && summary.counts) {
            const c = summary.counts;
            const updatedReactions = {
              relatable: (c['relatable'] || 0) + (c['heart'] || 0),
              feltThis: (c['tear'] || 0) + (c['hopeful'] || 0),
              support: c['hug'] || 0,
              laugh: c['laugh'] || 0
            };
            this.stories.update(list => list.map(s => s.id === storyId ? { ...s, reactions: updatedReactions } : s));
            this.myStories.update(list => list.map(s => s.id === storyId ? { ...s, reactions: updatedReactions } : s));
          }
        },
        error: () => {}
      });
    }
  }

  saveStory(storyId: string): void {
    this.stories.update(list => list.map(story => {
      if (story.id === storyId) {
        return { ...story, isSaved: true };
      }
      return story;
    }));

    // If collections exist and story is not in any, associate with the first collection
    const cols = this.collections();
    if (cols.length > 0 && !cols.some(c => c.storyIds.includes(storyId))) {
      this.addStoryToCollection(cols[0].id, storyId);
    }
  }

  unsaveStory(storyId: string): void {
    this.stories.update(list => list.map(story => {
      if (story.id === storyId) {
        return { ...story, isSaved: false };
      }
      return story;
    }));

    // Remove from all collections
    const cols = this.collections();
    for (const c of cols) {
      if (c.storyIds.includes(storyId)) {
        this.removeStoryFromCollection(c.id, storyId);
      }
    }
  }

  toggleSave(storyId: string): boolean {
    const s = this.stories().find(item => item.id === storyId);
    const currentlySaved = s ? s.isSaved : false;
    if (currentlySaved) {
      this.unsaveStory(storyId);
      return false;
    } else {
      this.saveStory(storyId);
      return true;
    }
  }

  createCollection(name: string, emoji = '📁', storyIds: string[] = []): SavedCollection {
    const tempId = `col-${Date.now()}`;
    const newCollection: SavedCollection = {
      id: tempId,
      name: name.trim(),
      emoji: emoji || '📁',
      storyIds: [...storyIds],
      createdAt: 'Just now'
    };
    this.collections.update(list => [newCollection, ...list]);

    if (storyIds.length > 0) {
      this.stories.update(list => list.map(s => storyIds.includes(s.id) ? { ...s, isSaved: true } : s));
    }

    // Sync to backend
    this.http.post<BackendCollectionResponse>(`${this.apiUrl}/collections`, {
      name: name.trim(),
      iconEmoji: emoji
    }).subscribe({
      next: (res) => {
        if (res && res.id) {
          this.collections.update(list => list.map(c => c.id === tempId ? { ...c, id: res.id } : c));
          for (const sId of storyIds) {
            if (sId.length >= 32) {
              this.http.post(`${this.apiUrl}/collections/${res.id}/stories/${sId}`, {}).subscribe();
            }
          }
        }
      },
      error: () => {}
    });

    return newCollection;
  }

  updateCollection(collectionId: string, updates: { name?: string; emoji?: string; description?: string }): void {
    this.collections.update(list => list.map(c => {
      if (c.id === collectionId) {
        return {
          ...c,
          name: updates.name !== undefined ? updates.name.trim() : c.name,
          emoji: updates.emoji !== undefined ? updates.emoji : c.emoji,
          description: updates.description !== undefined ? updates.description : c.description
        };
      }
      return c;
    }));
  }

  deleteCollection(collectionId: string): void {
    this.collections.update(list => list.filter(c => c.id !== collectionId));
  }

  addStoryToCollection(collectionId: string, storyId: string): void {
    this.collections.update(list => list.map(c => {
      if (c.id === collectionId && !c.storyIds.includes(storyId)) {
        return { ...c, storyIds: [...c.storyIds, storyId] };
      }
      return c;
    }));

    this.stories.update(list => list.map(s => s.id === storyId ? { ...s, isSaved: true } : s));

    if (collectionId.length >= 32 && storyId.length >= 32) {
      this.http.post(`${this.apiUrl}/collections/${collectionId}/stories/${storyId}`, {}).subscribe({
        error: () => {}
      });
    }
  }

  removeStoryFromCollection(collectionId: string, storyId: string): void {
    this.collections.update(list => list.map(c => {
      if (c.id === collectionId) {
        return { ...c, storyIds: c.storyIds.filter(id => id !== storyId) };
      }
      return c;
    }));

    const stillInAny = this.collections().some(c => c.storyIds.includes(storyId));
    if (!stillInAny) {
      this.stories.update(list => list.map(s => s.id === storyId ? { ...s, isSaved: false } : s));
    }

    if (collectionId.length >= 32 && storyId.length >= 32) {
      this.http.delete(`${this.apiUrl}/collections/${collectionId}/stories/${storyId}`).subscribe({
        error: () => {}
      });
    }
  }

  loadStoriesByTag(tag: string): void {
    if (!tag) return;
    this.http.get<BackendPageResponse>(`${this.apiUrl}/stories?tag=${encodeURIComponent(tag.trim())}&size=30`).subscribe({
      next: (response) => {
        if (response && response.content && response.content.length > 0) {
          const mapped = response.content.map(b => this.mapBackendStory(b));
          this.stories.update(existing => {
            const existingIds = new Set(existing.map(s => s.id));
            const newOnes = mapped.filter(m => !existingIds.has(m.id));
            return [...mapped, ...newOnes];
          });
        }
      },
      error: () => {}
    });
  }

  loadStoriesBySearch(term: string): void {
    if (!term) return;
    this.http.get<BackendPageResponse>(`${this.apiUrl}/stories?search=${encodeURIComponent(term.trim())}&size=30`).subscribe({
      next: (response) => {
        if (response && response.content && response.content.length > 0) {
          const mapped = response.content.map(b => this.mapBackendStory(b));
          this.stories.update(existing => {
            const existingIds = new Set(existing.map(s => s.id));
            const newOnes = mapped.filter(m => !existingIds.has(m.id));
            return [...mapped, ...newOnes];
          });
        }
      },
      error: () => {}
    });
  }

  toggleStoryInCollection(collectionId: string, storyId: string): void {
    const col = this.collections().find(c => c.id === collectionId);
    if (!col) return;
    if (col.storyIds.includes(storyId)) {
      this.removeStoryFromCollection(collectionId, storyId);
    } else {
      this.addStoryToCollection(collectionId, storyId);
    }
  }

  isStoryInCollection(collectionId: string, storyId: string): boolean {
    const col = this.collections().find(c => c.id === collectionId);
    return col ? col.storyIds.includes(storyId) : false;
  }

  getCollectionById(collectionId: string): SavedCollection | undefined {
    return this.collections().find(c => c.id === collectionId);
  }

  getStoriesForCollection(collectionId: string): Story[] {
    const col = this.collections().find(c => c.id === collectionId);
    if (!col) return [];
    return this.stories().filter(s => col.storyIds.includes(s.id));
  }

  submitStory(data: {
    title: string;
    content: string;
    pillar: PillarType;
    categorySlug: string;
    pseudonym: string;
    batch?: string;
    contentWarning?: string;
    tags?: string[];
  }): Promise<Story> {
    const rawContent = data.content.trim();
    const finalTags = (data.tags && data.tags.length > 0) ? data.tags : ['CampusLife'];
    const category = this.categories().find(c => c.slug === data.categorySlug) || this.categories()[0];
    const pillarLabels: Record<PillarType, string> = {
      imagined: 'The Life I Imagined',
      lived: 'The Life I Actually Lived',
      unsaid: 'Things I Never Said'
    };

    const pillarReverseMapping: Record<PillarType, string> = {
      lived: 'NOSTALGIA',
      imagined: 'REGRET',
      unsaid: 'HOPE'
    };

    const tempId = `story-${Date.now()}`;
    const newStory: Story = {
      id: tempId,
      title: data.title,
      excerpt: rawContent.slice(0, 160) + (rawContent.length > 160 ? '...' : ''),
      content: rawContent,
      pillar: data.pillar,
      pillarLabel: pillarLabels[data.pillar],
      category: category.name,
      categorySlug: category.slug,
      authorPseudonym: data.pseudonym || this.currentPseudonym(),
      authorBatch: data.batch || '',
      publishedAt: 'Just now',
      readingTime: `${Math.max(1, Math.ceil(rawContent.split(' ').length / 150))} min read`,
      contentWarning: data.contentWarning,
      tags: finalTags,
      reactions: { relatable: 1, feltThis: 0, support: 0, laugh: 0 },
      userReaction: null,
      isSaved: false,
      status: 'published',
      submittedAt: 'Just now'
    };

    const backendPayload = {
      title: data.title,
      content: rawContent,
      pillar: pillarReverseMapping[data.pillar],
      categorySlug: data.categorySlug,
      pseudonym: data.pseudonym || this.currentPseudonym(),
      contentWarning: data.contentWarning,
      tags: finalTags
    };

    return new Promise((resolve) => {
      this.http.post<BackendStoryResponse>(`${this.apiUrl}/stories`, backendPayload).subscribe({
        next: (persisted) => {
          if (persisted && persisted.id) {
            const updated = this.mapBackendStory(persisted);
            if (updated.status === 'published') {
              this.stories.update(list => [updated, ...list]);
            }
            this.myStories.update(list => [updated, ...list]);
            resolve(updated);
          } else {
            this.stories.update(list => [newStory, ...list]);
            this.myStories.update(list => [newStory, ...list]);
            resolve(newStory);
          }
        },
        error: () => {
          this.stories.update(list => [newStory, ...list]);
          this.myStories.update(list => [newStory, ...list]);
          resolve(newStory);
        }
      });
    });
  }

  updateMyStory(id: string, data: {
    title: string;
    content: string;
    pillar: PillarType;
    categorySlug: string;
    pseudonym?: string;
    contentWarning?: string;
    tags?: string[];
  }): Promise<Story> {
    const rawContent = data.content.trim();
    const finalTags = (data.tags && data.tags.length > 0) ? data.tags : ['CampusLife'];
    const pillarReverseMapping: Record<PillarType, string> = {
      lived: 'NOSTALGIA',
      imagined: 'REGRET',
      unsaid: 'HOPE'
    };

    const backendPayload = {
      title: data.title.trim(),
      content: rawContent,
      pillar: pillarReverseMapping[data.pillar] || 'NOSTALGIA',
      categorySlug: data.categorySlug,
      pseudonym: data.pseudonym || this.currentPseudonym(),
      contentWarning: data.contentWarning,
      tags: finalTags
    };

    return new Promise((resolve, reject) => {
      if (id.length >= 32) {
        this.http.put<BackendStoryResponse>(`${this.apiUrl}/stories/${id}`, backendPayload).subscribe({
          next: (persisted) => {
            if (persisted && persisted.id) {
              const updated = this.mapBackendStory(persisted);
              this.myStories.update(list => list.map(s => s.id === id ? updated : s));
              if (updated.status === 'published') {
                this.stories.update(list => {
                  const exists = list.some(s => s.id === id);
                  if (exists) return list.map(s => s.id === id ? updated : s);
                  return [updated, ...list];
                });
              } else {
                this.stories.update(list => list.filter(s => s.id !== id));
              }
              this.loadPlatformStats();
              resolve(updated);
            } else {
              resolve(this.myStories().find(s => s.id === id)!);
            }
          },
          error: (err) => {
            reject(err);
          }
        });
      } else {
        // Mock fallback story
        this.myStories.update(list => list.map(s => {
          if (s.id !== id) return s;
          return {
            ...s,
            title: data.title,
            content: rawContent,
            excerpt: rawContent.slice(0, 160) + '...',
            pillar: data.pillar,
            categorySlug: data.categorySlug,
            status: 'published' as const,
            rejectionReason: undefined,
            moderationNote: undefined,
            tags: finalTags
          };
        }));
        const found = this.myStories().find(s => s.id === id);
        resolve(found!);
      }
    });
  }

  deleteMyStory(id: string): void {
    this.myStories.update(list => list.filter(s => s.id !== id));
    this.stories.update(list => list.filter(s => s.id !== id));

    if (id.length >= 32) {
      this.http.delete(`${this.apiUrl}/stories/${id}`).subscribe({
        error: () => {}
      });
    }
  }

  reportStory(storyId: string, storyTitle: string, reason: string, details: string): void {
    const newReport: ReportItem = {
      id: `rep-${Date.now()}`,
      storyId,
      storyTitle,
      reporterPseudonym: this.currentPseudonym(),
      reason,
      details,
      status: 'pending',
      reportedAt: 'Just now'
    };
    this.reports.update(list => [newReport, ...list]);

    if (storyId.length >= 32) {
      this.http.post(`${this.apiUrl}/stories/${storyId}/reports`, { reason, details }).subscribe({
        next: () => {
          this.loadReportsFromBackend();
        },
        error: () => {}
      });
    }
  }

  loadReportsFromBackend(status = 'ALL'): void {
    this.http.get<any[]>(`${this.apiUrl}/moderation/reports?status=${status}`).subscribe({
      next: (list) => {
        if (list && Array.isArray(list)) {
          const mapped: ReportItem[] = list.map(r => ({
            id: r.id,
            storyId: r.storyId,
            storyTitle: r.storyTitle,
            reporterPseudonym: r.reporterPseudonym || 'AI Safety Guard',
            reason: r.reason,
            details: r.details,
            status: r.status.toLowerCase() === 'resolved' ? 'reviewed' : (r.status.toLowerCase() === 'dismissed' ? 'dismissed' : 'pending'),
            reportedAt: this.formatDate(r.createdAt)
          }));
          this.reports.set(mapped);
        }
      },
      error: () => {}
    });
  }

  takeModerationAction(reportId: string, actionType: 'DISMISS' | 'REMOVE_STORY' | 'WARN_AUTHOR', notes = ''): void {
    const newStatus = actionType === 'DISMISS' ? 'dismissed' : 'reviewed';
    this.updateReportStatus(reportId, newStatus);

    const rep = this.reports().find(r => r.id === reportId);
    if (actionType === 'REMOVE_STORY' && rep) {
      this.stories.update(list => list.filter(s => s.id !== rep.storyId));
    }

    if (reportId.length >= 32) {
      this.http.post(`${this.apiUrl}/moderation/reports/${reportId}/action`, { actionType, notes }).subscribe({
        next: () => {
          this.loadReportsFromBackend();
        },
        error: () => {}
      });
    }
  }

  updateReportStatus(reportId: string, status: 'reviewed' | 'actioned' | 'dismissed'): void {
    this.reports.update(list => list.map(r => r.id === reportId ? { ...r, status } : r));
  }

  loadPlatformStats(): void {
    this.http.get<PlatformStats>(`${this.apiUrl}/stories/stats`).subscribe({
      next: (stats) => {
        if (stats) {
          this.platformStats.set(stats);
        }
      },
      error: () => {}
    });
  }

  submitAppeal(storyId: string, reason: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.http.post(`${this.apiUrl}/stories/${storyId}/appeal`, { reason }).subscribe({
        next: () => {
          this.loadAppealsFromBackend();
          this.loadMyStoriesFromBackend();
          resolve(true);
        },
        error: () => resolve(false)
      });
    });
  }

  loadAppealsFromBackend(status = 'ALL'): void {
    this.http.get<AppealItem[]>(`${this.apiUrl}/moderation/appeals?status=${status}`).subscribe({
      next: (list) => {
        if (list && Array.isArray(list)) {
          this.appeals.set(list);
        }
      },
      error: () => {}
    });
  }

  resolveAppeal(appealId: string, approve: boolean, notes = ''): void {
    this.http.post<AppealItem>(`${this.apiUrl}/moderation/appeals/${appealId}/resolve`, { approve, notes }).subscribe({
      next: () => {
        this.loadAppealsFromBackend();
        this.loadBackendStories();
        this.loadReportsFromBackend();
        this.loadPlatformStats();
      },
      error: () => {}
    });
  }
}
