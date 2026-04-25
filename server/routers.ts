import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { adminRouter } from "./adminRouter";
import {
  getAllCategories,
  getCategoryBySlug,
  getFeaturedArticles,
  getBreakingArticles,
  getLatestArticles,
  getArticlesByCategory,
  getArticleCountByCategory,
  getArticleBySlug,
  getRelatedArticles,
  searchArticles,
  incrementViewCount,
  getAllAuthors,
  getAuthorById,
  getArticlesByAuthor,
  getPhotoGalleries,
  getPhotoGalleryBySlug,
  getGalleryPhotos,
  getVideoGalleries,
  getVideoGalleryBySlug,
  getUpcomingEvents,
  getAllEvents,
  getTagsByArticleId,
  getAllTags,
  getArticlesByTag,
  getMostReadArticles,
  subscribeNewsletter,
  submitCitizenReport,
  listCitizenReports,
  listNewspaperIssues,
  getLatestNewspaperIssue,
  submitComment,
  getCommentsByArticle,
} from "./db";

export const appRouter = router({
  system: systemRouter,
  admin: adminRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ── Categories ──────────────────────────────────────────────────────────
  categories: router({
    list: publicProcedure.query(() => getAllCategories()),
    bySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(({ input }) => getCategoryBySlug(input.slug)),
  }),

  // ── Articles ────────────────────────────────────────────────────────────
  articles: router({
    featured: publicProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(({ input }) => getFeaturedArticles(input?.limit)),

    breaking: publicProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(({ input }) => getBreakingArticles(input?.limit)),

    latest: publicProcedure
      .input(z.object({ limit: z.number().optional(), offset: z.number().optional() }).optional())
      .query(({ input }) => getLatestArticles(input?.limit, input?.offset)),

    byCategory: publicProcedure
      .input(
        z.object({
          categoryId: z.number(),
          limit: z.number().optional(),
          offset: z.number().optional(),
        })
      )
      .query(({ input }) =>
        getArticlesByCategory(input.categoryId, input.limit, input.offset)
      ),

    countByCategory: publicProcedure
      .input(z.object({ categoryId: z.number() }))
      .query(({ input }) => getArticleCountByCategory(input.categoryId)),

    bySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(({ input }) => getArticleBySlug(input.slug)),

    related: publicProcedure
      .input(
        z.object({
          categoryId: z.number(),
          excludeId: z.number(),
          limit: z.number().optional(),
        })
      )
      .query(({ input }) =>
        getRelatedArticles(input.categoryId, input.excludeId, input.limit)
      ),

    search: publicProcedure
      .input(z.object({ query: z.string(), limit: z.number().optional() }))
      .query(({ input }) => {
        if (!input.query.trim()) return [];
        return searchArticles(input.query, input.limit);
      }),

    incrementView: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => incrementViewCount(input.id)),
  }),

  // ── Authors ─────────────────────────────────────────────────────────────
  authors: router({
    list: publicProcedure.query(() => getAllAuthors()),
    byId: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => getAuthorById(input.id)),
    articles: publicProcedure
      .input(z.object({ authorId: z.number(), limit: z.number().optional() }))
      .query(({ input }) => getArticlesByAuthor(input.authorId, input.limit)),
  }),

  // ── Photo Galleries ──────────────────────────────────────────────────────
  photoGalleries: router({
    list: publicProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(({ input }) => getPhotoGalleries(input?.limit)),
    bySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(({ input }) => getPhotoGalleryBySlug(input.slug)),
    photos: publicProcedure
      .input(z.object({ galleryId: z.number() }))
      .query(({ input }) => getGalleryPhotos(input.galleryId)),
  }),

  // ── Video Galleries ──────────────────────────────────────────────────────
  videoGalleries: router({
    list: publicProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(({ input }) => getVideoGalleries(input?.limit)),
    bySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(({ input }) => getVideoGalleryBySlug(input.slug)),
  }),

  // ── Events ───────────────────────────────────────────────────────────────────
  events: router({
    upcoming: publicProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(({ input }) => getUpcomingEvents(input?.limit)),
    all: publicProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(({ input }) => getAllEvents(input?.limit)),
  }),

  // ── Tags ─────────────────────────────────────────────────────────────────────
  tags: router({
    list: publicProcedure.query(() => getAllTags()),
    byArticle: publicProcedure
      .input(z.object({ articleId: z.number() }))
      .query(({ input }) => getTagsByArticleId(input.articleId)),
    articles: publicProcedure
      .input(z.object({ slug: z.string(), limit: z.number().optional() }))
      .query(({ input }) => getArticlesByTag(input.slug, input.limit)),
  }),

  // ── Most Read ────────────────────────────────────────────────────────────────
  mostRead: router({
    list: publicProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(({ input }) => getMostReadArticles(input?.limit)),
  }),

  // ── Newsletter ───────────────────────────────────────────────────────────────
  newsletter: router({
    subscribe: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(({ input }) => subscribeNewsletter(input.email)),
  }),

  // ── Citizen Reports — "Muhabirimiz Ol" ───────────────────────────────────
  citizenReports: router({
    submit: publicProcedure
      .input(
        z.object({
          name: z.string().min(2).max(200),
          email: z.string().email(),
          phone: z.string().max(50).optional(),
          title: z.string().min(5).max(500),
          content: z.string().min(20),
          location: z.string().max(200).optional(),
          imageUrl: z.string().optional(),
        })
      )
      .mutation(({ input }) => submitCitizenReport(input)),
    list: publicProcedure
      .input(z.object({ status: z.string().optional() }).optional())
      .query(({ input }) => listCitizenReports(input?.status)),
  }),

  // ── Newspaper Issues ─────────────────────────────────────────────────────
  newspaperIssues: router({
    list: publicProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(({ input }) => listNewspaperIssues(input?.limit)),
    latest: publicProcedure.query(() => getLatestNewspaperIssue()),
  }),

  // ── Comments ─────────────────────────────────────────────────────────────
  comments: router({
    submit: publicProcedure
      .input(
        z.object({
          articleId: z.number(),
          authorName: z.string().min(2).max(200),
          authorEmail: z.string().email(),
          content: z.string().min(2).max(2000),
        })
      )
      .mutation(({ input }) => submitComment(input)),
    byArticle: publicProcedure
      .input(z.object({ articleId: z.number() }))
      .query(({ input }) => getCommentsByArticle(input.articleId)),
  }),
});

export type AppRouter = typeof appRouter;
