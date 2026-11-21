import { prisma } from '@/lib/db'
import { getCategories, getProducts, getMembers, getTransactions, usingFallback } from '@/lib/store'
import StaffCMS from '@/components/StaffCMS'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export default async function StaffPage() {
  const cookieStore = cookies()
  const authCookie = cookieStore.get('aranya_staff_auth')
  const isAuthenticated = authCookie?.value === 'authenticated'

  let categories = []
  let products = []
  let members = []
  let transactions = []

  if (usingFallback()) {
    categories = await getCategories()
    products = await getProducts()
    members = await getMembers()
    transactions = await getTransactions()
  } else {
    try {
      categories = await prisma.category.findMany({
        orderBy: { order: 'asc' }
      })
      products = await prisma.product.findMany({
        include: { category: true },
        orderBy: { createdAt: 'desc' }
      })
      members = await prisma.member.findMany({
        orderBy: { createdAt: 'desc' }
      })
      transactions = await prisma.transaction.findMany({
        orderBy: { createdAt: 'desc' }
      })
    } catch (error) {
      console.error('Database fetch error in staff portal:', error)
      categories = await getCategories()
      products = await getProducts()
      members = await getMembers()
      transactions = await getTransactions()
    }
  }

  return (
    <StaffCMS 
      categories={categories} 
      initialProducts={products} 
      initialMembers={members as any}
      initialTransactions={transactions as any}
      isAuthenticated={isAuthenticated} 
    />
  )
}