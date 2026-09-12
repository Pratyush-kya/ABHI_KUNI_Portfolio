const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceKey);

async function checkBucket() {
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) {
    console.error('Error listing buckets:', listError);
    return;
  }

  const artworkBucket = buckets.find(b => b.name === 'song-artwork');
  
  if (!artworkBucket) {
    console.log('Bucket "song-artwork" not found. Creating it...');
    const { data, error: createError } = await supabase.storage.createBucket('song-artwork', {
      public: true,
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg'],
      fileSizeLimit: 10485760 // 10MB
    });
    
    if (createError) {
      console.error('Failed to create bucket:', createError);
    } else {
      console.log('Successfully created public bucket "song-artwork"!');
    }
  } else {
    console.log('Bucket "song-artwork" exists.');
    if (!artworkBucket.public) {
      console.log('Bucket is private. Making it public...');
      const { data, error: updateError } = await supabase.storage.updateBucket('song-artwork', {
        public: true
      });
      if (updateError) {
        console.error('Failed to update bucket to public:', updateError);
      } else {
        console.log('Successfully updated bucket to public!');
      }
    } else {
      console.log('Bucket is already public. Everything looks good!');
    }
  }
}

checkBucket();
