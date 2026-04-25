import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import dotenv from "dotenv";
import { tags, articleTags } from "./drizzle/schema";

dotenv.config();

async function seedTags() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
  const db = drizzle(pool);

  // Etiketler
  const tagData = [
    { name: "Kadıköy", slug: "kadikoy" },
    { name: "Belediye", slug: "belediye" },
    { name: "Ulaşım", slug: "ulasim" },
    { name: "Kentsel Dönüşüm", slug: "kentsel-donusum" },
    { name: "Çevre Kirliliği", slug: "cevre-kirliligi" },
    { name: "Yeşil Alan", slug: "yesil-alan" },
    { name: "Eğitim", slug: "egitim" },
    { name: "Sağlık", slug: "saglik" },
    { name: "Kültür", slug: "kultur" },
    { name: "Spor", slug: "spor" },
    { name: "Festival", slug: "festival" },
    { name: "Moda", slug: "moda" },
    { name: "Yeldeğirmeni", slug: "yeldegirmeni" },
    { name: "Caferağa", slug: "caferaga" },
    { name: "Bahariye", slug: "bahariye" },
    { name: "Fenerbahçe", slug: "fenerbahce" },
    { name: "Tarihi Yarımada", slug: "tarihi-yarimada" },
    { name: "Deniz", slug: "deniz" },
    { name: "Gastronomi", slug: "gastronomi" },
    { name: "Sokak Sanatı", slug: "sokak-sanati" },
  ];

  await db.insert(tags).values(tagData);
  console.log(`✅ ${tagData.length} etiket eklendi`);

  // Her habere rastgele 2-4 etiket ata
  const articleTagData: { articleId: number; tagId: number }[] = [];
  for (let articleId = 1; articleId <= 42; articleId++) {
    const numTags = 2 + Math.floor(Math.random() * 3);
    const usedTags = new Set<number>();
    for (let i = 0; i < numTags; i++) {
      let tagId: number;
      do {
        tagId = 1 + Math.floor(Math.random() * tagData.length);
      } while (usedTags.has(tagId));
      usedTags.add(tagId);
      articleTagData.push({ articleId, tagId });
    }
  }

  // Batch insert
  for (let i = 0; i < articleTagData.length; i += 50) {
    const batch = articleTagData.slice(i, i + 50);
    await db.insert(articleTags).values(batch);
  }
  console.log(`✅ ${articleTagData.length} haber-etiket ilişkisi eklendi`);

  process.exit(0);
}

seedTags().catch((e) => {
  console.error(e);
  process.exit(1);
});
