import { prisma } from '@/lib/db'
import { getCategories, getProducts, usingFallback } from '@/lib/store'
import StaffCMS from '@/components/StaffCMS'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export default async function StaffPage() {
  const cookieStore = cookies()
  const authCookie = cookieStore.get('aranya_staff_auth')
  const isAuthenticated = authCookie?.value === 'authenticated'

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
      console.error('Database fetch error in staff portal:', error)
      categories = await getCategories()
      products = await getProducts()
    }
  }

  return (
    <StaffCMS 
      categories={categories} 
      initialProducts={products} 
      isAuthenticated={isAuthenticated} 
    />
  )
}
