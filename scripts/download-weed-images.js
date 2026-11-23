const fs = require('fs');
const path = require('path');
const https = require('https');

// Pexels cannabis/weed themed photo IDs
const images = [
  { name: 'cannabis-1.jpg', id: '1072179' },
  { name: 'cannabis-2.jpg', id: '1072180' },
  { name: 'cannabis-3.jpg', id: '1072181' },
  { name: 'cannabis-4.jpg', id: '1072182' },
  { name: 'cannabis-5.jpg', id: '1072183' },
  { name: 'cannabis-7.jpg', id: '1072184' },
  { name: 'cannabis-8.jpg', id: '1072185' },
  { name: 'cannabis-9.jpg', id: '1072186' },
  { name: 'cannabis-10.jpg', id: '1072187' },
  { name: 'cannabis-11.jpg', id: '1072188' },
  { name: 'cannabis-14.jpg', id: '1072189' },
  { name: 'cannabis-15.jpg', id: '1072190' },
  { name: 'cannabis-16.jpg', id: '1072191' },
  { name: 'cannabis-17.jpg', id: '1072192' },
  { name: 'cannabis-18.jpg', id: '1072193' },
  { name: 'merch-1.jpg', id: '1072194' },
  { name: 'merch-2.jpg', id: '1072195' },
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
        reject(new Error(`Failed to get '${url}' (${res.statusCode})`));
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
    const url = `https://images.pexels.com/photos/${img.id}/pexels-photo-${img.id}.jpeg?auto=compress&cs=tinysrgb&w=800`;
    const filepath = path.join(targetDir, img.name);
    console.log(`Downloading ${img.name} from Pexels...`);
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