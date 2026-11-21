# WeedWalker — Silompos Scraper

ดึงข้อมูล Member + Transaction จาก silompos อัตโนมัติทุก 1 ชั่วโมง
เก็บลง SQLite ในเครื่อง Windows ของคุณ

---

## ติดตั้งครั้งแรก (ทำแค่ครั้งเดียว)

### 1. ติดตั้ง Node.js
ดาวน์โหลด Node.js จาก https://nodejs.org (เลือก LTS)
ติดตั้งแบบ default ได้เลย

### 2. เปิด Command Prompt หรือ PowerShell
```
Win + R → พิมพ์ cmd → Enter
```

### 3. ไปที่โฟลเดอร์ ww-scraper
```
cd Desktop\ww-scraper
```
(หรือ path ที่คุณวางโฟลเดอร์นี้)

### 4. ติดตั้ง packages
```
npm install
```

### 5. ติดตั้ง Chromium browser
```
npx playwright install chromium
```

---

## วิธีรัน

```
npm start
```

**ครั้งแรกจะเปิดหน้าต่าง Browser ขึ้นมา** — ให้คุณ Login Google ด้วยบัญชี
`weedwalker.th@gmail.com` เอง หลังจาก Login เสร็จ จะ sync อัตโนมัติ

ครั้งต่อไปจะจำ session ไว้ ไม่ต้อง Login ซ้ำ (จนกว่า session จะหมดอายุ)

---

## ข้อมูลที่เก็บ

### ตาราง members
| คอลัมน์ | ความหมาย |
|---------|----------|
| name | ชื่อสมาชิก |
| channel | ช่องทาง |
| dob | วันเกิด |
| phone | เบอร์โทร (unique key) |
| email | อีเมล |
| first_visit | เยี่ยมครั้งแรก |
| last_visit | เยี่ยมครั้งล่าสุด |
| synced_at | เวลาที่ sync |

### ตาราง transactions
| คอลัมน์ | ความหมาย |
|---------|----------|
| tx_date | วันที่ทำรายการ |
| member_name | ชื่อสมาชิก |
| receipt_number | เลขใบเสร็จ (unique key) |
| status | สถานะ |
| amount | ยอดซื้อ (บาท) |
| points_earned | คะแนนที่ได้รับ |
| tx_type | ประเภทรายการ |
| synced_at | เวลาที่ sync |

---

## ดูข้อมูลใน Database

ติดตั้ง DB Browser for SQLite: https://sqlitebrowser.org
แล้วเปิดไฟล์ `weedwalker.db` ในโฟลเดอร์นี้

---

## รันอัตโนมัติเมื่อเปิดคอม (Optional)

1. กด `Win + R` พิมพ์ `shell:startup`
2. สร้างไฟล์ `run-scraper.bat` ใน Startup folder:
```bat
@echo off
cd /d "C:\path\to\ww-scraper"
npm start
```
แทน `C:\path\to\ww-scraper` ด้วย path จริงของโฟลเดอร์

---

## แก้ปัญหาที่พบบ่อย

**Browser ไม่ขึ้น**: รัน `npx playwright install chromium` อีกครั้ง

**Session หมดอายุ**: Browser จะขึ้นมาให้ Login ใหม่เองอัตโนมัติ

**ข้อมูลไม่ครบ**: Silompos อาจเปลี่ยน HTML structure — แจ้งได้เลย
