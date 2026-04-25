import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { publicProcedure, router, staffProcedure, adminProcedure } from "./_core/trpc";
import { hashPassword, loginWithPassword } from "./_core/auth";
import { sdk } from "./_core/sdk";
import {
  adminCreateArticle,
  adminCreateIssue,
  adminCreateStaffUser,
  adminDashboardStats,
  adminDeleteArticle,
  adminDeleteComment,
  adminDeleteIssue,
  adminDeleteReport,
  adminDeleteUser,
  adminGetArticle,
  adminGetReport,
  adminListArticles,
  adminListAuditLogs,
  adminListComments,
  adminListUsers,
  adminUpdateArticle,
  adminUpdateCommentStatus,
  adminUpdateReportStatus,
  adminUpdateUser,
  listCitizenReports,
  writeAuditLog,
} from "./db";
import { generateSlug, isOpenAIEnabled, reviseText, suggestSummary, suggestTitles } from "./_core/openai";
import { saveUpload } from "./_core/upload";

export const adminRouter = router({
  // ─── Auth ──────────────────────────────────────────────────────────────
  login: publicProcedure
    .input(z.object({ email: z.string().email(), password: z.string().min(4) }))
    .mutation(async ({ input, ctx }) => {
      const user = await loginWithPassword(input.email, input.password);
      if (!user) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "E-posta veya şifre hatalı." });
      }
      if (user.role === "user") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Yetkiniz yok." });
      }

      const token = await sdk.createSessionToken(user.openId, {
        name: user.name ?? "",
        expiresInMs: 30 * 24 * 60 * 60 * 1000, // 30 gün
      });

      ctx.res.cookie(COOKIE_NAME, token, {
        ...getSessionCookieOptions(ctx.req),
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };
    }),

  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return { success: true };
  }),

  me: publicProcedure.query(({ ctx }) => {
    if (!ctx.user) return null;
    const role = ctx.user.role;
    if (role !== "admin" && role !== "editor" && role !== "moderator") return null;
    return {
      id: ctx.user.id,
      email: ctx.user.email,
      name: ctx.user.name,
      role: ctx.user.role,
    };
  }),

  // ─── Dashboard ──────────────────────────────────────────────────────────
  stats: staffProcedure.query(() => adminDashboardStats()),

  // ─── Articles ───────────────────────────────────────────────────────────
  articles: router({
    list: staffProcedure
      .input(
        z
          .object({
            search: z.string().optional(),
            categoryId: z.number().optional(),
            limit: z.number().optional(),
            offset: z.number().optional(),
          })
          .optional()
      )
      .query(({ input }) => adminListArticles(input)),

    get: staffProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => adminGetArticle(input.id)),

    create: staffProcedure
      .input(
        z.object({
          title: z.string().min(3).max(500),
          slug: z.string().optional(),
          summary: z.string().nullable().optional(),
          content: z.string().min(10),
          imageUrl: z.string().nullable().optional(),
          categoryId: z.number(),
          authorId: z.number().nullable().optional(),
          isFeatured: z.boolean().optional(),
          isBreaking: z.boolean().optional(),
          publishedAt: z.date().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const slug = input.slug?.trim() || generateSlug(input.title);
        const created = await adminCreateArticle({
          title: input.title,
          slug,
          summary: input.summary ?? null,
          content: input.content,
          imageUrl: input.imageUrl ?? null,
          categoryId: input.categoryId,
          authorId: input.authorId ?? null,
          isFeatured: input.isFeatured ?? false,
          isBreaking: input.isBreaking ?? false,
          publishedAt: input.publishedAt ?? new Date(),
        });

        if (created) {
          await writeAuditLog({
            userId: ctx.user.id,
            userName: ctx.user.name ?? ctx.user.email ?? "bilinmeyen",
            action: "article.create",
            targetType: "article",
            targetId: created.id,
            details: created.title,
          });
        }

        return created;
      }),

    update: staffProcedure
      .input(
        z.object({
          id: z.number(),
          data: z
            .object({
              title: z.string().optional(),
              slug: z.string().optional(),
              summary: z.string().nullable().optional(),
              content: z.string().optional(),
              imageUrl: z.string().nullable().optional(),
              categoryId: z.number().optional(),
              authorId: z.number().nullable().optional(),
              isFeatured: z.boolean().optional(),
              isBreaking: z.boolean().optional(),
              publishedAt: z.date().optional(),
            })
            .partial(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const updated = await adminUpdateArticle(input.id, input.data as any);
        await writeAuditLog({
          userId: ctx.user.id,
          userName: ctx.user.name ?? ctx.user.email ?? "bilinmeyen",
          action: "article.update",
          targetType: "article",
          targetId: input.id,
        });
        return updated;
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const ok = await adminDeleteArticle(input.id);
        await writeAuditLog({
          userId: ctx.user.id,
          userName: ctx.user.name ?? ctx.user.email ?? "bilinmeyen",
          action: "article.delete",
          targetType: "article",
          targetId: input.id,
        });
        return ok;
      }),
  }),

  // ─── Comments moderation ──────────────────────────────────────────────
  comments: router({
    list: staffProcedure
      .input(z.object({ status: z.string().optional() }).optional())
      .query(({ input }) => adminListComments(input?.status)),

    setStatus: staffProcedure
      .input(z.object({ id: z.number(), status: z.enum(["approved", "rejected", "pending"]) }))
      .mutation(async ({ input, ctx }) => {
        const ok = await adminUpdateCommentStatus(input.id, input.status);
        await writeAuditLog({
          userId: ctx.user.id,
          userName: ctx.user.name ?? ctx.user.email ?? "bilinmeyen",
          action: `comment.${input.status}`,
          targetType: "comment",
          targetId: input.id,
        });
        return ok;
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const ok = await adminDeleteComment(input.id);
        await writeAuditLog({
          userId: ctx.user.id,
          userName: ctx.user.name ?? ctx.user.email ?? "bilinmeyen",
          action: "comment.delete",
          targetType: "comment",
          targetId: input.id,
        });
        return ok;
      }),
  }),

  // ─── Citizen reports ──────────────────────────────────────────────────
  reports: router({
    list: staffProcedure
      .input(z.object({ status: z.string().optional() }).optional())
      .query(({ input }) => listCitizenReports(input?.status)),

    get: staffProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => adminGetReport(input.id)),

    setStatus: staffProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["pending", "approved", "rejected", "published"]),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const ok = await adminUpdateReportStatus(input.id, input.status, input.notes);
        await writeAuditLog({
          userId: ctx.user.id,
          userName: ctx.user.name ?? ctx.user.email ?? "bilinmeyen",
          action: `report.${input.status}`,
          targetType: "report",
          targetId: input.id,
        });
        return ok;
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const ok = await adminDeleteReport(input.id);
        await writeAuditLog({
          userId: ctx.user.id,
          userName: ctx.user.name ?? ctx.user.email ?? "bilinmeyen",
          action: "report.delete",
          targetType: "report",
          targetId: input.id,
        });
        return ok;
      }),

    publishAsArticle: staffProcedure
      .input(
        z.object({
          reportId: z.number(),
          categoryId: z.number(),
          title: z.string(),
          content: z.string(),
          summary: z.string().optional(),
          imageUrl: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const slug = generateSlug(input.title);
        const article = await adminCreateArticle({
          title: input.title,
          slug,
          summary: input.summary ?? null,
          content: input.content,
          imageUrl: input.imageUrl ?? null,
          categoryId: input.categoryId,
          publishedAt: new Date(),
        });
        if (article) {
          await adminUpdateReportStatus(input.reportId, "published");
          await writeAuditLog({
            userId: ctx.user.id,
            userName: ctx.user.name ?? ctx.user.email ?? "bilinmeyen",
            action: "report.publish",
            targetType: "report",
            targetId: input.reportId,
            details: `→ article #${article.id}`,
          });
        }
        return article;
      }),
  }),

  // ─── Users ─────────────────────────────────────────────────────────────
  users: router({
    list: adminProcedure.query(() => adminListUsers()),

    create: adminProcedure
      .input(
        z.object({
          email: z.string().email(),
          name: z.string().min(2),
          password: z.string().min(6),
          role: z.enum(["admin", "editor", "moderator"]),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const passwordHash = await hashPassword(input.password);
        const openId = `local_${nanoid(12)}`;
        const created = await adminCreateStaffUser({
          openId,
          email: input.email.toLowerCase().trim(),
          name: input.name,
          role: input.role,
          passwordHash,
        });
        if (created) {
          await writeAuditLog({
            userId: ctx.user.id,
            userName: ctx.user.name ?? ctx.user.email ?? "bilinmeyen",
            action: "user.create",
            targetType: "user",
            targetId: created.id,
            details: `${created.email} (${created.role})`,
          });
        }
        return created;
      }),

    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          data: z.object({
            name: z.string().optional(),
            email: z.string().email().optional(),
            role: z.enum(["user", "admin", "editor", "moderator"]).optional(),
            active: z.boolean().optional(),
            password: z.string().min(6).optional(),
          }),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const data: any = { ...input.data };
        if (data.password) {
          data.passwordHash = await hashPassword(data.password);
          delete data.password;
        }
        const updated = await adminUpdateUser(input.id, data);
        await writeAuditLog({
          userId: ctx.user.id,
          userName: ctx.user.name ?? ctx.user.email ?? "bilinmeyen",
          action: "user.update",
          targetType: "user",
          targetId: input.id,
        });
        return updated;
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.id === input.id) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Kendi hesabınızı silemezsiniz." });
        }
        const ok = await adminDeleteUser(input.id);
        await writeAuditLog({
          userId: ctx.user.id,
          userName: ctx.user.name ?? ctx.user.email ?? "bilinmeyen",
          action: "user.delete",
          targetType: "user",
          targetId: input.id,
        });
        return ok;
      }),
  }),

  // ─── Newspaper issues ──────────────────────────────────────────────────
  issues: router({
    create: staffProcedure
      .input(
        z.object({
          issueNumber: z.number(),
          title: z.string().optional(),
          coverImageUrl: z.string(),
          pdfUrl: z.string(),
          publishDate: z.date(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const created = await adminCreateIssue(input);
        if (created) {
          await writeAuditLog({
            userId: ctx.user.id,
            userName: ctx.user.name ?? ctx.user.email ?? "bilinmeyen",
            action: "issue.create",
            targetType: "issue",
            targetId: created.id,
            details: `Sayı ${created.issueNumber}`,
          });
        }
        return created;
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const ok = await adminDeleteIssue(input.id);
        await writeAuditLog({
          userId: ctx.user.id,
          userName: ctx.user.name ?? ctx.user.email ?? "bilinmeyen",
          action: "issue.delete",
          targetType: "issue",
          targetId: input.id,
        });
        return ok;
      }),
  }),

  // ─── Audit logs ────────────────────────────────────────────────────────
  auditLogs: adminProcedure.query(() => adminListAuditLogs(200)),

  // ─── File upload (base64) ───────────────────────────────────────────────
  upload: staffProcedure
    .input(
      z.object({
        dataUrl: z.string(),
        folder: z.enum(["articles", "issues", "avatars", "general"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await saveUpload(input.dataUrl, { folder: input.folder ?? "general" });
        if (!result) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Geçersiz dosya." });
        }
        return { url: result.url };
      } catch (err: any) {
        throw new TRPCError({ code: "BAD_REQUEST", message: err?.message ?? "Yükleme başarısız." });
      }
    }),

  // ─── OpenAI helpers ────────────────────────────────────────────────────
  ai: router({
    available: publicProcedure.query(() => ({ enabled: isOpenAIEnabled() })),

    revise: staffProcedure
      .input(
        z.object({
          text: z.string().min(10),
          tone: z.enum(["neutral", "warm", "formal"]).optional(),
          keepLength: z.boolean().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (!isOpenAIEnabled()) {
          throw new TRPCError({ code: "PRECONDITION_FAILED", message: "OpenAI ayarlı değil. OPENAI_API_KEY ekleyin." });
        }
        const result = await reviseText(input.text, { tone: input.tone, keepLength: input.keepLength });
        if (!result) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Düzeltme başarısız." });
        }
        await writeAuditLog({
          userId: ctx.user.id,
          userName: ctx.user.name ?? ctx.user.email ?? "bilinmeyen",
          action: "ai.revise",
        });
        return result;
      }),

    suggestTitles: staffProcedure
      .input(z.object({ content: z.string().min(50) }))
      .mutation(async ({ input }) => {
        if (!isOpenAIEnabled()) {
          throw new TRPCError({ code: "PRECONDITION_FAILED", message: "OpenAI ayarlı değil." });
        }
        const titles = await suggestTitles(input.content);
        return titles ?? [];
      }),

    suggestSummary: staffProcedure
      .input(z.object({ content: z.string().min(50) }))
      .mutation(async ({ input }) => {
        if (!isOpenAIEnabled()) {
          throw new TRPCError({ code: "PRECONDITION_FAILED", message: "OpenAI ayarlı değil." });
        }
        const summary = await suggestSummary(input.content);
        return summary ?? "";
      }),
  }),
});
