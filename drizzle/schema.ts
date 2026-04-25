import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ["user", "admin", "editor", "moderator"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: userRole("role").default("user").notNull(),
  passwordHash: text("passwordHash"),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Kategoriler
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  color: varchar("color", { length: 50 }).default("#10B981"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Category = typeof categories.$inferSelect;

// Yazarlar
export const authors = pgTable("authors", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  bio: text("bio"),
  avatarUrl: text("avatarUrl"),
  email: varchar("email", { length: 320 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Author = typeof authors.$inferSelect;

// Haberler
export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  slug: varchar("slug", { length: 500 }).notNull().unique(),
  summary: text("summary"),
  content: text("content").notNull(),
  imageUrl: text("imageUrl"),
  categoryId: integer("categoryId").notNull(),
  authorId: integer("authorId"),
  isFeatured: boolean("isFeatured").default(false),
  isBreaking: boolean("isBreaking").default(false),
  viewCount: integer("viewCount").default(0),
  publishedAt: timestamp("publishedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Article = typeof articles.$inferSelect;

// Foto Galeriler
export const photoGalleries = pgTable("photo_galleries", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 300 }).notNull(),
  slug: varchar("slug", { length: 300 }).notNull().unique(),
  description: text("description"),
  coverImageUrl: text("coverImageUrl"),
  categoryId: integer("categoryId"),
  publishedAt: timestamp("publishedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PhotoGallery = typeof photoGalleries.$inferSelect;

// Galeri Fotoğrafları
export const galleryPhotos = pgTable("gallery_photos", {
  id: serial("id").primaryKey(),
  galleryId: integer("galleryId").notNull(),
  imageUrl: text("imageUrl").notNull(),
  caption: text("caption"),
  order: integer("order").default(0),
});

export type GalleryPhoto = typeof galleryPhotos.$inferSelect;

// Video Galeriler
export const videoGalleries = pgTable("video_galleries", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 300 }).notNull(),
  slug: varchar("slug", { length: 300 }).notNull().unique(),
  description: text("description"),
  thumbnailUrl: text("thumbnailUrl"),
  videoUrl: text("videoUrl"),
  duration: varchar("duration", { length: 20 }),
  publishedAt: timestamp("publishedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type VideoGallery = typeof videoGalleries.$inferSelect;

// Etkinlikler
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 300 }).notNull(),
  description: text("description"),
  location: varchar("location", { length: 300 }),
  imageUrl: text("imageUrl"),
  category: varchar("category", { length: 100 }),
  eventDate: timestamp("eventDate").notNull(),
  eventEndDate: timestamp("eventEndDate"),
  isAllDay: boolean("isAllDay").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Event = typeof events.$inferSelect;

// Etiketler (Tags)
export const tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Tag = typeof tags.$inferSelect;

// Haber-Etiket İlişkisi
export const articleTags = pgTable("article_tags", {
  id: serial("id").primaryKey(),
  articleId: integer("articleId").notNull(),
  tagId: integer("tagId").notNull(),
});

export type ArticleTag = typeof articleTags.$inferSelect;

// Newsletter Aboneleri
export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  isActive: boolean("isActive").default(true),
  subscribedAt: timestamp("subscribedAt").defaultNow().notNull(),
});

export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;

// Audit log — admin activity trail
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  userName: varchar("userName", { length: 200 }).notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  targetType: varchar("targetType", { length: 50 }),
  targetId: integer("targetId"),
  details: text("details"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;

// Citizen Reports — "Muhabirimiz Ol"
export const citizenReports = pgTable("citizen_reports", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  title: varchar("title", { length: 500 }).notNull(),
  content: text("content").notNull(),
  location: varchar("location", { length: 200 }),
  imageUrl: text("imageUrl"),
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CitizenReport = typeof citizenReports.$inferSelect;
export type InsertCitizenReport = typeof citizenReports.$inferInsert;

// Newspaper Issues — PDF gazete arşivi
export const newspaperIssues = pgTable("newspaper_issues", {
  id: serial("id").primaryKey(),
  issueNumber: integer("issueNumber").notNull().unique(),
  title: varchar("title", { length: 300 }),
  coverImageUrl: text("coverImageUrl").notNull(),
  pdfUrl: text("pdfUrl").notNull(),
  publishDate: timestamp("publishDate").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type NewspaperIssue = typeof newspaperIssues.$inferSelect;

// Comments
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  articleId: integer("articleId").notNull(),
  authorName: varchar("authorName", { length: 200 }).notNull(),
  authorEmail: varchar("authorEmail", { length: 320 }).notNull(),
  content: text("content").notNull(),
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Comment = typeof comments.$inferSelect;
export type InsertComment = typeof comments.$inferInsert;
