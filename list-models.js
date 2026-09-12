const apiKey = process.env.GEMINI_API_KEY;
fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`)
  .then(res => res.json())
  .then(data => {
    const imageModels = data.models.filter(m => m.name.toLowerCase().includes('image') || m.name.toLowerCase().includes('imagen'));
    console.log(imageModels.map(m => m.name));
  });
