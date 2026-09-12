const sharp = require('sharp');
const fs = require('fs');

async function run() {
  const res = await fetch('https://image.pollinations.ai/prompt/test?width=1920&height=1080');
  const buffer = Buffer.from(await res.arrayBuffer());
  
  const metadata = await sharp(buffer).metadata();
  const cropHeight = Math.max(1, metadata.height - 40); // remove 40px from bottom
  
  const cropped = await sharp(buffer)
    .extract({ width: metadata.width, height: cropHeight, left: 0, top: 0 })
    .toBuffer();
    
  fs.writeFileSync('test-cropped.jpg', cropped);
  console.log('Cropped successfully, new size:', metadata.width, cropHeight);
}
run();
