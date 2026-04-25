import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

// Import tables
const { categories, authors, articles, photoGalleries, galleryPhotos, videoGalleries, events } =
  await import("./drizzle/schema.ts").catch(() =>
    import("./drizzle/schema.js")
  );

console.log("🌱 Seeding database...");

// ── Categories ──────────────────────────────────────────────────────────────
await db.insert(categories).values([
  { name: "Gündem", slug: "gundem", color: "#EF4444" },
  { name: "Yaşam", slug: "yasam", color: "#10B981" },
  { name: "Kültür Sanat", slug: "kultur-sanat", color: "#8B5CF6" },
  { name: "Çevre", slug: "cevre", color: "#059669" },
  { name: "Sağlık", slug: "saglik", color: "#3B82F6" },
  { name: "Spor", slug: "spor", color: "#F97316" },
  { name: "Eğitim", slug: "egitim", color: "#F59E0B" },
]).onConflictDoNothing();

console.log("✅ Categories seeded");

// ── Authors ─────────────────────────────────────────────────────────────────
await db.insert(authors).values([
  {
    name: "Ferhat Uludere",
    bio: "Kadıköy'ün sokak kültürünü ve kentsel dönüşümünü kaleme alan bağımsız gazeteci.",
    avatarUrl: "https://i.pravatar.cc/150?img=1",
    email: "ferhat@gazetekadikoy.com.tr",
  },
  {
    name: "Pınar Erkan",
    bio: "Çevre haberciliği ve sürdürülebilirlik alanında uzmanlaşmış gazeteci.",
    avatarUrl: "https://i.pravatar.cc/150?img=5",
    email: "pinar@gazetekadikoy.com.tr",
  },
  {
    name: "Nükhet Eren",
    bio: "Kültür-sanat yazarı, tiyatro ve edebiyat eleştirmeni.",
    avatarUrl: "https://i.pravatar.cc/150?img=9",
    email: "nukhet@gazetekadikoy.com.tr",
  },
  {
    name: "Mert Demir",
    bio: "Spor muhabiri, özellikle Kadıköy'deki yerel spor kulüplerini takip ediyor.",
    avatarUrl: "https://i.pravatar.cc/150?img=12",
    email: "mert@gazetekadikoy.com.tr",
  },
  {
    name: "Zehra Çelenk",
    bio: "Eğitim habercisi, çocuk hakları ve okul politikaları üzerine yazıyor.",
    avatarUrl: "https://i.pravatar.cc/150?img=16",
    email: "zehra@gazetekadikoy.com.tr",
  },
]).onConflictDoNothing();

console.log("✅ Authors seeded");

// Fetch IDs
const cats = await db.select({ id: categories.id, slug: categories.slug }).from(categories);
const catMap = Object.fromEntries(cats.map((c) => [c.slug, c.id]));

const auths = await db.select({ id: authors.id, name: authors.name }).from(authors);
const authMap = Object.fromEntries(auths.map((a) => [a.name, a.id]));

// ── Articles ────────────────────────────────────────────────────────────────
const articleData = [
  // Gündem
  {
    title: "Yerebatan Sarnıcı Türk vatandaşlarına 1 TL",
    slug: "yerebatan-sarnici-turk-vatandaslarina-1-tl",
    summary: "İstanbul Büyükşehir Belediyesi'nin tarihi kararı Kadıköylüleri sevindirdi.",
    content: `<p>İstanbul Büyükşehir Belediyesi, tarihi Yerebatan Sarnıcı'na Türk vatandaşlarının 1 TL ile girebileceğini açıkladı. Bu karar, kültürel mirasın halka açılması adına önemli bir adım olarak değerlendiriliyor.</p><p>Kadıköy sakinleri bu kararı büyük bir memnuniyetle karşıladı. Özellikle çocuklu aileler ve öğrenciler için tarihi mekânlara erişimin kolaylaşması, kültürel farkındalığı artıracak.</p><p>Belediye yetkilileri, bu uygulamanın diğer tarihi mekânlara da yaygınlaştırılmasını planladıklarını belirtti. Söz konusu adım, İstanbul'un kültürel mirasını koruma ve yaşatma çabalarının bir parçası olarak değerlendiriliyor.</p>`,
    imageUrl: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&q=80",
    categoryId: catMap["gundem"],
    authorId: authMap["Ferhat Uludere"],
    isFeatured: true,
    isBreaking: true,
    publishedAt: new Date("2026-04-19T08:00:00"),
  },
  {
    title: "Eğitimde şiddete karşı ortak çağrı",
    slug: "egitimde-siddete-karsi-ortak-cagri",
    summary: "Kadıköy'deki eğitim kurumları okul şiddetine karşı ortak bildiri yayımladı.",
    content: `<p>Kadıköy'deki okul müdürleri ve öğretmen sendikaları, eğitimde şiddete karşı ortak bir bildiri yayımladı. Bildiri, okullarda güvenli bir öğrenme ortamının oluşturulması için acil önlemler alınmasını talep ediyor.</p><p>Bildiriye göre, son dönemde okullarda yaşanan şiddet olayları ciddi boyutlara ulaşmış durumda. Uzmanlar, bu durumun arkasında sosyoekonomik eşitsizlikler, aile içi sorunlar ve yetersiz psikolojik destek hizmetlerinin yattığını vurguluyor.</p><p>Kadıköy Belediyesi, okullarda görevlendirilecek sosyal hizmet uzmanları için ek kaynak ayıracağını açıkladı.</p>`,
    imageUrl: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80",
    categoryId: catMap["gundem"],
    authorId: authMap["Zehra Çelenk"],
    isFeatured: true,
    isBreaking: false,
    publishedAt: new Date("2026-04-18T10:00:00"),
  },
  {
    title: "Ataşehir Belediyesi'ne operasyon",
    slug: "atasehir-belediyesine-operasyon",
    summary: "Ataşehir Belediyesi'nde yolsuzluk iddialarıyla ilgili soruşturma başlatıldı.",
    content: `<p>Savcılık, Ataşehir Belediyesi'nde çeşitli yolsuzluk iddialarına ilişkin kapsamlı bir soruşturma başlattı. Operasyon kapsamında belediyenin üst düzey yöneticileri ifadeye çağrıldı.</p><p>İddialara göre, belediye ihalelerinde usulsüzlükler yapıldığı ve kamu kaynaklarının kötüye kullanıldığı öne sürülüyor. Soruşturma, bölge sakinleri arasında büyük yankı uyandırdı.</p><p>Belediye başkanlığı, söz konusu iddiaları kesinlikle reddederek tüm işlemlerin yasal çerçevede yürütüldüğünü açıkladı.</p>`,
    imageUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80",
    categoryId: catMap["gundem"],
    authorId: authMap["Ferhat Uludere"],
    isFeatured: false,
    isBreaking: true,
    publishedAt: new Date("2026-04-17T14:00:00"),
  },
  {
    title: "Kadıköy Belediyesi 42 yaşında",
    slug: "kadikoy-belediyesi-42-yasinda",
    summary: "Kadıköy Belediyesi kuruluşunun 42. yılını çeşitli etkinliklerle kutladı.",
    content: `<p>Kadıköy Belediyesi, kuruluşunun 42. yıl dönümünü coşkulu etkinliklerle kutladı. Meydan'da düzenlenen törende belediye başkanı, geçen yıl hayata geçirilen projeler hakkında kapsamlı bir sunum yaptı.</p><p>42 yıl boyunca Kadıköy'ün sosyal, kültürel ve fiziksel dönüşümüne öncülük eden belediye, bu süreçte yüzlerce proje hayata geçirdi. Parklar, kültür merkezleri ve sosyal hizmet birimleri bunların başında geliyor.</p>`,
    imageUrl: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80",
    categoryId: catMap["gundem"],
    authorId: authMap["Ferhat Uludere"],
    isFeatured: true,
    isBreaking: false,
    publishedAt: new Date("2026-04-16T09:00:00"),
  },
  // Yaşam
  {
    title: "Kadıköy'de 12 saatlik su kesintisi",
    slug: "kadikoy-12-saatlik-su-kesintisi",
    summary: "İSKİ'nin altyapı çalışmaları nedeniyle Kadıköy'de su kesintisi yaşanacak.",
    content: `<p>İstanbul Su ve Kanalizasyon İdaresi (İSKİ), Kadıköy'de gerçekleştirilecek altyapı yenileme çalışmaları kapsamında 12 saatlik su kesintisi uygulanacağını duyurdu.</p><p>Kesinti, sabah 08:00'den akşam 20:00'ye kadar sürecek. Etkilenen mahalleler arasında Moda, Fenerbahçe ve Bağlarbaşı yer alıyor. İSKİ, sakinlerin önceden su depolamasını tavsiye ediyor.</p><p>Bu çalışmaların tamamlanmasının ardından bölgedeki su basıncı ve kalitesinin önemli ölçüde artması bekleniyor.</p>`,
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    categoryId: catMap["yasam"],
    authorId: authMap["Pınar Erkan"],
    isFeatured: true,
    isBreaking: true,
    publishedAt: new Date("2026-04-19T07:00:00"),
  },
  {
    title: "Boğa Heykeli'nde çalışmalar tamamlandı",
    slug: "boga-heykelinde-calismalar-tamamlandi",
    summary: "Kadıköy'ün simgesi Boğa Heykeli restore edildi, yeniden ziyarete açıldı.",
    content: `<p>Kadıköy'ün simgesi haline gelen Boğa Heykeli, uzun süren restorasyon çalışmalarının tamamlanmasının ardından yeniden ziyarete açıldı. Heykel, orijinal dokusuna sadık kalınarak özenle restore edildi.</p><p>Restorasyon sürecinde heykelin yüzeyi temizlendi, çatlaklar giderildi ve koruyucu kaplama yenilendi. Çevre düzenlemesi de bu kapsamda yenilenerek daha ferah bir alan oluşturuldu.</p>`,
    imageUrl: "https://images.unsplash.com/photo-1555993539-1732b0258235?w=800&q=80",
    categoryId: catMap["yasam"],
    authorId: authMap["Ferhat Uludere"],
    isFeatured: false,
    isBreaking: false,
    publishedAt: new Date("2026-04-15T11:00:00"),
  },
  {
    title: "TESAK'ta Kadıköy'ün geçmişine yolculuk",
    slug: "tesak-kadikoy-gecmisine-yolculuk",
    summary: "TESAK'ta açılan sergi, Kadıköy'ün 100 yıllık tarihini fotoğraflarla anlatıyor.",
    content: `<p>Tarihi Eserler ve Sanat Araştırmaları Kulübü (TESAK), Kadıköy'ün geçmişini anlatan kapsamlı bir fotoğraf sergisi düzenledi. Sergi, ilçenin 100 yıllık tarihini nadir arşiv fotoğraflarıyla gözler önüne seriyor.</p><p>Sergide, Kadıköy'ün 1920'lerden günümüze uzanan dönüşümü, eski çarşı yapıları, geleneksel meslekler ve mahalle yaşamı belgeleniyor. Ziyaretçiler, tanıdık mekânların nasıl değiştiğini görerek nostaljik bir yolculuğa çıkıyor.</p>`,
    imageUrl: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&q=80",
    categoryId: catMap["yasam"],
    authorId: authMap["Nükhet Eren"],
    isFeatured: false,
    isBreaking: false,
    publishedAt: new Date("2026-04-14T13:00:00"),
  },
  // Kültür Sanat
  {
    title: "Marcel Schwob: Hayali Hayatlar",
    slug: "marcel-schwob-hayali-hayatlar",
    summary: "Fransız yazar Marcel Schwob'un eserleri Kadıköy'de sergileniyor.",
    content: `<p>Fransız sembolist yazar Marcel Schwob'un "Hayali Hayatlar" adlı başyapıtı, Kadıköy Kültür Merkezi'nde düzenlenen özel bir sergiyle okuyucularla buluşuyor. Sergi, Schwob'un yaşamını ve edebi dünyasını görsel bir dille aktarıyor.</p><p>Etkinlik kapsamında yazarın eserleri üzerine panel tartışmaları ve söyleşiler de düzenlenecek. Edebiyat severler için kaçırılmaz bir fırsat olan bu sergi, 30 Nisan'a kadar ziyarete açık olacak.</p>`,
    imageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80",
    categoryId: catMap["kultur-sanat"],
    authorId: authMap["Nükhet Eren"],
    isFeatured: true,
    isBreaking: false,
    publishedAt: new Date("2026-04-18T09:00:00"),
  },
  {
    title: '"blueScat" Moda Sahnesi\'nde',
    slug: "bluescat-moda-sahnesinde",
    summary: "Yerli caz grubu blueScat, Moda Sahnesi'nde unutulmaz bir gece sundu.",
    content: `<p>Yerli caz grubu blueScat, Moda Sahnesi'nde verdiği konserle müzikseverlere unutulmaz bir gece yaşattı. Grup, özgün besteleri ve doğaçlama performanslarıyla büyük beğeni topladı.</p><p>Konser, geleneksel caz formlarını modern elektronik unsurlarla harmanlayan özgün bir ses dünyası sundu. Seyirciler, grubun enerjik sahne performansını ayakta alkışladı.</p>`,
    imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80",
    categoryId: catMap["kultur-sanat"],
    authorId: authMap["Nükhet Eren"],
    isFeatured: true,
    isBreaking: false,
    publishedAt: new Date("2026-04-17T16:00:00"),
  },
  {
    title: "Kelimelerin izinde yolculuk: Nerden Geliyo?",
    slug: "kelimelerin-izinde-yolculuk-nerden-geliyo",
    summary: "Dil ve etimoloji üzerine düzenlenen etkinlik büyük ilgi gördü.",
    content: `<p>"Nerden Geliyo?" adlı dil ve etimoloji etkinliği, Kadıköy'de büyük ilgi gördü. Dilbilimciler ve edebiyatçıların bir araya geldiği bu etkinlikte, Türkçe kelimelerin kökleri ve tarihi yolculukları ele alındı.</p><p>Katılımcılar, günlük hayatta kullandıkları kelimelerin ne kadar zengin bir tarihe sahip olduğunu keşfetti. Etkinlik, dil farkındalığını artırma açısından son derece değerli bir katkı sağladı.</p>`,
    imageUrl: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80",
    categoryId: catMap["kultur-sanat"],
    authorId: authMap["Nükhet Eren"],
    isFeatured: false,
    isBreaking: false,
    publishedAt: new Date("2026-04-13T10:00:00"),
  },
  // Çevre
  {
    title: "Koşuyolu Kalp Hastanesi için özelleştirme alarmı",
    slug: "kosuyolu-kalp-hastanesi-ozellestirme-alarmi",
    summary: "Koşuyolu Kalp Hastanesi'nin özelleştirilmesi planına karşı tepkiler büyüyor.",
    content: `<p>Koşuyolu Kalp ve Araştırma Hastanesi'nin özelleştirilmesi planına karşı sağlık çalışanları ve sivil toplum kuruluşları güçlü bir muhalefet cephesi oluşturdu. Hastane önünde düzenlenen eylemde yüzlerce kişi bir araya geldi.</p><p>Katılımcılar, hastanenin kamu hizmeti niteliğini koruması gerektiğini vurgulayarak özelleştirme planının geri çekilmesini talep etti. Sağlık çalışanları, özelleştirmenin hizmet kalitesini düşüreceği ve erişimi zorlaştıracağı konusundaki kaygılarını dile getirdi.</p>`,
    imageUrl: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80",
    categoryId: catMap["cevre"],
    authorId: authMap["Pınar Erkan"],
    isFeatured: false,
    isBreaking: false,
    publishedAt: new Date("2026-04-16T12:00:00"),
  },
  {
    title: "Türkiye hava kirliliğinde 28 sıra yükseldi",
    slug: "turkiye-hava-kirliligi-28-sira-yukseldi",
    summary: "Uluslararası rapor, Türkiye'nin hava kirliliği sıralamasındaki yükselişini ortaya koydu.",
    content: `<p>Uluslararası Hava Kalitesi Endeksi'nin son raporuna göre Türkiye, hava kirliliği sıralamasında 28 basamak birden yükseldi. Bu durum, çevre örgütleri tarafından ciddi bir uyarı işareti olarak değerlendiriliyor.</p><p>Rapor, özellikle büyük şehirlerdeki partikül madde (PM2.5) konsantrasyonlarının Dünya Sağlık Örgütü sınır değerlerini aştığını ortaya koyuyor. İstanbul'un bu listede üst sıralarda yer alması dikkat çekiyor.</p>`,
    imageUrl: "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800&q=80",
    categoryId: catMap["cevre"],
    authorId: authMap["Pınar Erkan"],
    isFeatured: true,
    isBreaking: false,
    publishedAt: new Date("2026-04-15T08:00:00"),
  },
  // Sağlık
  {
    title: "Bahar alerjisine dikkat",
    slug: "bahar-alerjisine-dikkat",
    summary: "Uzmanlar, bahar aylarında artan alerji vakalarına karşı uyarıda bulunuyor.",
    content: `<p>Bahar mevsiminin gelmesiyle birlikte alerji vakalarında belirgin bir artış gözlemleniyor. Uzmanlar, özellikle çiçeklenme döneminde dışarıda geçirilen süreyi sınırlandırmanın önemine dikkat çekiyor.</p><p>Kadıköy'deki sağlık merkezlerine başvuran alerji hastalarının sayısının geçen yıla kıyasla yüzde 30 arttığı belirtiliyor. Doktorlar, belirtilerin şiddetlenmesi durumunda mutlaka bir uzmana başvurulmasını tavsiye ediyor.</p>`,
    imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80",
    categoryId: catMap["saglik"],
    authorId: authMap["Pınar Erkan"],
    isFeatured: true,
    isBreaking: false,
    publishedAt: new Date("2026-04-19T06:00:00"),
  },
  {
    title: "Ultra işlenmiş gıdalar sağlığı tehdit ediyor",
    slug: "ultra-islenmis-gidalar-sagligi-tehdit-ediyor",
    summary: "Yeni araştırma, ultra işlenmiş gıdaların kronik hastalık riskini artırdığını ortaya koydu.",
    content: `<p>Uluslararası bir araştırma ekibinin yürüttüğü kapsamlı çalışma, ultra işlenmiş gıdaların düzenli tüketiminin kalp hastalıkları, diyabet ve bazı kanser türleri riskini önemli ölçüde artırdığını ortaya koydu.</p><p>Araştırmacılar, günlük kalori alımının yüzde 20'sinden fazlasının ultra işlenmiş gıdalardan karşılanması durumunda sağlık risklerinin belirgin biçimde yükseldiğini saptadı. Uzmanlar, taze ve doğal gıdaların tercih edilmesini öneriyor.</p>`,
    imageUrl: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80",
    categoryId: catMap["saglik"],
    authorId: authMap["Pınar Erkan"],
    isFeatured: false,
    isBreaking: false,
    publishedAt: new Date("2026-04-14T09:00:00"),
  },
  // Spor
  {
    title: '"Engel olma yeter"',
    slug: "engel-olma-yeter",
    summary: "Engelli sporcular, erişilebilir spor tesisleri için farkındalık yürüyüşü düzenledi.",
    content: `<p>Kadıköy'deki engelli sporcular ve destekçileri, erişilebilir spor tesisleri talep etmek amacıyla "Engel Olma Yeter" sloganıyla bir farkındalık yürüyüşü düzenledi. Yürüyüşe yüzlerce kişi katıldı.</p><p>Katılımcılar, mevcut spor tesislerinin büyük çoğunluğunun engelli bireylerin kullanımına uygun olmadığını vurguladı. Belediyeye sunulan dilekçede, tüm spor alanlarının erişilebilir hale getirilmesi talep edildi.</p>`,
    imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80",
    categoryId: catMap["spor"],
    authorId: authMap["Mert Demir"],
    isFeatured: false,
    isBreaking: false,
    publishedAt: new Date("2026-04-17T11:00:00"),
  },
  {
    title: "23 Nisan'da basketbol heyecanı",
    slug: "23-nisanda-basketbol-heyecani",
    summary: "Kadıköy'de 23 Nisan kutlamaları kapsamında gençler arası basketbol turnuvası düzenlendi.",
    content: `<p>Kadıköy Belediyesi, 23 Nisan Ulusal Egemenlik ve Çocuk Bayramı kapsamında gençler arası bir basketbol turnuvası düzenledi. Turnuvaya 16 takım katılırken, final maçı büyük bir heyecanla izlendi.</p><p>Genç sporcular, hem yeteneklerini sergileme hem de takım ruhu geliştirme fırsatı buldu. Belediye başkanı, sporu toplumsal bütünleşmenin en güçlü araçlarından biri olarak nitelendirdi.</p>`,
    imageUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80",
    categoryId: catMap["spor"],
    authorId: authMap["Mert Demir"],
    isFeatured: false,
    isBreaking: false,
    publishedAt: new Date("2026-04-23T10:00:00"),
  },
  // Eğitim
  {
    title: "Eğitim için birlikte mücadele çağrısı",
    slug: "egitim-icin-birlikte-mucadele-cagrisi",
    summary: "Öğretmen sendikaları, eğitimde eşit fırsat için birlikte mücadele çağrısı yaptı.",
    content: `<p>Kadıköy'deki öğretmen sendikaları, eğitimde eşit fırsat ve nitelikli eğitim için ortak bir mücadele çağrısında bulundu. Düzenlenen basın toplantısında, eğitim sistemindeki sorunlar ve çözüm önerileri ele alındı.</p><p>Sendika temsilcileri, özellikle dezavantajlı bölgelerdeki okullara yönelik kaynak dağılımındaki eşitsizliğe dikkat çekti. Eğitim bütçesinin artırılması ve öğretmen istihdamının güçlendirilmesi talepleri ön plana çıktı.</p>`,
    imageUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80",
    categoryId: catMap["egitim"],
    authorId: authMap["Zehra Çelenk"],
    isFeatured: false,
    isBreaking: false,
    publishedAt: new Date("2026-04-16T10:00:00"),
  },
  {
    title: "Çocuk yuvalarında 'Anne Destek Programı' başladı",
    slug: "cocuk-yuvalarinda-anne-destek-programi-basladi",
    summary: "Kadıköy Belediyesi, çocuk yuvalarında annelere yönelik destek programı başlattı.",
    content: `<p>Kadıköy Belediyesi, ilçedeki çocuk yuvalarında "Anne Destek Programı"nı hayata geçirdi. Program, 0-6 yaş arası çocukların annelerine ebeveynlik becerileri, çocuk gelişimi ve psikolojik destek konularında eğitim sunuyor.</p><p>Program kapsamında haftalık gruplar oluşturulacak, uzman psikologlar ve çocuk gelişim uzmanları annelere rehberlik edecek. Programa kayıt yaptırmak isteyen aileler belediyenin web sitesi üzerinden başvurabilir.</p>`,
    imageUrl: "https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=800&q=80",
    categoryId: catMap["egitim"],
    authorId: authMap["Zehra Çelenk"],
    isFeatured: false,
    isBreaking: false,
    publishedAt: new Date("2026-04-12T09:00:00"),
  },
];

for (const article of articleData) {
  await db.insert(articles).values(article).onConflictDoNothing();
}
console.log("✅ Articles seeded");

// ── Photo Galleries ─────────────────────────────────────────────────────────
await db.insert(photoGalleries).values([
  {
    title: "Kalamış'ta ve Özgürlük'te keyifli bir yaz",
    slug: "kalamis-ozgurluk-keyifli-yaz",
    description: "Kadıköy'ün sahil şeridinde yaz mevsiminin en güzel anları.",
    coverImageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
    publishedAt: new Date("2026-04-10T10:00:00"),
  },
  {
    title: "Kadıköy bostanlarında hasat zamanı",
    slug: "kadikoy-bostanlarinda-hasat-zamani",
    description: "Kentsel tarım projesinin meyvelerini toplama zamanı geldi.",
    coverImageUrl: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80",
    publishedAt: new Date("2026-04-08T10:00:00"),
  },
  {
    title: "Kadıköy Çevre Festivali",
    slug: "kadikoy-cevre-festivali",
    description: "Sürdürülebilir yaşam ve çevre bilincini ön plana çıkaran festival.",
    coverImageUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80",
    publishedAt: new Date("2026-04-05T10:00:00"),
  },
  {
    title: "Dünden bugüne Kız Kulesi",
    slug: "dunden-bugune-kiz-kulesi",
    description: "İstanbul'un simgesi Kız Kulesi'nin tarihi ve bugünü.",
    coverImageUrl: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&q=80",
    publishedAt: new Date("2026-04-01T10:00:00"),
  },
  {
    title: "Moda Sahili'nde gün batımı",
    slug: "moda-sahilinde-gun-batimi",
    description: "Moda Sahili'nden büyüleyici gün batımı fotoğrafları.",
    coverImageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    publishedAt: new Date("2026-03-28T10:00:00"),
  },
]).onConflictDoNothing();

console.log("✅ Photo galleries seeded");

// ── Gallery Photos ──────────────────────────────────────────────────────────
const gals = await db.select({ id: photoGalleries.id, slug: photoGalleries.slug }).from(photoGalleries);
const galMap = Object.fromEntries(gals.map((g) => [g.slug, g.id]));

const photoData = [
  { galleryId: galMap["kalamis-ozgurluk-keyifli-yaz"], imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80", caption: "Kalamış Sahili", order: 1 },
  { galleryId: galMap["kalamis-ozgurluk-keyifli-yaz"], imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", caption: "Gün batımı", order: 2 },
  { galleryId: galMap["kalamis-ozgurluk-keyifli-yaz"], imageUrl: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&q=80", caption: "Sahil keyfi", order: 3 },
  { galleryId: galMap["kadikoy-bostanlarinda-hasat-zamani"], imageUrl: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80", caption: "Sebze hasadı", order: 1 },
  { galleryId: galMap["kadikoy-bostanlarinda-hasat-zamani"], imageUrl: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&q=80", caption: "Taze ürünler", order: 2 },
  { galleryId: galMap["kadikoy-cevre-festivali"], imageUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80", caption: "Festival alanı", order: 1 },
  { galleryId: galMap["kadikoy-cevre-festivali"], imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80", caption: "Çevre etkinlikleri", order: 2 },
];

for (const photo of photoData) {
  if (photo.galleryId) {
    await db.insert(galleryPhotos).values(photo);
  }
}
console.log("✅ Gallery photos seeded");

// ── Video Galleries ─────────────────────────────────────────────────────────
await db.insert(videoGalleries).values([
  {
    title: "Ambulanstan farkındalık anonsu",
    slug: "ambulanstan-farkindalik-anonsu",
    description: "Sağlık ekipleri, ambulans içinden önemli bir farkındalık mesajı verdi.",
    thumbnailUrl: "https://images.unsplash.com/photo-1587745416684-47953f16f02f?w=800&q=80",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    duration: "2:34",
    publishedAt: new Date("2026-04-18T14:00:00"),
  },
  {
    title: "Kadıköy'de 19 Mayıs coşkusu",
    slug: "kadikoy-19-mayis-cosgusu",
    description: "19 Mayıs Atatürk'ü Anma, Gençlik ve Spor Bayramı coşkusu.",
    thumbnailUrl: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&q=80",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    duration: "4:12",
    publishedAt: new Date("2026-04-16T10:00:00"),
  },
  {
    title: "İstanbul'un kıyılarına bakmak",
    slug: "istanbul-kiyilarina-bakmak",
    description: "İstanbul'un eşsiz kıyı şeridini keşfeden belgesel.",
    thumbnailUrl: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&q=80",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    duration: "8:45",
    publishedAt: new Date("2026-04-12T10:00:00"),
  },
  {
    title: "Kadıköy Çarşısı'nda bir gün",
    slug: "kadikoy-carsisinda-bir-gun",
    description: "Kadıköy'ün renkli çarşısında bir günün hikayesi.",
    thumbnailUrl: "https://images.unsplash.com/photo-1555993539-1732b0258235?w=800&q=80",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    duration: "5:20",
    publishedAt: new Date("2026-04-09T10:00:00"),
  },
  {
    title: "Moda'da bahar yürüyüşü",
    slug: "modada-bahar-yuruyusu",
    description: "Moda sahilinde baharın gelişini kutlayan yürüyüş.",
    thumbnailUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    duration: "3:15",
    publishedAt: new Date("2026-04-05T10:00:00"),
  },
]).onConflictDoNothing();

console.log("✅ Video galleries seeded");

// ── Events ──────────────────────────────────────────────────────────────────
await db.insert(events).values([
  {
    title: "Peradi Ensemble Konseri",
    description: "Çok sesli müziğin büyüleyici dünyasına davetlisiniz. Peradi Ensemble, klasik ve çağdaş eserleri yorumlayacak.",
    location: "Süreyya Operası, Kadıköy",
    imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80",
    category: "Müzik",
    eventDate: new Date("2026-04-25T20:00:00"),
    eventEndDate: new Date("2026-04-25T22:30:00"),
  },
  {
    title: "Kadıköy Kitap Fuarı",
    description: "Yüzlerce yayınevinin katılımıyla gerçekleşecek kitap fuarında imza günleri ve söyleşiler de yer alacak.",
    location: "Kadıköy Meydan, İstanbul",
    imageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80",
    category: "Kültür",
    eventDate: new Date("2026-04-26T10:00:00"),
    eventEndDate: new Date("2026-04-26T20:00:00"),
  },
  {
    title: "Sürdürülebilir Yaşam Atölyesi",
    description: "Çevre dostu yaşam pratikleri üzerine interaktif bir atölye. Kompost yapımı, sıfır atık ve kentsel tarım konuları ele alınacak.",
    location: "Kadıköy Kültür Merkezi",
    imageUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80",
    category: "Çevre",
    eventDate: new Date("2026-04-27T14:00:00"),
    eventEndDate: new Date("2026-04-27T17:00:00"),
  },
  {
    title: "Gençlik Basketbol Turnuvası",
    description: "Kadıköy Belediyesi'nin düzenlediği gençlik basketbol turnuvasında takımlar mücadele edecek.",
    location: "Kadıköy Spor Salonu",
    imageUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80",
    category: "Spor",
    eventDate: new Date("2026-04-28T10:00:00"),
    eventEndDate: new Date("2026-04-28T18:00:00"),
  },
  {
    title: "Fotoğraf Sergisi: Kadıköy'ün Renkleri",
    description: "Yerel fotoğrafçıların gözünden Kadıköy'ün sokakları, insanları ve yaşamı.",
    location: "Moda Sanat Galerisi",
    imageUrl: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&q=80",
    category: "Sanat",
    eventDate: new Date("2026-04-29T11:00:00"),
    eventEndDate: new Date("2026-05-10T19:00:00"),
  },
  {
    title: "Çocuk Tiyatrosu: Küçük Prens",
    description: "Saint-Exupéry'nin ölümsüz eseri, çocuklar için özel bir tiyatro uyarlamasıyla sahnede.",
    location: "Kadıköy Belediyesi Tiyatrosu",
    imageUrl: "https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&q=80",
    category: "Tiyatro",
    eventDate: new Date("2026-04-30T15:00:00"),
    eventEndDate: new Date("2026-04-30T17:00:00"),
  },
  {
    title: "Yoga ve Meditasyon Seansı",
    description: "Sabah erken saatlerde Moda Sahili'nde açık hava yoga ve meditasyon seansı.",
    location: "Moda Sahili, Kadıköy",
    imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80",
    category: "Sağlık",
    eventDate: new Date("2026-05-01T07:00:00"),
    eventEndDate: new Date("2026-05-01T09:00:00"),
  },
  {
    title: "Kadıköy Gastronomi Festivali",
    description: "Kadıköy'ün lezzetli mutfağını keşfetmek için harika bir fırsat. Yerel restoranlar ve sokak lezzetleri bir arada.",
    location: "Kadıköy Çarşısı",
    imageUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80",
    category: "Gastronomi",
    eventDate: new Date("2026-05-02T12:00:00"),
    eventEndDate: new Date("2026-05-02T22:00:00"),
  },
]).onConflictDoNothing();

console.log("✅ Events seeded");
console.log("🎉 Database seeding complete!");

await pool.end();
