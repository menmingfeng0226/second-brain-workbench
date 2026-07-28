export interface NavItem {
  id: string;
  name: string;
  icon: string;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

export interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

export interface FilterGroup {
  name: string;
  options: FilterOption[];
}

export type CardType = '案例' | '洞察';

export interface ContentCard {
  id: string;
  type: CardType;
  person: string;
  scene: string;
  title: string;
  content: string;
  topics?: string[];
  isHighValue?: boolean;
  isPendingReview?: boolean;
  usedInTopics?: string[];
  usedInScripts?: string[];
}

export type TopicStatus = 'idea' | 'planned' | 'scripting' | 'filming' | 'editing' | 'published' | 'archived';
export type TopicPriority = 'P0' | 'P1' | 'P2';

export interface Topic {
  id: string;
  title: string;
  hook: string;
  collection: string;
  status: TopicStatus;
  priority: TopicPriority;
  owner: string;
  deadline: string;
  tags: string[];
  views?: number;
  likes?: number;
  coins?: number;
  publishedAt?: string;
  relatedCardIds: string[];
}

export interface TopicCollection {
  id: string;
  name: string;
  color: string;
  count: number;
  description: string;
}

export type ScriptStatus = 'draft' | 'reviewing' | 'approved' | 'published';

export interface Script {
  id: string;
  topicId: string;
  title: string;
  status: ScriptStatus;
  duration: number;
  wordCount: number;
  updatedAt: string;
  editor: string;
  opening: string;
  body: string;
  closing: string;
  tags: string[];
}

export type ProjectStatus = 'on-track' | 'at-risk' | 'delayed' | 'done';

export interface ProjectMilestone {
  id: string;
  name: string;
  date: string;
  done: boolean;
}

export interface Project {
  id: string;
  name: string;
  owner: string;
  progress: number;
  status: ProjectStatus;
  deadline: string;
  budget: string;
  description: string;
  milestones: ProjectMilestone[];
  tags: string[];
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  usage: number;
  status: 'active' | 'draft' | 'disabled';
  version: string;
  updatedAt: string;
  description: string;
  author: string;
}

export type BrandDealStatus = 'lead' | 'negotiating' | 'signed' | 'delivered' | 'paid';

export interface BrandDeal {
  id: string;
  brand: string;
  product: string;
  status: BrandDealStatus;
  value: number;
  owner: string;
  signedAt?: string;
  deadline: string;
  platform: string;
  note: string;
}

export interface VideoLab {
  id: string;
  title: string;
  cover: string;
  zone: string;
  author: string;
  url: string;
  date: string;
  channel: ChannelPlatform;
  views: number;
  likes: number;
  comments: number;
  coins: number;
  shares: number;
  favorites: number;
  watchRate: number;
  avgWatch: number;
  duration: string;
  tags: string[];
  score: number;
  hotIndex?: number;
  engagementRate?: number;
  watchSeconds?: number;
}

export interface ArticleLab {
  id: string;
  title: string;
  cover: string;
  coverImg: string;
  author: string;
  zone: string;
  url: string;
  date: string;
  channel: ChannelPlatform;
  category: '干货' | '科普' | '情感' | '职场' | '生活方式' | '商业评论' | '故事';
  views: number;
  likes: number;
  comments: number;
  shares: number;
  collects: number;
  readRate: number;
  avgReadSeconds: number;
  words: number;
  score: number;
  tags: string[];
  hotIndex?: number;
  engagementRate?: number;
}

export type IdeaStatus = 'idea' | 'research' | 'approved' | 'scripting' | 'filming' | 'published' | 'archived';
export type IdeaPriority = 'P0' | 'P1' | 'P2';

export interface IdeaItem {
  id: string;
  title: string;
  hook: string;
  source: '灵感闪念' | '热点衍生' | '爆款拆解' | '粉丝提问' | '采访素材' | '竞品参考';
  channels: ChannelPlatform[];
  status: IdeaStatus;
  priority: IdeaPriority;
  owner: string;
  deadline: string;
  heat: number;
  tags: string[];
  usedCards?: number;
}

export interface Competitor {
  id: string;
  name: string;
  tagline: string;
  channel: ChannelPlatform;
  avatarColor: string;
  followers: number;
  monthViews: number;
  monthPublished: number;
  avgEngagement: number;
  deltaFollowers: number;
  latestTitle: string;
  latestDate: string;
  latestViews: number;
  alert?: string;
}

export type RevenueCategory =
  | '广告分成'
  | '商单合作'
  | '直播打赏'
  | '知识付费'
  | '电商带货'
  | '周边产品'
  | '粉丝会员'
  | '其他';

export interface RevenueItem {
  id: string;
  date: string;
  category: RevenueCategory;
  channel: ChannelPlatform;
  amount: number;
  note?: string;
}

export type TaskStatus = 'todo' | 'doing' | 'stuck' | 'review' | 'done';
export type TaskPriority = 'P0' | 'P1' | 'P2';

export interface TaskItem {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  owner: string;
  deadline: string;
  channel?: ChannelPlatform;
  related?: string;
  tags: string[];
}

export interface HotItem {
  id: string;
  source: ChannelPlatform | '综合热搜';
  rank: number;
  title: string;
  heat: number;
  heatDesc: string;
  tags: string[];
  trend: 'hot' | 'up' | 'new';
  relatedIdeas?: number;
}

export interface EventItem {
  id: string;
  title: string;
  type: '线下沙龙' | '粉丝见面会' | '共创会' | '商务活动' | '培训课';
  date: string;
  time: string;
  location: string;
  capacity: number;
  registered: number;
  status: '筹备中' | '报名中' | '已截止' | '已完成';
  host: string;
  fee: string;
}

export type BackendMetric = {
  label: string;
  value: string;
  delta: number;
  trend: 'up' | 'down';
  icon: string;
};

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatarColor: string;
  workload: number;
  tasksDone: number;
  kpi: number;
  joinedAt: string;
}

export type ChannelPlatform =
  | 'bilibili'
  | 'xiaohongshu'
  | 'douyin'
  | 'wechat-video'
  | 'kuaishou'
  | 'wechat-official'
  | 'ximalaya'
  | 'xiaoyuzhou'
  | 'zhihu';

export interface ChannelData {
  id: ChannelPlatform;
  name: string;
  color: string;
  icon: string;
  category: '视频' | '图文' | '播客';
  totalFollowers: number;
  monthFollowersDelta: number;
  monthPublished: number;
  monthViews: number;
  monthLikes: number;
  monthComments: number;
  monthShares: number;
  monthRevenue: number;
  avgEngagementRate: number;
  avgWatchSeconds?: number;
  avgReadRate?: number;
  avgListenSeconds?: number;
}

export type PublishStatus =
  | 'published'
  | 'scheduled'
  | 'editing'
  | 'filming'
  | 'planning';

export interface PublishCalendarItem {
  id: string;
  title: string;
  date: string;
  time?: string;
  status: PublishStatus;
  platforms: ChannelPlatform[];
  priority: TopicPriority;
  views?: number;
  likes?: number;
  topicId?: string;
}

export interface DashboardKPI {
  label: string;
  value: string;
  delta: number;
  trend: 'up' | 'down';
  sub?: string;
  accent: string;
}

export interface DailyViewsTrend {
  date: string;
  views: number;
  likes: number;
  newFollowers: number;
}

export interface PublishRecord {
  id: string;
  date: string;
  platform: ChannelPlatform;
  title: string;
  views: number;
  likes: number;
  comments: number;
  engagementRate: number;
  status: PublishStatus;
}

export type FeedbackStatus = 'pending' | 'resolved' | 'ignored';

export interface FeedbackItem {
  id: string;
  noteId: string;
  noteTitle: string;
  noteCategory: '脚本' | '笔记' | '选题' | '素材' | '文献';
  authorId: string;
  author: string;
  authorColor: string;
  content: string;
  selectionStart?: number;
  selectionEnd?: number;
  selectedSnippet?: string;
  timestampSec?: number;
  parentId?: string;
  status: FeedbackStatus;
  mentions?: string[];
  replies?: FeedbackReply[];
  createdAt: string;
  resolvedBy?: string;
  resolvedAt?: string;
  isUnread: boolean;
}

export interface FeedbackReply {
  id: string;
  parentId: string;
  author: string;
  authorColor: string;
  content: string;
  createdAt: string;
}

export type SyncAction = 'create' | 'update' | 'delete';
export type SyncStatus = 'pending' | 'syncing' | 'synced' | 'failed';
export type SyncQueueStatus = SyncStatus | 'done' | 'conflict' | 'skipped_private';

export interface SyncQueueItem {
  id: string;
  noteId: string;
  noteTitle: string;
  noteCategory: '脚本' | '笔记' | '选题' | '素材' | '文献';
  type: 'note' | 'video' | 'idea' | 'asset' | 'feedback';
  action: SyncAction;
  title: string;
  author: string;
  device: string;
  direction: 'upload' | 'download';
  status: SyncStatus;
  retryCount: number;
  isPrivate: boolean;
  isEncrypted: boolean;
  sizeKb: number;
  speedKbps?: number;
  progress?: number;
  createdAt: string;
  syncedAt?: string;
  statusUpdatedAt: string;
  error?: string;
}

export interface SyncVersion {
  id: string;
  noteId: string;
  noteTitle: string;
  versionHash: string;
  contentSnapshot: string;
  label: string;
  diffSummary: string;
  author: string;
  device: string;
  createdAt: string;
  version: number;
  title: string;
  changeSummary: string;
  sizeKb: number;
  isCurrent: boolean;
}

export interface SyncConflict {
  id: string;
  noteId: string;
  noteTitle: string;
  title: string;
  localVersion: number;
  remoteVersion: number;
  baseVersion: string;
  localAuthor: string;
  remoteAuthor: string;
  localUpdatedAt: string;
  remoteUpdatedAt: string;
  localModifiedAt: string;
  remoteModifiedAt: string;
  detectedAt: string;
  localDiff: string;
  remoteDiff: string;
  recommendedStrategy: 'local' | 'remote' | 'smart' | 'manual';
  resolution?: 'local' | 'remote' | 'merge' | 'smart';
  resolvedBy?: string;
  resolvedAt?: string;
  status: 'open' | 'resolved';
  diffPreview: string;
}

export type SyncLogLevel = 'info' | 'success' | 'warn' | 'error';

export interface SyncLogItem {
  id: string;
  action: SyncAction | 'conflict' | 'retry' | 'merge';
  noteId: string;
  noteTitle: string;
  status: 'success' | 'failed' | 'warning' | 'info';
  level: SyncLogLevel;
  module: string;
  message: string;
  details?: string;
  timestamp: string;
}

// ============================================================
// 平台账号与真实数据抓取体系 (正式环境落地)
// ============================================================

export type AccountAuthMethod =
  | 'cookie'
  | 'oauth'
  | 'token'
  | 'password'
  | 'apikey'
  | 'wechat-qrcode';

export interface AccountCredentialFields {
  SESSDATA?: string;
  bili_jct?: string;
  DedeUserID?: string;
  buvid3?: string;
  accessToken?: string;
  refreshToken?: string;
  openId?: string;
  cookie?: string;
  x_s?: string;
  x_t?: string;
  a1?: string;
  web_session?: string;
  appid?: string;
  appSecret?: string;
  mid?: string;
  xm_token?: string;
  xyz_id?: string;
  z_c0?: string;
  d_c0?: string;
  apiKey?: string;
  expiresAt?: number;
  [key: string]: string | number | undefined;
}

export interface PlatformAccount {
  id: string;
  platform: ChannelPlatform;
  handle: string;
  displayName: string;
  avatarUrl?: string;
  profileUrl?: string;
  authMethod: AccountAuthMethod;
  credentialsEncrypted: string;
  credentialFingerprint: string;
  scopes?: string[];
  followerCount: number;
  linkedAt: string;
  credentialsUpdatedAt?: string;
  lastVerifiedAt?: string;
  lastSyncAt?: string;
  lastSyncError?: string;
  syncStatus: 'linked' | 'expired' | 'syncing' | 'failed' | 'unlinked';
  isDefault?: boolean;
  userId: string;
}

export type CrawlTargetScope =
  | 'profile'
  | 'channel-metrics'
  | 'published-list'
  | 'hot-list'
  | 'viral-videos'
  | 'viral-articles'
  | 'trend'
  | 'revenue'
  | 'full';

export type CrawlJobStatus =
  | 'queued'
  | 'running'
  | 'success'
  | 'partial'
  | 'failed'
  | 'skipped'
  | 'aborted';

export interface CrawlJob {
  id: string;
  platform: ChannelPlatform;
  accountId: string;
  scope: CrawlTargetScope[];
  rangeStart?: string;
  rangeEnd?: string;
  createdAt: string;
  startedAt?: string;
  finishedAt?: string;
  durationMs?: number;
  status: CrawlJobStatus;
  recordsFetched: number;
  errorMessage?: string;
  retryOf?: string;
  retryCount: number;
  trigger: 'manual' | 'cron' | 'on-login' | 'page-enter' | 'ui-refresh';
}

export interface CrawlMetricsSummary {
  totalFollowers?: number;
  monthFollowersDelta?: number;
  monthPublished?: number;
  monthViews?: number;
  monthLikes?: number;
  monthComments?: number;
  monthShares?: number;
  monthRevenue?: number;
  avgEngagementRate?: number;
  avgWatchSeconds?: number;
  avgReadRate?: number;
  avgListenSeconds?: number;
}

export interface PlatformCrawlResult {
  jobId: string;
  platform: ChannelPlatform;
  accountId: string;
  fetchedAt: string;
  source: 'platform-api' | 'edge-proxy' | 'mock-fallback' | 'local-cache';
  profile?: {
    handle: string;
    displayName: string;
    avatarUrl?: string;
    profileUrl?: string;
    followerCount: number;
  };
  channelMetrics?: ChannelData;
  videos?: VideoLab[];
  articles?: ArticleLab[];
  publishRecords?: PublishRecord[];
  trendSeries?: DailyViewsTrend[];
  summary?: CrawlMetricsSummary;
  rawSizeBytes?: number;
  warnings?: string[];
}

export interface SchedulerPolicy {
  id: string;
  name: string;
  cronExpr: string;
  cron?: string;
  enabled: boolean;
  scope: CrawlTargetScope[];
  platforms: ChannelPlatform[];
  platform?: ChannelPlatform;
  onlyLinkedAccounts: boolean;
  rangeDays?: number;
  lastRunAt?: string;
  nextRunAt?: string;
  lastStatus?: CrawlJobStatus;
}

