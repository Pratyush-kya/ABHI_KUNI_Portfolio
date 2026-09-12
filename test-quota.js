const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const models = [
  'gemini-2.5-flash-image',
  'gemini-3.1-flash-lite-image',
  'gemini-3-pro-image-preview',
  'gemini-3-pro-image'
];

async function testModels() {
  let foundWorking = false;
  for (const modelName of models) {
    console.log(`Testing ${modelName}...`);
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: "A tiny cute cat" }] }],
        generationConfig: { responseModalities: ['IMAGE', 'TEXT'] }
      });
      console.log(`✅ ${modelName} WORKED!`);
      foundWorking = true;
      break;
    } catch (e) {
      console.log(`❌ ${modelName} failed: ${e.message.split('\n')[0]}`);
    }
  }
  if (!foundWorking) {
    console.log("No models worked on the free tier.");
  }
}
testModels();
