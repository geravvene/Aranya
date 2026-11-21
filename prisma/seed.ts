import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding ARANYA database...')

  await prisma.product.deleteMany()
  await prisma.category.deleteMany()

  const catLivingSoil = await prisma.category.create({
    data: {
      slug: 'living-soil',
      nameEn: 'Living Soil Organic',
      nameTh: 'ดินมีชีวิตออร์แกนิก',
      order: 1,
      icon: 'Sprout'
    }
  })

  const catHydro = await prisma.category.create({
    data: {
      slug: 'hydroponics',
      nameEn: 'Indoor Hydroponics',
      nameTh: 'ไฮโดรโปนิกส์ในร่ม',
      order: 2,
      icon: 'Zap'
    }
  })

  const catPreRolls = await prisma.category.create({
    data: {
      slug: 'pre-rolls',
      nameEn: 'GACP Pre-Rolls',
      nameTh: 'พรีม้วนมาตรฐาน GACP',
      order: 3,
      icon: 'Cigarette'
    }
  })

  const catTeas = await prisma.category.create({
    data: {
      slug: 'teas-bar',
      nameEn: 'Botanical Teas & Elixirs',
      nameTh: 'ชาสมุนไพรและเครื่องดื่ม',
      order: 4,
      icon: 'Coffee'
    }
  })

  await prisma.product.createMany({
    data: [
      {
        slug: 'thai-stick-heritage',
        nameEn: 'Thai Stick Heritage (Siam Sativa)',
        nameTh: 'ไทยสติ๊ก เฮอริเทจ (สยามซาติว่า)',
        descriptionEn: 'Authentic heirloom Thai landrace cured in bamboo leaves. Uplifting cerebral euphoria with deep tropical fruit notes.',
        descriptionTh: 'กัญชาไทยพื้นเมืองแท้ บ่มด้วยใบไผ่ ให้ความรู้สึกกระปรี้กระเปร่าและกลิ่นผลไม้เมืองร้อน',
        categoryId: catLivingSoil.id,
        pricePerUnit: 650,
        unitType: 'gram',
        isAvailable: true,
        stockGrams: 250.0,
        thcPercent: 21.5,
        cbdPercent: 0.8,
        cultivation: 'Living Soil Organic',
        imageUrl: 'https://images.unsplash.com/photo-1603909223429-69bb7101f420?auto=format&fit=crop&w=800&q=80',
        myrcene: 2.8,
        limonene: 1.9,
        caryophyllene: 2.2,
        terpenesNote: 'Dominant tropical mango, sweet spice, and herbal undertones.'
      },
      {
        slug: 'bangkok-purple-kush',
        nameEn: 'Bangkok Purple Kush',
        nameTh: 'บางกอก เพอร์เพิล คูช',
        descriptionEn: 'Indica-dominant masterpiece grown under pristine LED spectrums. Deep physical relaxation and calming serenity.',
        descriptionTh: 'อินดิก้าชั้นยอด ปลูกภายใต้แสงสเปกตรัม LED ให้ความผ่อนคลายร่างกายอย่างล้ำลึก',
        categoryId: catHydro.id,
        pricePerUnit: 700,
        unitType: 'gram',
        isAvailable: true,
        stockGrams: 180.5,
        thcPercent: 24.2,
        cbdPercent: 0.4,
        cultivation: 'Indoor Hydro',
        imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
        myrcene: 3.5,
        limonene: 1.1,
        caryophyllene: 2.9,
        terpenesNote: 'Rich earthy pine, sweet grape, and subtle hashish notes.'
      },
      {
        slug: 'chiang-mai-haze',
        nameEn: 'Chiang Mai Golden Haze',
        nameTh: 'เชียงใหม่ โกลเดน เฮซ',
        descriptionEn: 'Highland sativa bursting with creative energy and vibrant citrus clarity. Perfect for daytime contemplation.',
        descriptionTh: 'ซาติต้าที่ราบสูง เต็มเปี่ยมด้วยพลังความคิดสร้างสรรค์และกลิ่นซิตรัสสดชื่น เหมาะสำหรับช่วงกลางวัน',
        categoryId: catLivingSoil.id,
        pricePerUnit: 600,
        unitType: 'gram',
        isAvailable: true,
        stockGrams: 320.0,
        thcPercent: 22.0,
        cbdPercent: 1.2,
        cultivation: 'Living Soil Organic',
        imageUrl: 'https://images.unsplash.com/photo-1536758411037-88575c3413cb?auto=format&fit=crop&w=800&q=80',
        myrcene: 1.5,
        limonene: 4.2,
        caryophyllene: 1.8,
        terpenesNote: 'Zesty lemon peel, fresh pine needles, and subtle peppercorn.'
      },
      {
        slug: 'emerald-gelato-preroll',
        nameEn: 'Emerald Gelato Pre-Roll (1g)',
        nameTh: 'เอมเมอรัลด์ เจลาโต้ พรีม้วน (1 กรัม)',
        descriptionEn: 'Expertly rolled whole flower with organic unbleached hemp paper and wooden mouthpiece. Balanced hybrid perfection.',
        descriptionTh: 'ดอกกัญชาคัดพิเศษ ม้วนด้วยกระดาษออร์แกนิกและปากกาไม้ สมดุลความผ่อนคลายและรื่นรมย์',
        categoryId: catPreRolls.id,
        pricePerUnit: 450,
        unitType: 'pre-roll',
        isAvailable: true,
        stockGrams: 50.0,
        thcPercent: 23.0,
        cbdPercent: 0.5,
        cultivation: 'Greenhouse',
        imageUrl: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=800&q=80',
        myrcene: 2.1,
        limonene: 2.5,
        caryophyllene: 2.6,
        terpenesNote: 'Sweet dessert aroma, citrus sherbet, and earthy lavender.'
      },
      {
        slug: 'lemongrass-cbd-tea',
        nameEn: 'Lemongrass Botanical Infusion',
        nameTh: 'ชาตะไคร้ผสมสารสกัดพฤกษชาติ',
        descriptionEn: 'Refreshing organic Thai lemongrass infused with soothing botanical terpenes and calming adaptogens.',
        descriptionTh: 'ชาตะไคร้ออร์แกนิกไทย ผสมผสานเทอร์พีนพฤกษชาติเพื่อความผ่อนคลายและสดชื่น',
        categoryId: catTeas.id,
        pricePerUnit: 180,
        unitType: 'can',
        isAvailable: true,
        stockGrams: 100.0,
        thcPercent: 0.0,
        cbdPercent: 2.5,
        cultivation: 'Organic Infusion',
        imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80',
        myrcene: 1.0,
        limonene: 3.0,
        caryophyllene: 0.5,
        terpenesNote: 'Bright lemongrass, zesty lime, and calming herbal warmth.'
      },
      {
        slug: 'siam-sunset-zkittlez',
        nameEn: 'Siam Sunset Zkittlez',
        nameTh: 'สยาม ซันเซ็ต สกิตเทิลส์',
        descriptionEn: 'Indica dominant exotic strain featuring multi-layered candy fruit notes and serene evening relaxation.',
        descriptionTh: 'สายพันธุ์เอ็กซ์โซติกอินดิก้า เด่นด้วยกลิ่นลูกอมผลไม้รวม มอบความสงบยามเย็น',
        categoryId: catHydro.id,
        pricePerUnit: 750,
        unitType: 'gram',
        isAvailable: false,
        stockGrams: 0.0,
        thcPercent: 26.5,
        cbdPercent: 0.2,
        cultivation: 'Indoor Hydro',
        imageUrl: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80',
        myrcene: 3.1,
        limonene: 2.8,
        caryophyllene: 3.4,
        terpenesNote: 'Tropical berry punch, sweet citrus candy, and grapefruit.'
      }
    ]
  })

  console.log('Database seeded successfully with ARANYA Bangkok products.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
