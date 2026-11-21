import {
  fallbackCategories, fallbackProducts,
  fallbackMembers, fallbackTransactions,
  FallbackCategory, FallbackProduct,
  FallbackMember, FallbackTransaction,
} from './fallback-data'

// In-memory store used only when DATABASE_URL is not configured.
// It gives a fully interactive local demo without a PostgreSQL instance.

let categories: FallbackCategory[] = [...fallbackCategories]
let products: FallbackProduct[] = [...fallbackProducts]
let members: FallbackMember[] = [...fallbackMembers]
let transactions: FallbackTransaction[] = [...fallbackTransactions]

export function usingFallback(): boolean {
  return !process.env.DATABASE_URL
}

// ─── Categories ───

export async function getCategories() {
  return categories
}

// ─── Products ───

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

// ─── Members (Weed Walker Legacy) ───

export async function getMembers() {
  return members
}

export async function upsertMember(data: Partial<FallbackMember>) {
  if (data.id) {
    const existing = members.find(m => m.id === data.id)
    if (!existing) return { success: false, error: 'Member not found' }
    members = members.map(m => (m.id === data.id ? { ...m, ...data, updatedAt: new Date() } : m))
    return { success: true }
  }

  const member: FallbackMember = {
    id: `mem-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: data.name || 'Unknown',
    channel: data.channel || null,
    dob: data.dob || null,
    phone: data.phone || null,
    email: data.email || null,
    firstVisit: data.firstVisit || null,
    lastVisit: data.lastVisit || null,
    points: data.points || 0,
    tier: data.tier || 'bronze',
    notes: data.notes || null,
    syncedAt: new Date().toISOString(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  members = [member, ...members]
  return { success: true, data: member }
}

export async function deleteMember(id: string) {
  members = members.filter(m => m.id !== id)
  transactions = transactions.filter(t => t.memberId !== id)
  return { success: true }
}

// ─── Transactions (Weed Walker Legacy) ───

export async function getTransactions() {
  return transactions
}

export async function upsertTransaction(data: Partial<FallbackTransaction>) {
  if (data.id) {
    const existing = transactions.find(t => t.id === data.id)
    if (!existing) return { success: false, error: 'Transaction not found' }
    transactions = transactions.map(t => (t.id === data.id ? { ...t, ...data } : t))
    return { success: true }
  }

  const tx: FallbackTransaction = {
    id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    txDate: data.txDate || new Date().toISOString(),
    memberId: data.memberId || null,
    memberName: data.memberName || 'Walk-in',
    receiptNumber: data.receiptNumber || `WW-${Date.now()}`,
    status: data.status || 'completed',
    amount: data.amount || 0,
    pointsEarned: data.pointsEarned || 0,
    txType: data.txType || 'sale',
    syncedAt: new Date().toISOString(),
    createdAt: new Date(),
  }
  transactions = [tx, ...transactions]
  return { success: true, data: tx }
}

export async function deleteTransaction(id: string) {
  transactions = transactions.filter(t => t.id !== id)
  return { success: true }
}