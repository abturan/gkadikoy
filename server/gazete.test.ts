import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("categories router", () => {
  it("lists all categories", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const categories = await caller.categories.list();
    expect(Array.isArray(categories)).toBe(true);
  });

  it("returns category by slug", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const cat = await caller.categories.bySlug({ slug: "gundem" });
    expect(cat === undefined || typeof cat === "object").toBe(true);
  });
});

describe("articles router", () => {
  it("returns latest articles", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const articles = await caller.articles.latest({ limit: 5 });
    expect(Array.isArray(articles)).toBe(true);
  });

  it("returns featured articles", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const articles = await caller.articles.featured({ limit: 3 });
    expect(Array.isArray(articles)).toBe(true);
  });

  it("returns breaking news", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const articles = await caller.articles.breaking({ limit: 5 });
    expect(Array.isArray(articles)).toBe(true);
  });

  it("searches articles", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const results = await caller.articles.search({
      query: "Kadıköy",
      limit: 5,
    });
    expect(Array.isArray(results)).toBe(true);
  });
});

describe("authors router", () => {
  it("lists authors", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const authors = await caller.authors.list();
    expect(Array.isArray(authors)).toBe(true);
  });
});

describe("events router", () => {
  it("returns upcoming events", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const events = await caller.events.upcoming({ limit: 5 });
    expect(Array.isArray(events)).toBe(true);
  });

  it("returns all events", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const events = await caller.events.all({ limit: 10 });
    expect(Array.isArray(events)).toBe(true);
  });
});

describe("photo galleries router", () => {
  it("lists photo galleries", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const galleries = await caller.photoGalleries.list({ limit: 5 });
    expect(Array.isArray(galleries)).toBe(true);
  });
});

describe("video galleries router", () => {
  it("lists video galleries", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const videos = await caller.videoGalleries.list({ limit: 5 });
    expect(Array.isArray(videos)).toBe(true);
  });
});

describe("tags router", () => {
  it("lists all tags", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const tags = await caller.tags.list();
    expect(Array.isArray(tags)).toBe(true);
  });

  it("returns tags by article id", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const tags = await caller.tags.byArticle({ articleId: 1 });
    expect(Array.isArray(tags)).toBe(true);
  });
});

describe("most read router", () => {
  it("returns most read articles", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const articles = await caller.mostRead.list({ limit: 5 });
    expect(Array.isArray(articles)).toBe(true);
  });
});

describe("newsletter router", () => {
  it("subscribes with valid email", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.newsletter.subscribe({
      email: `test${Date.now()}@example.com`,
    });
    expect(typeof result).toBe("boolean");
  });
});

describe("auth router", () => {
  it("returns null user for unauthenticated request", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const user = await caller.auth.me();
    expect(user).toBeNull();
  });
});
