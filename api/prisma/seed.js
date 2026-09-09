const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main(){
  const adminEmail = process.env.ADMIN_EMAIL || 'kashmir@kashmir-store.com';
  const adminPass = process.env.ADMIN_PASSWORD || '775059592';
  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(adminPass, salt);

  // upsert admin
  await prisma.admin.upsert({
    where: { email: adminEmail },
    update: { password: hashed },
    create: { email: adminEmail, password: hashed }
  });

  // sample products (20 items)
  const existing = await prisma.product.count();
  if (existing === 0) {
    await prisma.product.createMany({ data: [
      { title: 'شال كشمير فاخر - بيج', description: 'شال كشمير ناعم وفاخر، مصنوع من أجود الخامات.', price: 250, currency: 'SAR', category: 'شالات', stock: 10, images: ['/logo.svg'], sku: 'SH-001' },
      { title: 'شال صوف ترمه - بني', description: 'شال رجالي صوف ترمه دافئ.', price: 180, currency: 'SAR', category: 'شالات', stock: 12, images: ['/logo.svg'], sku: 'SH-002' },
      { title: 'شال فل ترمه - كحلي', description: 'شال فل ترمه خفيف للمناسبات.', price: 150, currency: 'SAR', category: 'شالات', stock: 15, images: ['/logo.svg'], sku: 'SH-003' },
      { title: 'شال بشمينا - نسائي', description: 'شال بشمينا أنيق للنساء.', price: 220, currency: 'SAR', category: 'شالات', stock: 8, images: ['/logo.svg'], sku: 'SH-004' },
      { title: 'شال سوبر بشمينا - رجالي', description: 'شال سوبر بشمينا ناعم.', price: 300, currency: 'SAR', category: 'شالات', stock: 6, images: ['/logo.svg'], sku: 'SH-005' },
      { title: 'بلوفر كشمير', description: 'بلوفر من الكشمير الخالص.', price: 520, currency: 'SAR', category: 'ملابس', stock: 6, images: ['/logo.svg'], sku: 'CL-001' },
      { title: 'جاكيت صوف رجالي', description: 'جاكيت صوف دافئ ومريح.', price: 350, currency: 'SAR', category: 'ملابس', stock: 8, images: ['/logo.svg'], sku: 'CL-002' },
      { title: 'قميص رسمي رجالي', description: 'قميص رسمي بمقاسات متعددة.', price: 200, currency: 'SAR', category: 'ملابس', stock: 15, images: ['/logo.svg'], sku: 'CL-003' },
      { title: 'ساعه رجالية أنيقة', description: 'ساعة أنيقة بمينا كلاسيكي.', price: 450, currency: 'SAR', category: 'ساعات', stock: 5, images: ['/logo.svg'], sku: 'WA-001' },
      { title: 'ساعة نسائية فاخرة', description: 'ساعة نسائية تصميم أنيق.', price: 480, currency: 'SAR', category: 'ساعات', stock: 4, images: ['/logo.svg'], sku: 'WA-002' },
      { title: 'نظارة شمسية', description: 'نظارة شمسية عالية الجودة.', price: 140, currency: 'SAR', category: 'اكسسوارات', stock: 18, images: ['/logo.svg'], sku: 'AC-001' },
      { title: 'حقيبة يد جلدية', description: 'حقيبة جلدية أصلية.', price: 180, currency: 'SAR', category: 'اكسسوارات', stock: 12, images: ['/logo.svg'], sku: 'AC-002' },
      { title: 'سوار جلد', description: 'سوار جلد أنيق.', price: 65, currency: 'SAR', category: 'اكسسوارات', stock: 30, images: ['/logo.svg'], sku: 'AC-003' },
      { title: 'شال حرير ملون - نسائي', description: 'شال خفيف للزينة.', price: 120, currency: 'SAR', category: 'شالات', stock: 20, images: ['/logo.svg'], sku: 'SH-006' },
      { title: 'شال صوف سادة - رجالي', description: 'شال عادي يناسب الاستخدام اليومي.', price: 90, currency: 'SAR', category: 'شالات', stock: 25, images: ['/logo.svg'], sku: 'SH-007' },
      { title: 'حزام جلد - رجالي', description: 'حزام جلد عالي الجودة.', price: 95, currency: 'SAR', category: 'اكسسوارات', stock: 22, images: ['/logo.svg'], sku: 'AC-004' },
      { title: 'بنطلون رسمي رجالي', description: 'بنطلون رسمي لمظهر أنيق.', price: 240, currency: 'SAR', category: 'ملابس', stock: 10, images: ['/logo.svg'], sku: 'CL-004' },
      { title: 'جواكت خفيفه', description: 'جاكيت خفيف للسفر.', price: 210, currency: 'SAR', category: 'ملابس', stock: 14, images: ['/logo.svg'], sku: 'CL-005' },
      { title: 'شال كشمير فاخر - أحمر', description: 'شال كشمير فاخر بلون أحمر.', price: 260, currency: 'SAR', category: 'شالات', stock: 7, images: ['/logo.svg'], sku: 'SH-008' },
      { title: 'نظارة شمسية فاخرة - نسائي', description: 'نظارة تصميم مميز للنساء.', price: 220, currency: 'SAR', category: 'اكسسوارات', stock: 9, images: ['/logo.svg'], sku: 'AC-005' }
    ]});
  }

  console.log('Seeding finished');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
