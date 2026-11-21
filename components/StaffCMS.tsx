'use client'

import React, { useState } from 'react'
import { dict, Language } from '@/lib/i18n'
import {
  verifyStaffPin, logoutStaff, toggleProductAvailability,
  updateProductPrice, upsertProduct, deleteProduct, ProductFormData,
  getMembers, upsertMember, deleteMember,
  getTransactions, upsertTransaction, deleteTransaction,
} from '@/app/actions'
import {
  Lock, Unlock, Search, Plus, Edit3, Trash2, Check, X,
  Globe, ShieldCheck, Leaf, ArrowLeft, AlertCircle, Tablet, Sparkles,
  Users, Receipt, UserPlus, Phone, Mail, Calendar, DollarSign, Award,
} from 'lucide-react'

interface Category {
  id: string
  slug: string
  nameEn: string
  nameTh: string
}

interface Product {
  id: string
  slug: string
  nameEn: string
  nameTh: string
  descriptionEn?: string | null
  descriptionTh?: string | null
  categoryId: string
  category: Category
  pricePerUnit: number
  unitType: string
  isAvailable: boolean
  stockGrams?: number | null
  thcPercent?: number | null
  cbdPercent?: number | null
  imageUrl?: string | null
  cultivation?: string | null
  myrcene?: number | null
  limonene?: number | null
  caryophyllene?: number | null
  terpenesNote?: string | null
}

interface Member {
  id: string
  name: string
  channel: string | null
  dob: string | null
  phone: string | null
  email: string | null
  firstVisit: string | null
  lastVisit: string | null
  points: number
  tier: string
  notes: string | null
  syncedAt: string
  createdAt: Date
  updatedAt: Date
}

interface Transaction {
  id: string
  txDate: string
  memberId: string | null
  memberName: string
  receiptNumber: string
  status: string | null
  amount: number
  pointsEarned: number
  txType: string | null
  syncedAt: string
  createdAt: Date
}

type StaffTab = 'products' | 'members' | 'transactions'

interface StaffCMSProps {
  categories: Category[]
  initialProducts: Product[]
  initialMembers?: Member[]
  initialTransactions?: Transaction[]
  isAuthenticated: boolean
}

export default function StaffCMS({ categories, initialProducts, initialMembers = [], initialTransactions = [], isAuthenticated: serverAuth }: StaffCMSProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(serverAuth)
  const [pinInput, setPinInput] = useState('')
  const [pinError, setPinError] = useState(false)
  const [lang, setLang] = useState<Language>('en')
  const [activeTab, setActiveTab] = useState<StaffTab>('products')
  const [searchQuery, setSearchQuery] = useState('')
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null)
  const [tempPrice, setTempPrice] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentProduct, setCurrentProduct] = useState<Partial<Product> | null>(null)
  const [loading, setLoading] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  // Members & Transactions state
  const [members, setMembers] = useState<Member[]>(initialMembers)
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions)
  const [memberModal, setMemberModal] = useState(false)
  const [currentMember, setCurrentMember] = useState<Partial<Member> | null>(null)
  const [txModal, setTxModal] = useState(false)
  const [currentTx, setCurrentTx] = useState<Partial<Transaction> | null>(null)

  const t = dict[lang]

  const triggerToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3000)
  }

  const handlePinDigit = async (digit: string) => {
    const next = pinInput + digit
    if (next.length < 4) {
      setPinInput(next)
      setPinError(false)
    } else if (next.length === 4) {
      setLoading(true)
      const res = await verifyStaffPin(next)
      setLoading(false)
      if (res.success) {
        setIsAuthenticated(true)
        setPinInput('')
        setPinError(false)
        triggerToast('✓ Authenticated successfully')
      } else {
        setPinError(true)
        setTimeout(() => setPinInput(''), 600)
      }
    }
  }

  const handleLogout = async () => {
    await logoutStaff()
    setIsAuthenticated(false)
    setPinInput('')
  }

  const handleToggleAvailability = async (id: string, current: boolean) => {
    await toggleProductAvailability(id, !current)
    triggerToast(lang === 'en' ? 'Stock status updated' : 'อัปเดตสถานะสต็อกแล้ว')
  }

  const handlePriceSave = async (id: string) => {
    const val = parseFloat(tempPrice)
    if (!isNaN(val) && val > 0) {
      await updateProductPrice(id, val)
      triggerToast(lang === 'en' ? '✓ Price updated successfully' : '✓ อัปเดตราคาเรียบร้อยแล้ว')
    }
    setEditingPriceId(null)
    setTempPrice('')
  }

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentProduct || !currentProduct.nameEn || !currentProduct.categoryId || !currentProduct.pricePerUnit) {
      alert('Please fill required fields')
      return
    }

    const payload: ProductFormData = {
      id: currentProduct.id,
      slug: currentProduct.slug || currentProduct.nameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      nameEn: currentProduct.nameEn,
      nameTh: currentProduct.nameTh || currentProduct.nameEn,
      categoryId: currentProduct.categoryId,
      pricePerUnit: Number(currentProduct.pricePerUnit),
      unitType: currentProduct.unitType || 'gram',
      stockGrams: Number(currentProduct.stockGrams || 0),
      thcPercent: Number(currentProduct.thcPercent || 0),
      cbdPercent: Number(currentProduct.cbdPercent || 0),
      cultivation: currentProduct.cultivation || 'Living Soil Organic',
      imageUrl: currentProduct.imageUrl || '',
      descriptionEn: currentProduct.descriptionEn || '',
      descriptionTh: currentProduct.descriptionTh || '',
      myrcene: Number(currentProduct.myrcene || 0),
      limonene: Number(currentProduct.limonene || 0),
      caryophyllene: Number(currentProduct.caryophyllene || 0),
      terpenesNote: currentProduct.terpenesNote || '',
    }

    await upsertProduct(payload)
    setIsModalOpen(false)
    setCurrentProduct(null)
    triggerToast(lang === 'en' ? '✓ Product saved successfully' : '✓ บันทึกสินค้าเรียบร้อยแล้ว')
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await deleteProduct(id)
      triggerToast('Product deleted')
    }
  }

  const filteredProducts = initialProducts.filter(p => 
    p.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.nameTh.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!isAuthenticated) {
    return (
      <div className="relative h-screen w-full flex items-center justify-center bg-obsidian p-4 overflow-hidden">
        <div className="ambient-glow -top-40 -left-40"></div>
        <div className="ambient-glow -bottom-40 -right-40"></div>
        
        <div className="max-w-md w-full glass-panel p-8 rounded-3xl border border-border text-center space-y-6 relative z-10 shadow-2xl">
          <div>
            <div className="h-14 w-14 rounded-2xl bg-champagne/15 border border-champagne/40 text-champagne mx-auto flex items-center justify-center mb-4 shadow-inner">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold font-serif text-cream">Staff Fast CMS Gate</h2>
            <p className="text-xs text-sage mt-1">Enter 4-digit PIN (Default: 1 2 3 4)</p>
          </div>

          <div className="flex justify-center space-x-3">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className={`h-4 w-4 rounded-full border border-border transition-all ${pinInput.length > i ? 'bg-champagne border-champagne scale-110' : 'bg-obsidian'}`}></div>
            ))}
          </div>

          {pinError && <p className="text-xs text-red-400">Incorrect PIN code. Try 1234</p>}

          <div className="grid grid-cols-3 gap-3 max-w-[240px] mx-auto">
            {['1','2','3','4','5','6','7','8','9','C','0','←'].map((btn, idx) => (
              <button 
                key={idx}
                onClick={() => {
                  if (btn === 'C') setPinInput('');
                  else if (btn === '←') setPinInput(p => p.slice(0, -1));
                  else handlePinDigit(btn);
                }}
                className="h-12 rounded-xl glass-card font-semibold text-sm text-cream hover:bg-surface-light flex items-center justify-center active:scale-95 transition-all"
              >
                {btn}
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-border">
            <a
              href="/"
              className="inline-flex items-center gap-2 text-xs text-sage hover:text-cream transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Customer Menu</span>
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-screen w-full flex flex-col overflow-hidden bg-obsidian">
      <div className="ambient-glow -top-40 -left-40"></div>
      <div className="ambient-glow -bottom-40 -right-40"></div>

      {/* Top Header */}
      <header className="relative z-30 h-16 px-6 glass-panel flex items-center justify-between border-b border-border flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-lg bg-champagne/20 border border-champagne/40 flex items-center justify-center text-champagne">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif text-lg font-bold tracking-wider text-cream leading-tight">ARANYA CMS</h1>
            <p className="text-[10px] tracking-widest uppercase text-sage">Counter Staff Portal</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-obsidian/80 p-1.5 rounded-xl border border-border">
          <a 
            href="/"
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 text-sage hover:text-cream hover:bg-surface-light"
          >
            <Tablet className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? '📱 Customer Menu' : '📱 เมนูลูกค้า'}</span>
          </a>
          <button 
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 bg-champagne text-obsidian font-semibold shadow-lg shadow-champagne/20"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? '🔒 Staff CMS' : '🔒 การจัดการร้าน'}</span>
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setLang(l => l === 'en' ? 'th' : 'en')}
            className="h-9 px-3 rounded-lg bg-surface-light border border-border text-xs font-semibold text-champagne hover:border-champagne/50 transition-colors flex items-center space-x-1.5"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'TH ภาษาไทย' : 'EN English'}</span>
          </button>

          <button
            onClick={handleLogout}
            className="h-9 px-3 rounded-lg bg-red-950/40 border border-red-900/50 hover:bg-red-900 text-red-300 text-xs font-medium transition flex items-center space-x-1.5"
          >
            <Unlock className="w-3.5 h-3.5" />
            <span>{t.logout}</span>
          </button>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="relative z-10 flex items-center gap-1 px-6 pt-2 pb-0">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded-t-xl text-xs font-medium transition flex items-center gap-2 ${
            activeTab === 'products'
              ? 'bg-jade/15 border border-jade/40 border-b-0 text-jade font-semibold'
              : 'text-sage hover:text-cream hover:bg-surface-light/30'
          }`}
        >
          <Leaf className="w-3.5 h-3.5" />
          <span>{lang === 'en' ? 'Products' : 'สินค้า'}</span>
        </button>
        <button
          onClick={() => setActiveTab('members')}
          className={`px-4 py-2 rounded-t-xl text-xs font-medium transition flex items-center gap-2 ${
            activeTab === 'members'
              ? 'bg-jade/15 border border-jade/40 border-b-0 text-jade font-semibold'
              : 'text-sage hover:text-cream hover:bg-surface-light/30'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>{lang === 'en' ? 'Members' : 'สมาชิก'}</span>
          {members.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-jade/20 text-[10px] text-jade">{members.length}</span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-4 py-2 rounded-t-xl text-xs font-medium transition flex items-center gap-2 ${
            activeTab === 'transactions'
              ? 'bg-jade/15 border border-jade/40 border-b-0 text-jade font-semibold'
              : 'text-sage hover:text-cream hover:bg-surface-light/30'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>{lang === 'en' ? 'Transactions' : 'รายการขาย'}</span>
          {transactions.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-jade/20 text-[10px] text-jade">{transactions.length}</span>
          )}
        </button>
      </div>

      {/* Main Content */}
      <main className="relative z-10 flex-1 p-6 overflow-y-auto flex flex-col">
        {activeTab === 'products' && (
        <>
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sage" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full h-10 bg-obsidian/60 border border-border rounded-xl pl-10 pr-4 text-xs text-cream placeholder-sage focus:outline-none focus:border-jade shadow-inner"
            />
          </div>

          <button
            onClick={() => {
              setCurrentProduct({ unitType: 'gram', cultivation: 'Living Soil Organic', isAvailable: true })
              setIsModalOpen(true)
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-jade hover:bg-jade-dark text-obsidian font-bold text-xs shadow-lg shadow-jade/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addProduct}</span>
          </button>
        </div>

        {/* Products Table */}
        <div className="glass-panel rounded-3xl border border-border overflow-hidden shadow-xl flex-1 flex flex-col">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse text-xs text-sage">
              <thead className="bg-obsidian/80 border-b border-border uppercase text-[10px] tracking-wider text-sage sticky top-0">
                <tr>
                  <th className="py-4 px-6">Product</th>
                  <th className="py-4 px-6">{t.category}</th>
                  <th className="py-4 px-6">{t.price}</th>
                  <th className="py-4 px-6">{t.status}</th>
                  <th className="py-4 px-6 text-right">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredProducts.map(product => (
                  <tr key={product.id} className="hover:bg-surface-light/40 transition">
                    <td className="py-3 px-6 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-obsidian border border-border overflow-hidden flex-shrink-0">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Leaf className="w-4 h-4 m-auto text-sage" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-cream">{lang === 'th' ? product.nameTh : product.nameEn}</div>
                        <div className="text-[10px] text-sage">THC: {product.thcPercent || 0}% • {product.cultivation}</div>
                      </div>
                    </td>

                    <td className="py-3 px-6 text-sage uppercase text-[10px]">
                      {lang === 'th' ? product.category?.nameTh : product.category?.nameEn}
                    </td>

                    {/* Inline Fast Price Editor */}
                    <td className="py-3 px-6 font-semibold text-champagne">
                      {editingPriceId === product.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={tempPrice}
                            onChange={e => setTempPrice(e.target.value)}
                            className="w-20 bg-obsidian border border-jade rounded-lg px-2 py-1 text-cream text-xs focus:outline-none"
                            autoFocus
                          />
                          <button onClick={() => handlePriceSave(product.id)} className="p-1 rounded bg-jade text-obsidian"><Check className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setEditingPriceId(null)} className="p-1 rounded bg-surface-light text-sage"><X className="w-3.5 h-3.5" /></button>
                        </div>
                      ) : (
                        <div 
                          onClick={() => {
                            setEditingPriceId(product.id)
                            setTempPrice(product.pricePerUnit.toString())
                          }}
                          className="cursor-pointer hover:underline inline-flex items-center gap-1"
                          title="Click to edit price"
                        >
                          <span>฿{product.pricePerUnit.toLocaleString()}</span>
                          <span className="text-[10px] text-sage font-normal">/{product.unitType}</span>
                        </div>
                      )}
                    </td>

                    {/* 1-Tap Availability Switch */}
                    <td className="py-3 px-6">
                      <button
                        onClick={() => handleToggleAvailability(product.id, product.isAvailable)}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold transition flex items-center gap-1.5 w-fit ${
                          product.isAvailable
                            ? 'bg-jade/20 border border-jade/40 text-jade hover:bg-jade/30'
                            : 'bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${product.isAvailable ? 'bg-jade animate-pulse' : 'bg-red-400'}`} />
                        <span>{product.isAvailable ? 'In Stock' : 'Out of Stock'}</span>
                      </button>
                    </td>

                    <td className="py-3 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setCurrentProduct(product)
                            setIsModalOpen(true)
                          }}
                          className="p-2 rounded-xl bg-obsidian border border-border hover:border-jade text-sage hover:text-cream transition"
                          title="Edit Product"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 rounded-xl bg-obsidian border border-border hover:border-red-500 text-sage hover:text-red-400 transition"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        </>
        )}

        {/* ─── Members Tab ─── */}
        {activeTab === 'members' && (
          <div className="flex flex-col gap-4 flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold font-serif text-cream flex items-center gap-2">
                <Users className="w-4 h-4 text-jade" />
                {lang === 'en' ? 'Weed Walker Members' : 'สมาชิก Weed Walker'}
                <span className="text-[10px] text-sage font-normal">({members.length} total)</span>
              </h3>
              <button
                onClick={() => {
                  setCurrentMember({ tier: 'bronze', points: 0 })
                  setMemberModal(true)
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-jade hover:bg-jade-dark text-obsidian font-bold text-xs shadow-lg shadow-jade/20 transition"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'Add Member' : 'เพิ่มสมาชิก'}</span>
              </button>
            </div>

            <div className="glass-panel rounded-3xl border border-border overflow-hidden shadow-xl flex-1 flex flex-col">
              <div className="overflow-x-auto flex-1">
                {members.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-sage">
                    <Users className="w-12 h-12 mb-3 opacity-30" />
                    <p className="text-sm font-medium">{lang === 'en' ? 'No members imported yet' : 'ยังไม่มีสมาชิก'}</p>
                    <p className="text-[10px] mt-1">{lang === 'en' ? 'Run the import script or add manually' : 'รันสคริปต์นำเข้าหรือเพิ่มด้วยตนเอง'}</p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse text-xs text-sage">
                    <thead className="bg-obsidian/80 border-b border-border uppercase text-[10px] tracking-wider text-sage sticky top-0">
                      <tr>
                        <th className="py-3 px-4">{lang === 'en' ? 'Name' : 'ชื่อ'}</th>
                        <th className="py-3 px-4"><Phone className="w-3 h-3 inline" /> {lang === 'en' ? 'Phone' : 'เบอร์โทร'}</th>
                        <th className="py-3 px-4"><Mail className="w-3 h-3 inline" /> {lang === 'en' ? 'Email' : 'อีเมล'}</th>
                        <th className="py-3 px-4"><Award className="w-3 h-3 inline" /> {lang === 'en' ? 'Tier' : 'ระดับ'}</th>
                        <th className="py-3 px-4"><DollarSign className="w-3 h-3 inline" /> {lang === 'en' ? 'Points' : 'คะแนน'}</th>
                        <th className="py-3 px-4"><Calendar className="w-3 h-3 inline" /> {lang === 'en' ? 'Last Visit' : 'มาล่าสุด'}</th>
                        <th className="py-3 px-4 text-right">{lang === 'en' ? 'Actions' : 'จัดการ'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {members.map(m => (
                        <tr key={m.id} className="hover:bg-surface-light/40 transition">
                          <td className="py-2.5 px-4 font-semibold text-cream">{m.name}</td>
                          <td className="py-2.5 px-4">{m.phone || '—'}</td>
                          <td className="py-2.5 px-4 text-[10px]">{m.email || '—'}</td>
                          <td className="py-2.5 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              m.tier === 'platinum' ? 'bg-purple-500/20 text-purple-300' :
                              m.tier === 'gold' ? 'bg-champagne/20 text-champagne' :
                              m.tier === 'silver' ? 'bg-gray-400/20 text-gray-300' :
                              'bg-amber-600/20 text-amber-300'
                            }`}>
                              {m.tier}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 font-semibold text-champagne">{m.points.toLocaleString()}</td>
                          <td className="py-2.5 px-4 text-[10px]">{m.lastVisit ? new Date(m.lastVisit).toLocaleDateString() : '—'}</td>
                          <td className="py-2.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={async () => {
                                  setCurrentMember(m)
                                  setMemberModal(true)
                                }}
                                className="p-1.5 rounded-lg bg-obsidian border border-border hover:border-jade text-sage hover:text-cream transition"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={async () => {
                                  if (confirm(lang === 'en' ? 'Delete this member?' : 'ลบสมาชิกนี้?')) {
                                    await deleteMember(m.id)
                                    setMembers(prev => prev.filter(x => x.id !== m.id))
                                    triggerToast(lang === 'en' ? 'Member deleted' : 'ลบสมาชิกแล้ว')
                                  }
                                }}
                                className="p-1.5 rounded-lg bg-obsidian border border-border hover:border-red-500 text-sage hover:text-red-400 transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─── Transactions Tab ─── */}
        {activeTab === 'transactions' && (
          <div className="flex flex-col gap-4 flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold font-serif text-cream flex items-center gap-2">
                <Receipt className="w-4 h-4 text-jade" />
                {lang === 'en' ? 'Transaction History' : 'ประวัติการขาย'}
                <span className="text-[10px] text-sage font-normal">({transactions.length} total)</span>
              </h3>
              <button
                onClick={() => {
                  setCurrentTx({ status: 'completed', txType: 'sale', amount: 0, pointsEarned: 0 })
                  setTxModal(true)
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-jade hover:bg-jade-dark text-obsidian font-bold text-xs shadow-lg shadow-jade/20 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'Add Transaction' : 'เพิ่มรายการ'}</span>
              </button>
            </div>

            <div className="glass-panel rounded-3xl border border-border overflow-hidden shadow-xl flex-1 flex flex-col">
              <div className="overflow-x-auto flex-1">
                {transactions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-sage">
                    <Receipt className="w-12 h-12 mb-3 opacity-30" />
                    <p className="text-sm font-medium">{lang === 'en' ? 'No transactions yet' : 'ยังไม่มีรายการขาย'}</p>
                    <p className="text-[10px] mt-1">{lang === 'en' ? 'Import from Silompos or add manually' : 'นำเข้าจาก Silompos หรือเพิ่มด้วยตนเอง'}</p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse text-xs text-sage">
                    <thead className="bg-obsidian/80 border-b border-border uppercase text-[10px] tracking-wider text-sage sticky top-0">
                      <tr>
                        <th className="py-3 px-4">{lang === 'en' ? 'Date' : 'วันที่'}</th>
                        <th className="py-3 px-4">{lang === 'en' ? 'Receipt' : 'ใบเสร็จ'}</th>
                        <th className="py-3 px-4">{lang === 'en' ? 'Customer' : 'ลูกค้า'}</th>
                        <th className="py-3 px-4">{lang === 'en' ? 'Type' : 'ประเภท'}</th>
                        <th className="py-3 px-4 text-right">{lang === 'en' ? 'Amount' : 'ยอดเงิน'}</th>
                        <th className="py-3 px-4 text-right">{lang === 'en' ? 'Points' : 'คะแนน'}</th>
                        <th className="py-3 px-4 text-right">{lang === 'en' ? 'Actions' : 'จัดการ'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {transactions.map(tx => (
                        <tr key={tx.id} className="hover:bg-surface-light/40 transition">
                          <td className="py-2.5 px-4 text-[10px]">{new Date(tx.txDate).toLocaleDateString()}</td>
                          <td className="py-2.5 px-4 font-mono text-[10px] text-champagne">{tx.receiptNumber}</td>
                          <td className="py-2.5 px-4 font-semibold text-cream">{tx.memberName}</td>
                          <td className="py-2.5 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              tx.txType === 'sale' ? 'bg-jade/20 text-jade' :
                              tx.txType === 'return' ? 'bg-red-500/20 text-red-400' :
                              'bg-blue-500/20 text-blue-300'
                            }`}>
                              {tx.txType}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-right font-semibold text-champagne">฿{tx.amount.toLocaleString()}</td>
                          <td className="py-2.5 px-4 text-right">+{tx.pointsEarned}</td>
                          <td className="py-2.5 px-4 text-right">
                            <button
                              onClick={async () => {
                                if (confirm(lang === 'en' ? 'Delete this transaction?' : 'ลบรายการนี้?')) {
                                  await deleteTransaction(tx.id)
                                  setTransactions(prev => prev.filter(x => x.id !== tx.id))
                                  triggerToast(lang === 'en' ? 'Transaction deleted' : 'ลบรายการแล้ว')
                                }
                              }}
                              className="p-1.5 rounded-lg bg-obsidian border border-border hover:border-red-500 text-sage hover:text-red-400 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Product Create / Edit Modal */}
      {isModalOpen && currentProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian/90 backdrop-blur-md p-4 overflow-y-auto">
          <div className="max-w-2xl w-full glass-panel p-6 sm:p-8 rounded-3xl border border-border shadow-2xl my-8">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
              <h3 className="text-lg font-bold font-serif text-cream">
                {currentProduct.id ? t.editProduct : t.addProduct}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-obsidian border border-border flex items-center justify-center text-sage hover:text-cream"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-sage mb-1">{t.nameEn} *</label>
                  <input
                    type="text"
                    required
                    value={currentProduct.nameEn || ''}
                    onChange={e => setCurrentProduct({ ...currentProduct, nameEn: e.target.value })}
                    className="w-full bg-obsidian border border-border rounded-xl px-3 py-2.5 text-cream focus:outline-none focus:border-jade"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-sage mb-1">{t.nameTh}</label>
                  <input
                    type="text"
                    value={currentProduct.nameTh || ''}
                    onChange={e => setCurrentProduct({ ...currentProduct, nameTh: e.target.value })}
                    className="w-full bg-obsidian border border-border rounded-xl px-3 py-2.5 text-cream focus:outline-none focus:border-jade"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-sage mb-1">{t.category} *</label>
                  <select
                    required
                    value={currentProduct.categoryId || categories[0]?.id}
                    onChange={e => setCurrentProduct({ ...currentProduct, categoryId: e.target.value })}
                    className="w-full bg-obsidian border border-border rounded-xl px-3 py-2.5 text-cream focus:outline-none focus:border-jade"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.nameEn}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-sage mb-1">{t.price} (THB) *</label>
                  <input
                    type="number"
                    required
                    value={currentProduct.pricePerUnit || ''}
                    onChange={e => setCurrentProduct({ ...currentProduct, pricePerUnit: parseFloat(e.target.value) })}
                    className="w-full bg-obsidian border border-border rounded-xl px-3 py-2.5 text-cream focus:outline-none focus:border-jade"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-sage mb-1">{t.unit}</label>
                  <select
                    value={currentProduct.unitType || 'gram'}
                    onChange={e => setCurrentProduct({ ...currentProduct, unitType: e.target.value })}
                    className="w-full bg-obsidian border border-border rounded-xl px-3 py-2.5 text-cream focus:outline-none focus:border-jade"
                  >
                    <option value="gram">gram</option>
                    <option value="piece">piece</option>
                    <option value="can">can</option>
                    <option value="pre-roll">pre-roll</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-sage mb-1">THC %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={currentProduct.thcPercent || 0}
                    onChange={e => setCurrentProduct({ ...currentProduct, thcPercent: parseFloat(e.target.value) })}
                    className="w-full bg-obsidian border border-border rounded-xl px-3 py-2.5 text-cream focus:outline-none focus:border-jade"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-sage mb-1">CBD %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={currentProduct.cbdPercent || 0}
                    onChange={e => setCurrentProduct({ ...currentProduct, cbdPercent: parseFloat(e.target.value) })}
                    className="w-full bg-obsidian border border-border rounded-xl px-3 py-2.5 text-cream focus:outline-none focus:border-jade"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-sage mb-1">{t.cultivation}</label>
                  <input
                    type="text"
                    value={currentProduct.cultivation || ''}
                    onChange={e => setCurrentProduct({ ...currentProduct, cultivation: e.target.value })}
                    className="w-full bg-obsidian border border-border rounded-xl px-3 py-2.5 text-cream focus:outline-none focus:border-jade"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-sage mb-1">{t.imageUrl}</label>
                <input
                  type="text"
                  value={currentProduct.imageUrl || ''}
                  onChange={e => setCurrentProduct({ ...currentProduct, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-obsidian border border-border rounded-xl px-3 py-2.5 text-cream focus:outline-none focus:border-jade"
                />
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-obsidian border border-border text-sage hover:text-cream font-medium transition"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-jade hover:bg-jade-dark text-obsidian font-bold shadow-lg shadow-jade/20 transition"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Member Modal ─── */}
      {memberModal && currentMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian/90 backdrop-blur-md p-4 overflow-y-auto">
          <div className="max-w-lg w-full glass-panel p-6 rounded-3xl border border-border shadow-2xl my-8">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
              <h3 className="text-base font-bold font-serif text-cream flex items-center gap-2">
                <Users className="w-4 h-4 text-jade" />
                {currentMember.id ? (lang === 'en' ? 'Edit Member' : 'แก้ไขสมาชิก') : (lang === 'en' ? 'Add Member' : 'เพิ่มสมาชิก')}
              </h3>
              <button onClick={() => setMemberModal(false)} className="w-8 h-8 rounded-full bg-obsidian border border-border flex items-center justify-center text-sage hover:text-cream">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault()
              if (!currentMember.name) return
              const res = await upsertMember(currentMember)
              if (res.success) {
                const fresh = await getMembers()
                setMembers(fresh as any)
                setMemberModal(false)
                setCurrentMember(null)
                triggerToast(lang === 'en' ? 'Member saved' : 'บันทึกสมาชิกแล้ว')
              }
            }} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-sage mb-1">{lang === 'en' ? 'Name *' : 'ชื่อ *'}</label>
                  <input required type="text" value={currentMember.name || ''} onChange={e => setCurrentMember({...currentMember, name: e.target.value})} className="w-full bg-obsidian border border-border rounded-xl px-3 py-2 text-cream focus:outline-none focus:border-jade" />
                </div>
                <div>
                  <label className="block font-semibold text-sage mb-1">{lang === 'en' ? 'Phone' : 'เบอร์โทร'}</label>
                  <input type="text" value={currentMember.phone || ''} onChange={e => setCurrentMember({...currentMember, phone: e.target.value})} className="w-full bg-obsidian border border-border rounded-xl px-3 py-2 text-cream focus:outline-none focus:border-jade" />
                </div>
                <div>
                  <label className="block font-semibold text-sage mb-1">{lang === 'en' ? 'Email' : 'อีเมล'}</label>
                  <input type="email" value={currentMember.email || ''} onChange={e => setCurrentMember({...currentMember, email: e.target.value})} className="w-full bg-obsidian border border-border rounded-xl px-3 py-2 text-cream focus:outline-none focus:border-jade" />
                </div>
                <div>
                  <label className="block font-semibold text-sage mb-1">{lang === 'en' ? 'Tier' : 'ระดับ'}</label>
                  <select value={currentMember.tier || 'bronze'} onChange={e => setCurrentMember({...currentMember, tier: e.target.value})} className="w-full bg-obsidian border border-border rounded-xl px-3 py-2 text-cream focus:outline-none focus:border-jade">
                    <option value="bronze">Bronze</option>
                    <option value="silver">Silver</option>
                    <option value="gold">Gold</option>
                    <option value="platinum">Platinum</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-sage mb-1">{lang === 'en' ? 'Points' : 'คะแนน'}</label>
                  <input type="number" value={currentMember.points || 0} onChange={e => setCurrentMember({...currentMember, points: parseInt(e.target.value) || 0})} className="w-full bg-obsidian border border-border rounded-xl px-3 py-2 text-cream focus:outline-none focus:border-jade" />
                </div>
                <div>
                  <label className="block font-semibold text-sage mb-1">{lang === 'en' ? 'Channel' : 'ช่องทาง'}</label>
                  <input type="text" value={currentMember.channel || ''} onChange={e => setCurrentMember({...currentMember, channel: e.target.value})} className="w-full bg-obsidian border border-border rounded-xl px-3 py-2 text-cream focus:outline-none focus:border-jade" />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-sage mb-1">{lang === 'en' ? 'Notes' : 'หมายเหตุ'}</label>
                <textarea value={currentMember.notes || ''} onChange={e => setCurrentMember({...currentMember, notes: e.target.value})} rows={2} className="w-full bg-obsidian border border-border rounded-xl px-3 py-2 text-cream focus:outline-none focus:border-jade resize-none" />
              </div>
              <div className="pt-3 border-t border-border flex items-center justify-end gap-3">
                <button type="button" onClick={() => setMemberModal(false)} className="px-4 py-2 rounded-xl bg-obsidian border border-border text-sage hover:text-cream font-medium transition">{t.cancel}</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-jade hover:bg-jade-dark text-obsidian font-bold shadow-lg shadow-jade/20 transition">{t.save}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Transaction Modal ─── */}
      {txModal && currentTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian/90 backdrop-blur-md p-4 overflow-y-auto">
          <div className="max-w-lg w-full glass-panel p-6 rounded-3xl border border-border shadow-2xl my-8">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
              <h3 className="text-base font-bold font-serif text-cream flex items-center gap-2">
                <Receipt className="w-4 h-4 text-jade" />
                {lang === 'en' ? 'Add Transaction' : 'เพิ่มรายการขาย'}
              </h3>
              <button onClick={() => setTxModal(false)} className="w-8 h-8 rounded-full bg-obsidian border border-border flex items-center justify-center text-sage hover:text-cream">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault()
              if (!currentTx.memberName || !currentTx.receiptNumber) return
              const res = await upsertTransaction(currentTx)
              if (res.success) {
                const fresh = await getTransactions()
                setTransactions(fresh as any)
                setTxModal(false)
                setCurrentTx(null)
                triggerToast(lang === 'en' ? 'Transaction saved' : 'บันทึกรายการแล้ว')
              }
            }} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-sage mb-1">{lang === 'en' ? 'Customer Name *' : 'ชื่อลูกค้า *'}</label>
                  <input required type="text" value={currentTx.memberName || ''} onChange={e => setCurrentTx({...currentTx, memberName: e.target.value})} className="w-full bg-obsidian border border-border rounded-xl px-3 py-2 text-cream focus:outline-none focus:border-jade" />
                </div>
                <div>
                  <label className="block font-semibold text-sage mb-1">{lang === 'en' ? 'Receipt # *' : 'เลขใบเสร็จ *'}</label>
                  <input required type="text" value={currentTx.receiptNumber || ''} onChange={e => setCurrentTx({...currentTx, receiptNumber: e.target.value})} className="w-full bg-obsidian border border-border rounded-xl px-3 py-2 text-cream focus:outline-none focus:border-jade" />
                </div>
                <div>
                  <label className="block font-semibold text-sage mb-1">{lang === 'en' ? 'Amount (THB)' : 'ยอดเงิน (บาท)'}</label>
                  <input type="number" step="0.01" value={currentTx.amount || 0} onChange={e => setCurrentTx({...currentTx, amount: parseFloat(e.target.value) || 0})} className="w-full bg-obsidian border border-border rounded-xl px-3 py-2 text-cream focus:outline-none focus:border-jade" />
                </div>
                <div>
                  <label className="block font-semibold text-sage mb-1">{lang === 'en' ? 'Points Earned' : 'คะแนนที่ได้รับ'}</label>
                  <input type="number" value={currentTx.pointsEarned || 0} onChange={e => setCurrentTx({...currentTx, pointsEarned: parseInt(e.target.value) || 0})} className="w-full bg-obsidian border border-border rounded-xl px-3 py-2 text-cream focus:outline-none focus:border-jade" />
                </div>
                <div>
                  <label className="block font-semibold text-sage mb-1">{lang === 'en' ? 'Type' : 'ประเภท'}</label>
                  <select value={currentTx.txType || 'sale'} onChange={e => setCurrentTx({...currentTx, txType: e.target.value})} className="w-full bg-obsidian border border-border rounded-xl px-3 py-2 text-cream focus:outline-none focus:border-jade">
                    <option value="sale">Sale</option>
                    <option value="return">Return</option>
                    <option value="redeem">Redeem</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-sage mb-1">{lang === 'en' ? 'Status' : 'สถานะ'}</label>
                  <select value={currentTx.status || 'completed'} onChange={e => setCurrentTx({...currentTx, status: e.target.value})} className="w-full bg-obsidian border border-border rounded-xl px-3 py-2 text-cream focus:outline-none focus:border-jade">
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <div className="pt-3 border-t border-border flex items-center justify-end gap-3">
                <button type="button" onClick={() => setTxModal(false)} className="px-4 py-2 rounded-xl bg-obsidian border border-border text-sage hover:text-cream font-medium transition">{t.cancel}</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-jade hover:bg-jade-dark text-obsidian font-bold shadow-lg shadow-jade/20 transition">{t.save}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-jade text-obsidian font-bold text-xs shadow-2xl flex items-center space-x-2 animate-bounce">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  )
}
