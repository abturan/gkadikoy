export const ENV = {
  appId: process.env.VITE_APP_ID ?? "gazete-kadikoy",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  adminEmail: process.env.ADMIN_EMAIL ?? "admin@gazetekadikoy.com.tr",
  adminPassword: process.env.ADMIN_PASSWORD ?? "",
  openaiApiKey: process.env.OPENAI_API_KEY ?? "",
  uploadsDir: process.env.UPLOADS_DIR ?? "./storage/uploads",
};
