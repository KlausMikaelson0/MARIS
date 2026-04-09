import { Router } from "express";
import { db } from "@workspace/db";
import { productsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

/* ── seed default products once ─────────────────────────────── */
const SEED_PRODUCTS = [
  {
    id: "launch",
    name: "Launch Store",
    nameAr: "متجر البداية",
    price: 5900,
    tag: "Starter",
    tagAr: "البداية",
    desc: "A complete digital store setup to get your brand live fast. Theme selection, product setup, and full handover.",
    descAr: "إعداد متجر رقمي كامل للإطلاق السريع. اختيار قالب، إعداد المنتجات، وتسليم شامل.",
    timeline: "2–3 weeks",
    timelineAr: "2–3 أسابيع",
    demoUrl: "",
    accent: "#C9A84C",
    accentBright: "#E8C96A",
    gradient: "linear-gradient(135deg, #1c1608 0%, #100d04 60%, #080601 100%)",
    includes: [
      "Premium custom theme selection & setup",
      "Up to 30 products configured",
      "Homepage, About, Contact & Policy pages",
      "Payment gateway configuration",
      "Mobile-optimized layout",
      "Domain connection & DNS",
      "SEO meta configuration",
      "Full handover documentation",
    ],
    includesAr: [
      "اختيار وإعداد قالب مخصص متميز",
      "إعداد ما يصل إلى 30 منتجاً",
      "الصفحات الأساسية كاملة",
      "ضبط بوابة الدفع",
      "تصميم متجاوب للجوال",
      "ربط النطاق وإعداد DNS",
      "إعداد SEO الأساسي",
      "توثيق التسليم الكامل",
    ],
    sortOrder: 0,
    visible: true,
  },
  {
    id: "brand",
    name: "Brand Store",
    nameAr: "متجر العلامة",
    price: 12900,
    tag: "Most Popular",
    tagAr: "الأكثر طلباً",
    desc: "A fully custom digital store built around your brand identity. Custom theme, 100 products, full marketing stack.",
    descAr: "متجر رقمي مخصص بالكامل حول هوية علامتك. قالب مخصص، 100 منتج، منظومة تسويق.",
    timeline: "3–5 weeks",
    timelineAr: "3–5 أسابيع",
    demoUrl: "",
    accent: "#D4AF37",
    accentBright: "#e5c97a",
    gradient: "linear-gradient(135deg, #1c1508 0%, #130f05 60%, #0a0802 100%)",
    includes: [
      "Fully custom theme design & development",
      "Up to 100 products + collections",
      "Complete brand integration",
      "Conversion-optimized product pages",
      "Discount & promotions engine",
      "Email capture + analytics (GA4, Meta Pixel)",
      "30-day post-launch support",
      "Full handover documentation",
    ],
    includesAr: [
      "تصميم قالب مخصص بالكامل",
      "ما يصل إلى 100 منتج وتصنيفات",
      "تكامل العلامة التجارية الكامل",
      "صفحات منتج محسّنة للتحويل",
      "نظام خصومات وعروض",
      "بريد إلكتروني وتحليلات (GA4 + Meta Pixel)",
      "دعم 30 يوماً بعد الإطلاق",
      "توثيق التسليم الكامل",
    ],
    sortOrder: 1,
    visible: true,
  },
  {
    id: "elite",
    name: "Elite Platform",
    nameAr: "منصة النخبة",
    price: 27900,
    tag: "Enterprise",
    tagAr: "مؤسسي",
    desc: "Enterprise digital store with unlimited products, full brand identity, enterprise integrations, and custom checkout.",
    descAr: "متجر مؤسسي مع منتجات غير محدودة، هوية كاملة، تكاملات مؤسسية، ودفع مخصص.",
    timeline: "5–7 weeks",
    timelineAr: "5–7 أسابيع",
    demoUrl: "",
    accent: "#B8960C",
    accentBright: "#d4ad3a",
    gradient: "linear-gradient(135deg, #181205 0%, #100d03 60%, #080601 100%)",
    includes: [
      "Enterprise store setup & configuration",
      "Unlimited products & collections",
      "Custom checkout extensions",
      "Multi-currency & multi-language",
      "ERP / CRM / 3PL integrations",
      "Loyalty & rewards programme",
      "Full brand identity system",
      "60-day post-launch support",
    ],
    includesAr: [
      "إعداد المنصة المؤسسية",
      "منتجات وتصنيفات غير محدودة",
      "إضافات دفع مخصصة",
      "متعدد العملات واللغات",
      "تكاملات ERP/CRM/3PL",
      "برنامج الولاء والمكافآت",
      "نظام هوية علامة تجارية كامل",
      "دعم 60 يوماً بعد الإطلاق",
    ],
    sortOrder: 2,
    visible: true,
  },
  {
    id: "custom",
    name: "Custom Build",
    nameAr: "بناء مخصص",
    price: 50,
    tag: "Bespoke",
    tagAr: "حسب الطلب",
    desc: "Something outside our standard packages? Pay SAR 50 to submit your requirements and receive a detailed custom quote.",
    descAr: "تحتاج شيئاً خارج باقاتنا؟ ادفع 50 ريال لتقديم متطلباتك واستلام عرض سعر مفصّل.",
    timeline: "Quote in 48h",
    timelineAr: "عرض خلال 48 ساعة",
    demoUrl: "",
    accent: "#A08520",
    accentBright: "#c9a84c",
    gradient: "linear-gradient(135deg, #171205 0%, #100d03 60%, #080601 100%)",
    includes: [
      "Requirements intake form",
      "30-min scoping call with the team",
      "Detailed written proposal",
      "Timeline & deliverables breakdown",
      "Fixed-price quote (no surprises)",
      "SAR 50 credited toward your project",
    ],
    includesAr: [
      "نموذج استلام المتطلبات",
      "مكالمة تحديد نطاق 30 دقيقة مع الفريق",
      "مقترح مكتوب مفصّل",
      "جدول زمني وتوزيع المخرجات",
      "عرض سعر ثابت (بلا مفاجآت)",
      "يُحتسب الـ50 ريال من تكلفة المشروع",
    ],
    sortOrder: 3,
    visible: true,
  },
];

async function seedProductsIfEmpty() {
  const existing = await db.select().from(productsTable);
  if (existing.length === 0) {
    await db.insert(productsTable).values(SEED_PRODUCTS);
    console.log("Seeded 4 default products");
  }
}

seedProductsIfEmpty().catch(console.error);

/* ── List all products ────────────────────────────────────── */
router.get("/products", async (req, res) => {
  try {
    const rows = await db.select().from(productsTable).orderBy(productsTable.sortOrder);
    const { visible } = req.query;
    if (visible === "true") {
      res.json(rows.filter(r => r.visible));
    } else {
      res.json(rows);
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to list products" });
  }
});

/* ── Get single product ──────────────────────────────────── */
router.get("/products/:id", async (req, res) => {
  try {
    const [row] = await db.select().from(productsTable).where(eq(productsTable.id, req.params.id));
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: "Failed to get product" });
  }
});

/* ── Create product ──────────────────────────────────────── */
router.post("/products", async (req, res) => {
  try {
    const body = req.body;
    if (!body.id || !body.name) {
      res.status(400).json({ error: "id and name are required" });
      return;
    }
    const [row] = await db.insert(productsTable).values({
      id: body.id,
      name: body.name,
      nameAr: body.nameAr ?? "",
      price: body.price ?? 0,
      tag: body.tag ?? "",
      tagAr: body.tagAr ?? "",
      desc: body.desc ?? "",
      descAr: body.descAr ?? "",
      timeline: body.timeline ?? "",
      timelineAr: body.timelineAr ?? "",
      demoUrl: body.demoUrl ?? "",
      accent: body.accent ?? "#8b5cf6",
      accentBright: body.accentBright ?? "#a78bfa",
      gradient: body.gradient ?? "linear-gradient(135deg, #2d1b4e 0%, #0f0a1e 100%)",
      includes: body.includes ?? [],
      includesAr: body.includesAr ?? [],
      sortOrder: body.sortOrder ?? 99,
      visible: body.visible ?? true,
    }).returning();
    res.status(201).json(row);
  } catch (err) {
    res.status(500).json({ error: "Failed to create product" });
  }
});

/* ── Update product ──────────────────────────────────────── */
router.put("/products/:id", async (req, res) => {
  try {
    const body = req.body;
    const [row] = await db.update(productsTable)
      .set({
        ...(body.name        !== undefined && { name: body.name }),
        ...(body.nameAr      !== undefined && { nameAr: body.nameAr }),
        ...(body.price       !== undefined && { price: body.price }),
        ...(body.tag         !== undefined && { tag: body.tag }),
        ...(body.tagAr       !== undefined && { tagAr: body.tagAr }),
        ...(body.desc        !== undefined && { desc: body.desc }),
        ...(body.descAr      !== undefined && { descAr: body.descAr }),
        ...(body.timeline    !== undefined && { timeline: body.timeline }),
        ...(body.timelineAr  !== undefined && { timelineAr: body.timelineAr }),
        ...(body.demoUrl     !== undefined && { demoUrl: body.demoUrl }),
        ...(body.accent      !== undefined && { accent: body.accent }),
        ...(body.accentBright !== undefined && { accentBright: body.accentBright }),
        ...(body.gradient    !== undefined && { gradient: body.gradient }),
        ...(body.includes    !== undefined && { includes: body.includes }),
        ...(body.includesAr  !== undefined && { includesAr: body.includesAr }),
        ...(body.sortOrder   !== undefined && { sortOrder: body.sortOrder }),
        ...(body.visible     !== undefined && { visible: body.visible }),
      })
      .where(eq(productsTable.id, req.params.id))
      .returning();
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: "Failed to update product" });
  }
});

/* ── Delete product ──────────────────────────────────────── */
router.delete("/products/:id", async (req, res) => {
  try {
    await db.delete(productsTable).where(eq(productsTable.id, req.params.id));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete product" });
  }
});

export default router;
