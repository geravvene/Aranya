const fs = require('fs');
const path = require('path');
const https = require('https');

const images = [
  { name: 'cannabis-1.jpg', id: '1603909223429-69bb7101f420' },
  { name: 'cannabis-2.jpg', id: '1581788762744-93fb7f949c86' },
  { name: 'cannabis-3.jpg', id: '1527661591475-527312dd65f5' },
  { name: 'cannabis-4.jpg', id: '1536939459926-3010208dd5eb' },
  { name: 'cannabis-5.jpg', id: '1563245372-f21724e3856d' },
  { name: 'cannabis-7.jpg', id: '1579684385127-1ef15d508118' },
  { name: 'cannabis-8.jpg', id: '1534447677768-be436bb09401' },
  { name: 'cannabis-9.jpg', id: '1550989460-0adf9ea622e2' },
  { name: 'cannabis-10.jpg', id: '1512496015851-a90fb38ba796' },
  { name: 'cannabis-11.jpg', id: '1518531933037-91b2f5f229cc' },
  { name: 'cannabis-14.jpg', id: '1526738549149-8e07eca6c147' },
  { name: 'cannabis-15.jpg', id: '1542838132-92c53300491e' },
  { name: 'cannabis-16.jpg', id: '1463936575829-25148e1db1b8' },
  { name: 'cannabis-17.jpg', id: '1509198397868-475647b2a1e5' },
  { name: 'cannabis-18.jpg', id: '1516253593875-bd7ba052fbc5' },
  { name: 'merch-1.jpg', id: '1521572267360-ee0c2909d518' },
  { name: 'merch-2.jpg', id: '1607613009820-a29f7bb81c04' },
];

const targetDir = path.join(__dirname, '../public/images');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        downloadImage(res.headers.location, filepath).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to get '${url}'' (${res.statusCode})`));
        return;
      }
      const fileStream = fs.createWriteStream(filepath);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });
    }).on('error', reject);
  });
}

async function run() {
  for (const img of images) {
    const url = `https://images.unsplash.com/photo-${img.id}?auto=format&fit=crop&w=800&q=80`;
    const filepath = path.join(targetDir, img.name);
    console.log(`Downloading ${img.name} from Unsplash...`);
    try {
      await downloadImage(url, filepath);
      console.log(`Successfully downloaded ${img.name}`);
    } catch (err) {
      console.error(`Error downloading ${img.name}:`, err.message);
    }
  }
  console.log('All image downloads completed.');
}

run();
