const fs = require('fs');

async function run() {
  const url = 'https://image.pollinations.ai/prompt/test?width=1280&height=720&nologo=true&model=flux-realism';
  console.log('Fetching', url);
  const res = await fetch(url);
  if (!res.ok) {
    console.error('Fetch failed');
    return;
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync('test-poll.jpg', buffer);
  console.log('Saved', buffer.length);
}
run();
