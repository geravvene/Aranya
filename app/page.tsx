import { prisma } from '@/lib/db'
import { getCategories, getProducts, usingFallback } from '@/lib/store'
import CustomerMenu from '@/components/CustomerMenu'

export const dynamic = 'force-dynamic'

export default async function Page() {
  let categories = []
  let products = []

  if (usingFallback()) {
    categories = await getCategories()
    products = await getProducts()
  } else {
    try {
      categories = await prisma.category.findMany({
        orderBy: { order: 'asc' }
      })
      products = await prisma.product.findMany({
        include: { category: true },
        orderBy: { createdAt: 'desc' }
      })
    } catch (error) {
      console.error('Database fetch error in customer menu:', error)
      categories = await getCategories()
      products = await getProducts()
    }
  }

  return <CustomerMenu categories={categories} initialProducts={products} />
}
