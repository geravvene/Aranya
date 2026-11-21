import React from 'react'

export default function QRPage() {
  return (
    <div className="min-h-screen bg-botanical-dark text-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-botanical-card border border-botanical-border rounded-2xl p-8 shadow-2xl text-center">
        <h2 className="text-2xl font-bold text-white mb-2">ARANYA LINE OA / Lounge QR</h2>
        <p className="text-xs text-gray-400 mb-6">Scan with mobile device to open digital menu instantly.</p>
        
        <div className="bg-white p-4 rounded-2xl inline-block shadow-inner mb-6">
          <img
            src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=https://aranya-menu.vercel.app"
            alt="ARANYA Menu QR"
            className="w-52 h-52 mx-auto"
          />
        </div>

        <div className="space-y-3">
          <a
            href="/"
            className="block w-full py-3 rounded-xl bg-aranya-600 hover:bg-aranya-500 text-white font-semibold text-sm transition"
          >
            Open Live Customer Menu
          </a>
          <a
            href="/staff"
            className="block w-full py-3 rounded-xl bg-botanical-dark border border-botanical-border text-gray-300 hover:text-white font-medium text-sm transition"
          >
            Open Staff CMS Portal
          </a>
        </div>
      </div>
    </div>
  )
}
