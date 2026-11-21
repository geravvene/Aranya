import { fallbackCategories, fallbackProducts, FallbackCategory, FallbackProduct } from './fallback-data'

// In-memory store used only when DATABASE_URL is not configured.
// It gives a fully interactive local demo without a PostgreSQL instance.

let categories: FallbackCategory[] = [...fallbackCategories]
let products: FallbackProduct[] = [...fallbackProducts]

export function usingFallback(): boolean {
  return !process.env.DATABASE_URL
}

export async function getCategories() {
  return categories
}

export async function getProducts() {
  return products
}

export async function toggleAvailability(id: string, isAvailable: boolean) {
  products = products.map(p => (p.id === id ? { ...p, isAvailable } : p))
  return { success: true }
}

export async function updatePrice(id: string, newPrice: number) {
  products = products.map(p => (p.id === id ? { ...p, pricePerUnit: newPrice, updatedAt: new Date() } : p))
  return { success: true }
}

export async function upsertProduct(data: any) {
  if (data.id) {
    const existing = products.find(p => p.id === data.id)
    if (!existing) return { success: false, error: 'Product not found' }
    products = products.map(p => (p.id === data.id ? { ...p, ...data, category: p.category } : p))
    return { success: true }
  }

  const cat = categories.find(c => c.id === data.categoryId)
  if (!cat) return { success: false, error: 'Category not found' }

  const product: FallbackProduct = {
    ...data,
    id: `prod-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    category: cat,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  products = [product, ...products]
  return { success: true }
}

export async function deleteProduct(id: string) {
  products = products.filter(p => p.id !== id)
  return { success: true }
}
