'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import {
  usingFallback,
  toggleAvailability as storeToggle,
  updatePrice as storeUpdatePrice,
  upsertProduct as storeUpsert,
  deleteProduct as storeDelete,
} from '@/lib/store'

export async function verifyStaffPin(pin: string) {
  // Default PIN '1234' hashed for verification
  // For production ease, we check against hashed '1234' ($2a$10$...) or direct fallback
  const defaultHash = bcrypt.hashSync('1234', 10)
  
  // Check if any session exists or validate pin
  const isValid = pin === '1234' || bcrypt.compareSync(pin, defaultHash)
  
  if (isValid) {
    cookies().set('aranya_staff_auth', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 12, // 12 hours
      path: '/'
    })
    return { success: true }
  }
  
  return { success: false, error: 'Invalid PIN' }
}

export async function logoutStaff() {
  cookies().delete('aranya_staff_auth')
  return { success: true }
}

export async function toggleProductAvailability(id: string, isAvailable: boolean) {
  if (usingFallback()) {
    const res = await storeToggle(id, isAvailable)
    revalidatePath('/')
    revalidatePath('/staff')
    return res
  }
  try {
    await prisma.product.update({
      where: { id },
      data: { isAvailable }
    })
    revalidatePath('/')
    revalidatePath('/staff')
    return { success: true }
  } catch (error) {
    console.error('Failed to toggle availability:', error)
    return { success: false, error: 'Database error' }
  }
}

export async function updateProductPrice(id: string, newPrice: number) {
  if (usingFallback()) {
    const res = await storeUpdatePrice(id, newPrice)
    revalidatePath('/')
    revalidatePath('/staff')
    return res
  }
  try {
    await prisma.product.update({
      where: { id },
      data: { pricePerUnit: newPrice }
    })
    revalidatePath('/')
    revalidatePath('/staff')
    return { success: true }
  } catch (error) {
    console.error('Failed to update price:', error)
    return { success: false, error: 'Database error' }
  }
}

export interface ProductFormData {
  id?: string
  nameEn: string
  nameTh: string
  slug: string
  categoryId: string
  pricePerUnit: number
  unitType: string
  stockGrams?: number
  thcPercent?: number
  cbdPercent?: number
  cultivation?: string
  imageUrl?: string
  descriptionEn?: string
  descriptionTh?: string
  myrcene?: number
  limonene?: number
  caryophyllene?: number
  terpenesNote?: string
  isAvailable?: boolean
}

export async function upsertProduct(data: ProductFormData) {
  if (usingFallback()) {
    const res = await storeUpsert(data)
    revalidatePath('/')
    revalidatePath('/staff')
    return res
  }
  try {
    const { id, ...payload } = data
    if (id) {
      await prisma.product.update({
        where: { id },
        data: payload
      })
    } else {
      await prisma.product.create({
        data: payload as any
      })
    }
    revalidatePath('/')
    revalidatePath('/staff')
    return { success: true }
  } catch (error) {
    console.error('Failed to upsert product:', error)
    return { success: false, error: 'Database error or duplicate slug' }
  }
}

export async function deleteProduct(id: string) {
  if (usingFallback()) {
    const res = await storeDelete(id)
    revalidatePath('/')
    revalidatePath('/staff')
    return res
  }
  try {
    await prisma.product.delete({
      where: { id }
    })
    revalidatePath('/')
    revalidatePath('/staff')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete product:', error)
    return { success: false, error: 'Database error' }
  }
}
