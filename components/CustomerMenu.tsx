'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  Search, Globe, QrCode, ShieldCheck, Sparkles, PhoneCall,
  CheckCircle2, X, Leaf, ChevronRight, Activity, Bell, ArrowLeft, Tablet, Lock,
  MessageCircle, ExternalLink, UserPlus
} from 'lucide-react'

interface Category {
  id: string
  slug: string
  nameEn: string
  nameTh: string
  icon?: string | null
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
  lineage?: string | null
  cureDays?: number | null
  flavors?: string[]
}

interface CustomerMenuProps {
  categories: Category[]
  initialProducts: Product[]
}

export default function CustomerMenu({ categories, initialProducts }: CustomerMenuProps) {
  const [lang, setLang] = useState<'EN' | 'TH'>('EN')
  const [verified20, setVerified20] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showQRModal, setShowQRModal] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  useEffect(() => {
    if (localStorage.getItem('aranya_verified_20') === 'true') {
      setVerified20(true)
    }
  }, [])

  const triggerToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3000)
  }

  const filteredProducts = useMemo(() => {
    return initialProducts.filter(p => {
      const matchesCat = selectedCategory === 'all' || p.categoryId === selectedCategory || p.category?.slug === selectedCategory
      const query = searchQuery.toLowerCase()
      const matchesSearch = 
        p.nameEn.toLowerCase().includes(query) ||
        p.nameTh.toLowerCase().includes(query) ||
        (p.cultivation && p.cultivation.toLowerCase().includes(query))
      return matchesCat && matchesSearch
    })
  }, [initialProducts, selectedCategory, searchQuery])

  if (!verified20) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian/95 backdrop-blur-xl p-4">
        <div className="max-w-md w-full glass-panel rounded-3xl p-6 sm:p-8 border border-border text-center shadow-2xl relative overflow-hidden">
          <div className="ambient-glow -top-24 -left-24"></div>
          <div className="w-16 h-16 rounded-2xl bg-jade/15 border border-jade/40 flex items-center justify-center mx-auto mb-6 text-jade shadow-inner">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-cream mb-3">
            {lang === 'EN' ? 'Age Verification Required' : 'ยืนยันอายุผู้ใช้บริการ'}
          </h2>
          <p className="text-sage text-xs sm:text-sm leading-relaxed mb-6 sm:mb-8">
            {lang === 'EN' 
              ? 'In compliance with Thai MOPH & DTAM regulations (No. 2), you must be 20 years or older to view cannabis botanical products.' 
              : 'ตามข้อกำหนดของกระทรวงสาธารณสุขและกรมการแพทย์แผนไทย (ฉบับที่ 2) ท่านต้องมีอายุ 20 ปีขึ้นไปจึงจะสามารถดูผลิตภัณฑ์กัญชาได้'}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => {
                localStorage.setItem('aranya_verified_20', 'true')
                setVerified20(true)
              }}
              className="w-full py-3.5 sm:py-4 px-4 bg-jade hover:bg-jade-dark text-obsidian font-bold rounded-xl shadow-lg shadow-jade/20 transition duration-200 text-sm"
            >
              {lang === 'EN' ? 'I am 20 Years or Older' : 'ฉันอายุ 20 ปีขึ้นไป'}
            </button>
            <button
              onClick={() => window.location.href = 'https://google.com'}
              className="w-full py-3 px-4 bg-transparent hover:bg-surface-light text-sage hover:text-cream font-medium rounded-xl transition duration-200 text-xs"
            >
              {lang === 'EN' ? 'Exit / Under 20' : 'ออก / ต่ำกว่า 20 ปี'}
            </button>
          </div>
          <div className="mt-6 pt-4 border-t border-border flex items-center justify-center text-[11px] text-sage gap-1.5">
            <ShieldCheck className="w-4 h-4 text-jade" />
            <span>MOPH Regulation No. 2 Compliant</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-screen w-full flex flex-col overflow-hidden bg-obsidian">
      <div className="ambient-glow -top-40 -left-40"></div>
      <div className="ambient-glow -bottom-40 -right-40"></div>

      {/* Persistent Top Switcher */}
      <header className="relative z-30 h-16 px-3 sm:px-6 glass-panel flex items-center justify-between border-b border-border flex-shrink-0 gap-2">
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
          <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-jade/20 border border-jade/40 flex items-center justify-center text-jade flex-shrink-0">
            <Leaf className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="truncate">
            <h1 className="font-serif text-sm sm:text-lg font-bold tracking-wider text-cream leading-tight truncate">ARANYA</h1>
            <p className="text-[9px] sm:text-[10px] tracking-widest uppercase text-sage truncate">Botanical Lounge</p>
          </div>
        </div>

        <div className="flex items-center space-x-1 sm:space-x-2 bg-obsidian/85 p-1 rounded-xl border border-border flex-shrink-0">
          <button 
            onClick={() => setSelectedProduct(null)}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-medium transition-all flex items-center space-x-1 ${!selectedProduct ? 'bg-jade text-obsidian font-semibold shadow-lg shadow-jade/20' : 'text-sage hover:text-cream'}`}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span className="hidden xs:inline sm:inline">{lang === 'EN' ? 'Menu' : 'เมนู'}</span>
          </button>
          <a 
            href="/staff"
            className="px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-medium transition-all flex items-center space-x-1 text-sage hover:text-cream hover:bg-surface-light"
          >
            <Lock className="w-3.5 h-3.5 text-champagne" />
            <span className="hidden xs:inline sm:inline">{lang === 'EN' ? 'CMS' : 'จัดการ'}</span>
          </a>
        </div>

        <div className="flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0">
          <button
            onClick={() => setShowQRModal(true)}
            className="h-9 w-9 sm:w-auto sm:px-3 rounded-lg glass-card text-xs text-cream flex items-center justify-center sm:space-x-2 hover:border-jade/50 transition-colors"
            title="Scan to Mobile"
          >
            <QrCode className="w-4 h-4 text-jade flex-shrink-0" />
            <span className="hidden lg:inline">{lang === 'EN' ? 'Scan to Mobile' : 'สแกนขึ้นมือถือ'}</span>
          </button>

          {/* LINE Login Button */}
          <a
            href="/api/line/login"
            className="h-9 w-9 sm:w-auto sm:px-3 rounded-lg glass-card text-xs text-cream flex items-center justify-center sm:space-x-2 hover:border-jade/50 transition-colors"
            title="Login with LINE"
          >
            <MessageCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span className="hidden lg:inline">LINE</span>
          </a>

          <button
            onClick={() => setLang(l => l === 'EN' ? 'TH' : 'EN')}
            className="h-9 px-2.5 sm:px-3 rounded-lg bg-surface-light border border-border text-[11px] sm:text-xs font-semibold text-champagne hover:border-champagne/50 transition-colors flex items-center space-x-1"
          >
            <Globe className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{lang === 'EN' ? 'TH' : 'EN'}</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      {!selectedProduct ? (
        <div className="relative z-10 flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Desktop Sidebar */}
          <aside className="hidden md:flex w-60 lg:w-64 glass-panel border-r border-border p-4 flex-col justify-between flex-shrink-0">
            <div className="space-y-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-sage" />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={lang === 'EN' ? 'Search strains...' : 'ค้นหาสายพันธุ์...'}
                  className="w-full h-10 pl-9 pr-3 bg-obsidian/60 border border-border rounded-xl text-xs text-cream placeholder-sage focus:outline-none focus:border-jade"
                />
              </div>
              <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-240px)] no-scrollbar">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full h-11 px-3 rounded-xl text-xs font-medium flex items-center justify-between transition-all ${selectedCategory === 'all' ? 'bg-jade/15 border border-jade/40 text-jade font-semibold' : 'text-sage hover:bg-surface-light hover:text-cream'}`}
                >
                  <span>{lang === 'EN' ? 'All Strains' : 'ทั้งหมด'}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] ${selectedCategory === 'all' ? 'bg-jade/20 text-jade' : 'bg-obsidian text-sage'}`}>{initialProducts.length}</span>
                </button>
                {categories.map(cat => {
                  const count = initialProducts.filter(p => p.categoryId === cat.id || p.category?.slug === cat.slug).length
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full h-11 px-3 rounded-xl text-xs font-medium flex items-center justify-between transition-all ${selectedCategory === cat.id ? 'bg-jade/15 border border-jade/40 text-jade font-semibold' : 'text-sage hover:bg-surface-light hover:text-cream'}`}
                    >
                      <span className="truncate pr-2">{lang === 'TH' ? cat.nameTh : cat.nameEn}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] flex-shrink-0 ${selectedCategory === cat.id ? 'bg-jade/20 text-jade' : 'bg-obsidian text-sage'}`}>{count}</span>
                    </button>
                  )
                })}
              </nav>
            </div>
            <div className="p-3 rounded-xl bg-surface-light border border-border text-[11px] text-sage flex items-start space-x-2">
              <ShieldCheck className="w-4 h-4 text-jade flex-shrink-0 mt-0.5" />
              <span>{lang === 'EN' ? 'MOPH Compliant • Medical Grade' : 'ปฏิบัติตามข้อกำหนด MOPH'}</span>
            </div>
          </aside>

          {/* Mobile & Square Device Category & Search Bar */}
          <div className="md:hidden glass-panel border-b border-border p-3 space-y-2.5 flex-shrink-0">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-sage" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === 'EN' ? 'Search strains...' : 'ค้นหาสายพันธุ์...'}
                className="w-full h-9 pl-9 pr-3 bg-obsidian/60 border border-border rounded-xl text-xs text-cream placeholder-sage focus:outline-none"
              />
            </div>
            <div className="flex overflow-x-auto pb-1 gap-1.5 sm:gap-2 no-scrollbar">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-[11px] font-medium transition-all ${selectedCategory === 'all' ? 'bg-jade text-obsidian font-semibold' : 'bg-surface-light text-sage'}`}
              >
                {lang === 'EN' ? 'All' : 'ทั้งหมด'} ({initialProducts.length})
              </button>
              {categories.map(cat => {
                const count = initialProducts.filter(p => p.categoryId === cat.id || p.category?.slug === cat.slug).length
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-[11px] font-medium transition-all ${selectedCategory === cat.id ? 'bg-jade text-obsidian font-semibold' : 'bg-surface-light text-sage'}`}
                  >
                    {lang === 'TH' ? cat.nameTh : cat.nameEn} ({count})
                  </button>
                )
              })}
            </div>
          </div>

          <main className="flex-1 p-3 sm:p-6 overflow-y-auto">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 pb-16 md:pb-6">
              {filteredProducts.map(p => (
                <div 
                  key={p.id}
                  onClick={() => setSelectedProduct(p)}
                  className={`glass-card rounded-2xl overflow-hidden cursor-pointer flex flex-col justify-between group ${!p.isAvailable ? 'opacity-60 grayscale' : ''}`}
                >
                  <div className="relative h-32 xs:h-36 sm:h-44 overflow-hidden bg-obsidian">
                    {p.imageUrl ? (
                      <>
                        <img src={p.imageUrl} alt={p.nameEn} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} />
                        <div className="w-full h-full hidden flex items-center justify-center text-sage"><Leaf className="w-6 h-6 sm:w-8 sm:h-8" /></div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sage"><Leaf className="w-6 h-6 sm:w-8 sm:h-8" /></div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent"></div>
                    <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                      {p.isAvailable ? (
                        <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[8px] sm:text-[10px] font-bold bg-jade/90 text-obsidian shadow-lg">AVAIL</span>
                      ) : (
                        <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[8px] sm:text-[10px] font-bold bg-red-500/80 text-white shadow-lg">OUT</span>
                      )}
                    </div>
                  </div>
                  <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between space-y-2 sm:space-y-3">
                    <div>
                      <h3 className="font-semibold text-xs sm:text-sm text-cream group-hover:text-jade transition-colors leading-tight line-clamp-1 sm:line-clamp-2">{lang === 'TH' ? p.nameTh : p.nameEn}</h3>
                      <p className="text-[9px] sm:text-[11px] text-sage mt-0.5 truncate">{p.cultivation || 'Organic'}</p>
                    </div>
                    <div className="flex items-center justify-between text-[10px] sm:text-xs border-t border-border/65 pt-2 sm:pt-3">
                      <div className="flex items-center space-x-1 sm:space-x-2 text-[9px] sm:text-[11px]">
                        <span className="text-jade font-medium">T:{p.thcPercent || 0}%</span>
                        <span className="text-sage font-bold sm:font-normal text-xs sm:text-base leading-none text-champagne">฿{p.pricePerUnit}</span>
                      </div>
                      {/* Share to LINE */}
                      <a
                        href={`https://social-plug.line.me/lineit?url=${encodeURIComponent(`https://aranya-bangkok.com/product/${p.slug}`)}&text=${encodeURIComponent(`${lang === 'TH' ? p.nameTh : p.nameEn} — ARANYA Bangkok`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-7 w-7 rounded-lg bg-green-500/20 hover:bg-green-500/40 flex items-center justify-center transition-colors"
                        title="Share to LINE"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-green-500" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {filteredProducts.length === 0 && (
              <div className="text-center py-12 sm:py-20 text-sage text-xs sm:text-sm">No botanical products found.</div>
            )}
          </main>
        </div>
      ) : (
        /* SCREEN 2: PRODUCT DETAIL & TERPENE VIEW */
        <div className="relative z-20 flex-1 p-3 sm:p-6 overflow-y-auto flex items-center justify-center bg-obsidian/90 backdrop-blur-md">
          <div className="w-full max-w-4xl my-auto glass-panel rounded-3xl border border-border overflow-hidden flex flex-col md:flex-row shadow-2xl">
            <div className="w-full md:w-1/2 relative bg-obsidian p-4 sm:p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-border">
              <div className="relative h-48 sm:h-64 md:h-full min-h-[220px] rounded-2xl overflow-hidden mb-4 border border-border/60 bg-surface">
                {selectedProduct.imageUrl ? (
                  <>
                    <img src={selectedProduct.imageUrl} alt={selectedProduct.nameEn} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} />
                    <div className="w-full h-full hidden flex items-center justify-center text-sage"><Leaf className="w-12 h-12" /></div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sage"><Leaf className="w-12 h-12" /></div>
                )}
                <div className="absolute bottom-3 left-3 right-3 p-3 glass-panel rounded-xl text-xs space-y-1">
                  <div className="flex justify-between text-sage">
                    <span>Cultivation:</span>
                    <span className="text-cream font-medium">{selectedProduct.cultivation || 'Organic Living Soil'}</span>
                  </div>
                  <div className="flex justify-between text-sage">
                    <span>Cure Duration:</span>
                    <span className="text-jade font-medium">{selectedProduct.cureDays || 21} Days Cold Cure</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedProduct(null)}
                className="h-11 w-full rounded-xl glass-card text-xs font-semibold text-cream flex items-center justify-center space-x-2 hover:bg-surface-light"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{lang === 'EN' ? 'Back to Menu' : 'กลับสู่หน้าเมนู'}</span>
              </button>
            </div>

            <div className="w-full md:w-1/2 p-4 sm:p-6 flex flex-col justify-between overflow-y-auto space-y-5 max-h-[80vh] md:max-h-[none]">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold tracking-widest text-jade uppercase">{selectedProduct.cultivation || 'Living Soil'}</span>
                  <span className="text-xs text-sage">Stock: <strong className="text-cream">{selectedProduct.stockGrams || 100}g</strong></span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold font-serif text-cream mt-1">{lang === 'TH' ? selectedProduct.nameTh : selectedProduct.nameEn}</h2>
                <p className="text-xs text-sage italic mt-0.5">Lineage: {selectedProduct.lineage || 'Heirloom Thai Landrace'}</p>

                <div className="grid grid-cols-3 gap-2 sm:gap-3 my-4">
                  <div className="p-2.5 sm:p-3 rounded-xl bg-surface border border-border text-center">
                    <span className="text-[10px] text-sage block">1 {selectedProduct.unitType}</span>
                    <span className="text-xs sm:text-sm font-bold text-champagne">฿{selectedProduct.pricePerUnit}</span>
                  </div>
                  <div className="p-2.5 sm:p-3 rounded-xl bg-surface border border-border text-center">
                    <span className="text-[10px] text-sage block">3.5 Grams</span>
                    <span className="text-xs sm:text-sm font-bold text-champagne">฿{Math.round(selectedProduct.pricePerUnit * 3.3)}</span>
                  </div>
                  <div className="p-2.5 sm:p-3 rounded-xl bg-surface border border-border text-center">
                    <span className="text-[10px] text-sage block">7 Grams</span>
                    <span className="text-xs sm:text-sm font-bold text-champagne">฿{Math.round(selectedProduct.pricePerUnit * 6.2)}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-cream flex items-center space-x-1.5">
                    <Activity className="w-3.5 h-3.5 text-jade" />
                    <span>Terpene Profile & Aromatherapy</span>
                  </h4>
                  {selectedProduct.terpenesNote && (
                    <p className="text-xs text-sage italic bg-surface p-2.5 rounded-xl border border-border">{selectedProduct.terpenesNote}</p>
                  )}
                  <div className="space-y-2">
                    {[
                      { name: 'Myrcene', val: selectedProduct.myrcene || 2.5, desc: 'Earthy / Herbal' },
                      { name: 'Limonene', val: selectedProduct.limonene || 1.8, desc: 'Citrus Zest' },
                      { name: 'Caryophyllene', val: selectedProduct.caryophyllene || 2.0, desc: 'Spicy Pepper' },
                    ].map((t, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-cream font-medium">{t.name} ({t.val}%)</span>
                          <span className="text-sage text-[10px]">{t.desc}</span>
                        </div>
                        <div className="h-2 w-full bg-obsidian rounded-full overflow-hidden border border-border">
                          <div className="h-full bg-gradient-to-r from-jade to-champagne" style={{ width: `${(t.val / 5) * 100}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="text-xs font-semibold text-cream mb-2">Flavor & Fragrance Notes</h4>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {['Sweet Mango', 'Pine Wood', 'Fresh Mint', 'Citrus Peel'].map((f, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] bg-surface-light border border-border text-sage font-medium">{f}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  onClick={() => triggerToast(lang === 'EN' ? '🔔 Budtender notified to your table!' : '🔔 แจ้งเตือนพนักงานเรียบร้อยแล้ว!')}
                  className="w-full sm:w-auto h-11 px-5 rounded-xl bg-jade text-obsidian font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-jade/20 hover:bg-jade-dark transition-all"
                >
                  <Bell className="w-4 h-4" />
                  <span>{lang === 'EN' ? 'Ring Service Bell' : 'เรียกพนักงานบริการ'}</span>
                </button>
                <div className="flex items-center gap-2">
                  {/* Share to LINE */}
                  <a
                    href={`https://social-plug.line.me/lineit?url=${encodeURIComponent(`https://aranya-bangkok.com/product/${selectedProduct.slug}`)}&text=${encodeURIComponent(`${lang === 'TH' ? selectedProduct.nameTh : selectedProduct.nameEn} — ARANYA Bangkok`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-10 px-4 rounded-xl bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400 text-xs font-medium flex items-center justify-center space-x-1.5 transition-all"
                    title="Share to LINE"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{lang === 'EN' ? 'Share to LINE' : 'แชร์ไป LINE'}</span>
                  </a>
                  <span className="text-[10px] text-sage text-center sm:text-right">In-store table consultation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR MODAL — LINE OA */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 bg-obsidian/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-3xl border border-border max-w-sm w-full text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-green-500/15 border border-green-500/30 flex items-center justify-center mx-auto mb-2">
              <MessageCircle className="w-7 h-7 text-green-500" />
            </div>
            <h3 className="font-bold text-cream text-base">{lang === 'EN' ? 'Scan to Mobile (LINE OA)' : 'สแกนผ่านมือถือ (LINE OA)'}</h3>
            
            {/* LINE OA QR Code */}
            <div className="p-3 bg-white rounded-2xl inline-block mx-auto">
              <img
                src={process.env.NEXT_PUBLIC_LINE_OA_QR_URL || 'https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=https://aranya-bangkok.com'}
                alt="LINE OA QR"
                className="w-40 h-40"
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=https://aranya-bangkok.com' }}
              />
            </div>
            
            <p className="text-xs text-sage">{lang === 'EN' ? 'Scan this QR code with your LINE app to add ARANYA as a friend and access our digital menu.' : 'สแกนคิวอาร์โค้ดนี้ด้วยแอป LINE เพื่อเพิ่ม ARANYA เป็นเพื่อนและเข้าถึงเมนูดิจิทัลของเรา'}</p>
            
            {/* Add LINE OA Friend Button */}
            <a
              href={process.env.NEXT_PUBLIC_LINE_OA_QR_URL || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-11 rounded-xl bg-green-500 text-white font-bold text-xs flex items-center justify-center space-x-2 hover:bg-green-600 transition-all shadow-lg"
            >
              <UserPlus className="w-4 h-4" />
              <span>{lang === 'EN' ? 'Add LINE OA Friend' : 'เพิ่มเพื่อน LINE OA'}</span>
            </a>

            <button
              onClick={() => setShowQRModal(false)}
              className="w-full h-10 rounded-xl glass-card text-xs text-cream font-medium hover:bg-surface-light"
            >
              {lang === 'EN' ? 'Close' : 'ปิด'}
            </button>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-jade text-obsidian font-bold text-xs shadow-2xl flex items-center space-x-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  )
}
