import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import {
  Article,
  AuditLog,
  Author,
  Category,
  CitizenReport,
  Comment,
  Event,
  GalleryPhoto,
  InsertCitizenReport,
  InsertComment,
  InsertUser,
  NewspaperIssue,
  PhotoGallery,
  Tag,
  User,
  VideoGallery,
  articles,
  articleTags,
  auditLogs,
  authors,
  categories,
  citizenReports,
  comments,
  events,
  galleryPhotos,
  newsletterSubscribers,
  newspaperIssues,
  photoGalleries,
  tags,
  users,
  videoGalleries,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ── Users ──────────────────────────────────────────────────────────────────
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;

  for (const field of textFields) {
    const value = user[field];
    if (value === undefined) continue;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  }

  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }

  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onConflictDoUpdate({ target: users.openId, set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

// ── Categories ─────────────────────────────────────────────────────────────
export async function getAllCategories(): Promise<Category[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories).orderBy(categories.id);
}

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  return result[0];
}

// ── Articles ───────────────────────────────────────────────────────────────
export async function getFeaturedArticles(limit = 6): Promise<Article[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(articles)
    .where(eq(articles.isFeatured, true))
    .orderBy(desc(articles.publishedAt))
    .limit(limit);
}

export async function getBreakingArticles(limit = 8): Promise<Article[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(articles)
    .where(eq(articles.isBreaking, true))
    .orderBy(desc(articles.publishedAt))
    .limit(limit);
}

export async function getLatestArticles(limit = 20, offset = 0): Promise<Article[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(articles)
    .orderBy(desc(articles.publishedAt))
    .limit(limit)
    .offset(offset);
}

export async function getArticlesByCategory(
  categoryId: number,
  limit = 12,
  offset = 0
): Promise<Article[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(articles)
    .where(eq(articles.categoryId, categoryId))
    .orderBy(desc(articles.publishedAt))
    .limit(limit)
    .offset(offset);
}

export async function getArticleCountByCategory(categoryId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(articles)
    .where(eq(articles.categoryId, categoryId));
  return Number(result[0]?.count ?? 0);
}

export async function getArticleBySlug(slug: string): Promise<Article | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(articles).where(eq(articles.slug, slug)).limit(1);
  return result[0];
}

export async function getRelatedArticles(
  categoryId: number,
  excludeId: number,
  limit = 4
): Promise<Article[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(articles)
    .where(and(eq(articles.categoryId, categoryId), sql`${articles.id} != ${excludeId}`))
    .orderBy(desc(articles.publishedAt))
    .limit(limit);
}

export async function searchArticles(query: string, limit = 20): Promise<Article[]> {
  const db = await getDb();
  if (!db) return [];
  const q = `%${query}%`;
  return db
    .select()
    .from(articles)
    .where(or(ilike(articles.title, q), ilike(articles.summary, q), ilike(articles.content, q)))
    .orderBy(desc(articles.publishedAt))
    .limit(limit);
}

export async function incrementViewCount(articleId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db
    .update(articles)
    .set({ viewCount: sql`${articles.viewCount} + 1` })
    .where(eq(articles.id, articleId));
}

// ── Authors ────────────────────────────────────────────────────────────────
export async function getAllAuthors(): Promise<Author[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(authors).orderBy(authors.name);
}

export async function getAuthorById(id: number): Promise<Author | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(authors).where(eq(authors.id, id)).limit(1);
  return result[0];
}

export async function getArticlesByAuthor(authorId: number, limit = 20): Promise<Article[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(articles)
    .where(eq(articles.authorId, authorId))
    .orderBy(desc(articles.publishedAt))
    .limit(limit);
}

// ── Photo Galleries ────────────────────────────────────────────────────────
export async function getPhotoGalleries(limit = 20): Promise<PhotoGallery[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(photoGalleries)
    .orderBy(desc(photoGalleries.publishedAt))
    .limit(limit);
}

export async function getPhotoGalleryBySlug(slug: string): Promise<PhotoGallery | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(photoGalleries)
    .where(eq(photoGalleries.slug, slug))
    .limit(1);
  return result[0];
}

export async function getGalleryPhotos(galleryId: number): Promise<GalleryPhoto[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(galleryPhotos)
    .where(eq(galleryPhotos.galleryId, galleryId))
    .orderBy(galleryPhotos.order);
}

// ── Video Galleries ────────────────────────────────────────────────────────
export async function getVideoGalleries(limit = 20): Promise<VideoGallery[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(videoGalleries)
    .orderBy(desc(videoGalleries.publishedAt))
    .limit(limit);
}

export async function getVideoGalleryBySlug(slug: string): Promise<VideoGallery | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(videoGalleries)
    .where(eq(videoGalleries.slug, slug))
    .limit(1);
  return result[0];
}

// ── Events ─────────────────────────────────────────────────────────────────
export async function getUpcomingEvents(limit = 12): Promise<Event[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(events)
    .where(sql`${events.eventDate} >= NOW()`)
    .orderBy(events.eventDate)
    .limit(limit);
}

export async function getAllEvents(limit = 20): Promise<Event[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(events).orderBy(events.eventDate).limit(limit);
}

// ── Tags ───────────────────────────────────────────────────────────────────────────
export async function getTagsByArticleId(articleId: number): Promise<Tag[]> {
  const db = await getDb();
  if (!db) return [];
  const result = await db
    .select({ tag: tags })
    .from(articleTags)
    .innerJoin(tags, eq(articleTags.tagId, tags.id))
    .where(eq(articleTags.articleId, articleId));
  return result.map((r) => r.tag);
}

export async function getAllTags(): Promise<Tag[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tags).orderBy(tags.name);
}

export async function getArticlesByTag(tagSlug: string, limit = 20): Promise<Article[]> {
  const db = await getDb();
  if (!db) return [];
  const tagResult = await db.select().from(tags).where(eq(tags.slug, tagSlug)).limit(1);
  if (!tagResult[0]) return [];
  const result = await db
    .select({ article: articles })
    .from(articleTags)
    .innerJoin(articles, eq(articleTags.articleId, articles.id))
    .where(eq(articleTags.tagId, tagResult[0].id))
    .orderBy(desc(articles.publishedAt))
    .limit(limit);
  return result.map((r) => r.article);
}

// ── Most Read ──────────────────────────────────────────────────────────────────────
export async function getMostReadArticles(limit = 10): Promise<Article[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(articles)
    .orderBy(desc(articles.viewCount))
    .limit(limit);
}

// ── Newsletter ─────────────────────────────────────────────────────────────────────
export async function subscribeNewsletter(email: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  try {
    await db.insert(newsletterSubscribers).values({ email }).onConflictDoUpdate({ target: newsletterSubscribers.email, set: { isActive: true } });
    return true;
  } catch {
    return false;
  }
}

// ── Citizen Reports — "Muhabirimiz Ol" ─────────────────────────────────────
export async function submitCitizenReport(report: InsertCitizenReport): Promise<CitizenReport | null> {
  const db = await getDb();
  if (!db) return null;
  try {
    const [inserted] = await db.insert(citizenReports).values(report).returning();
    return inserted;
  } catch (error) {
    console.error("[CitizenReport] Failed to insert:", error);
    return null;
  }
}

export async function listCitizenReports(status?: string): Promise<CitizenReport[]> {
  const db = await getDb();
  if (!db) return [];
  const q = db.select().from(citizenReports).orderBy(desc(citizenReports.createdAt));
  if (status) return q.where(eq(citizenReports.status, status));
  return q;
}

// ── Newspaper Issues ──────────────────────────────────────────────────────
export async function listNewspaperIssues(limit = 24): Promise<NewspaperIssue[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(newspaperIssues).orderBy(desc(newspaperIssues.publishDate)).limit(limit);
}

export async function getLatestNewspaperIssue(): Promise<NewspaperIssue | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(newspaperIssues).orderBy(desc(newspaperIssues.publishDate)).limit(1);
  return result[0];
}

// ── Comments ──────────────────────────────────────────────────────────────
export async function submitComment(comment: InsertComment): Promise<Comment | null> {
  const db = await getDb();
  if (!db) return null;
  try {
    const [inserted] = await db.insert(comments).values(comment).returning();
    return inserted;
  } catch (error) {
    console.error("[Comment] Failed to insert:", error);
    return null;
  }
}

export async function getCommentsByArticle(articleId: number, onlyApproved = true): Promise<Comment[]> {
  const db = await getDb();
  if (!db) return [];
  const q = db.select().from(comments).where(
    onlyApproved
      ? and(eq(comments.articleId, articleId), eq(comments.status, "approved"))
      : eq(comments.articleId, articleId)
  ).orderBy(desc(comments.createdAt));
  return q;
}

// ══════ ADMIN: Article CRUD ══════════════════════════════════════════════
export async function adminListArticles(opts?: {
  search?: string;
  categoryId?: number;
  limit?: number;
  offset?: number;
}): Promise<Article[]> {
  const db = await getDb();
  if (!db) return [];
  const limit = opts?.limit ?? 50;
  const offset = opts?.offset ?? 0;
  let q = db.select().from(articles).$dynamic();
  const conditions = [];
  if (opts?.search) {
    const s = `%${opts.search}%`;
    conditions.push(or(ilike(articles.title, s), ilike(articles.slug, s)));
  }
  if (opts?.categoryId) conditions.push(eq(articles.categoryId, opts.categoryId));
  if (conditions.length) q = q.where(and(...conditions));
  return q.orderBy(desc(articles.createdAt)).limit(limit).offset(offset);
}

export async function adminGetArticle(id: number): Promise<Article | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(articles).where(eq(articles.id, id)).limit(1);
  return result[0];
}

export async function adminCreateArticle(data: {
  title: string;
  slug: string;
  summary?: string | null;
  content: string;
  imageUrl?: string | null;
  categoryId: number;
  authorId?: number | null;
  isFeatured?: boolean;
  isBreaking?: boolean;
  publishedAt?: Date;
}): Promise<Article | null> {
  const db = await getDb();
  if (!db) return null;
  const [inserted] = await db.insert(articles).values(data).returning();
  return inserted;
}

export async function adminUpdateArticle(id: number, data: Partial<{
  title: string;
  slug: string;
  summary: string | null;
  content: string;
  imageUrl: string | null;
  categoryId: number;
  authorId: number | null;
  isFeatured: boolean;
  isBreaking: boolean;
  publishedAt: Date;
}>): Promise<Article | null> {
  const db = await getDb();
  if (!db) return null;
  const [updated] = await db.update(articles).set(data).where(eq(articles.id, id)).returning();
  return updated ?? null;
}

export async function adminDeleteArticle(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  await db.delete(articles).where(eq(articles.id, id));
  return true;
}

// ══════ ADMIN: Comments moderation ═══════════════════════════════════════
export async function adminListComments(status?: string): Promise<Comment[]> {
  const db = await getDb();
  if (!db) return [];
  const q = db.select().from(comments).$dynamic().orderBy(desc(comments.createdAt));
  if (status) return q.where(eq(comments.status, status));
  return q;
}

export async function adminUpdateCommentStatus(id: number, status: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  await db.update(comments).set({ status }).where(eq(comments.id, id));
  return true;
}

export async function adminDeleteComment(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  await db.delete(comments).where(eq(comments.id, id));
  return true;
}

// ══════ ADMIN: Citizen reports moderation ════════════════════════════════
export async function adminUpdateReportStatus(id: number, status: string, notes?: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  await db.update(citizenReports).set({ status, ...(notes !== undefined ? { notes } : {}) }).where(eq(citizenReports.id, id));
  return true;
}

export async function adminDeleteReport(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  await db.delete(citizenReports).where(eq(citizenReports.id, id));
  return true;
}

export async function adminGetReport(id: number): Promise<CitizenReport | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(citizenReports).where(eq(citizenReports.id, id)).limit(1);
  return result[0];
}

// ══════ ADMIN: Users ════════════════════════════════════════════════════
export async function adminListUsers(): Promise<User[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt));
}

export async function adminCreateStaffUser(data: {
  openId: string;
  email: string;
  name: string;
  role: "admin" | "editor" | "moderator";
  passwordHash: string;
}): Promise<User | null> {
  const db = await getDb();
  if (!db) return null;
  const [inserted] = await db.insert(users).values({
    ...data,
    loginMethod: "password",
    active: true,
  }).returning();
  return inserted;
}

export async function adminUpdateUser(id: number, data: Partial<{
  name: string;
  email: string;
  role: "user" | "admin" | "editor" | "moderator";
  active: boolean;
  passwordHash: string;
}>): Promise<User | null> {
  const db = await getDb();
  if (!db) return null;
  const [updated] = await db.update(users).set(data).where(eq(users.id, id)).returning();
  return updated ?? null;
}

export async function adminDeleteUser(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  await db.delete(users).where(eq(users.id, id));
  return true;
}

// ══════ ADMIN: Newspaper Issues ══════════════════════════════════════════
export async function adminCreateIssue(data: {
  issueNumber: number;
  title?: string | null;
  coverImageUrl: string;
  pdfUrl: string;
  publishDate: Date;
}): Promise<NewspaperIssue | null> {
  const db = await getDb();
  if (!db) return null;
  const [inserted] = await db.insert(newspaperIssues).values(data).returning();
  return inserted;
}

export async function adminDeleteIssue(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  await db.delete(newspaperIssues).where(eq(newspaperIssues.id, id));
  return true;
}

// ══════ ADMIN: Audit logs ═══════════════════════════════════════════════
export async function writeAuditLog(entry: {
  userId: number;
  userName: string;
  action: string;
  targetType?: string;
  targetId?: number;
  details?: string;
}): Promise<void> {
  const db = await getDb();
  if (!db) return;
  try {
    await db.insert(auditLogs).values(entry);
  } catch (err) {
    console.error("[Audit] Failed to log:", err);
  }
}

export async function adminListAuditLogs(limit = 100): Promise<AuditLog[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(limit);
}

// ══════ ADMIN: Dashboard stats ═══════════════════════════════════════════
export async function adminDashboardStats(): Promise<{
  articles: number;
  pendingComments: number;
  pendingReports: number;
  subscribers: number;
}> {
  const db = await getDb();
  if (!db) return { articles: 0, pendingComments: 0, pendingReports: 0, subscribers: 0 };

  const [aCount] = await db.select({ c: sql<number>`count(*)` }).from(articles);
  const [cPending] = await db.select({ c: sql<number>`count(*)` }).from(comments).where(eq(comments.status, "pending"));
  const [rPending] = await db.select({ c: sql<number>`count(*)` }).from(citizenReports).where(eq(citizenReports.status, "pending"));
  const [subs] = await db.select({ c: sql<number>`count(*)` }).from(newsletterSubscribers).where(eq(newsletterSubscribers.isActive, true));

  return {
    articles: Number(aCount?.c ?? 0),
    pendingComments: Number(cPending?.c ?? 0),
    pendingReports: Number(rPending?.c ?? 0),
    subscribers: Number(subs?.c ?? 0),
  };
}
