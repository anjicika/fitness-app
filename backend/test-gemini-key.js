require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testKey() {
  console.log('==================================');
  console.log('TESTING GEMINI API KEY');
  console.log('==================================');
  
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.log('\n❌ NO API KEY FOUND IN .env!\n');
    console.log('Please add to .env:');
    console.log('GEMINI_API_KEY=your_key_here');
    return;
  }
  
  console.log('Key found:', apiKey.substring(0, 20) + '...');
  console.log('\nTesting...\n');
  
  try {
    // Use gemini-pro instead of gemini-1.5-flash
    const model = genAI.getGenerativeModel(
  { model: "gemini-2.5-flash" }
);
    const result = await model.generateContent("Say hello in 5 words");
    const response = result.response;
    
    console.log('✅✅✅ API KEY IS VALID! ✅✅✅\n');
    console.log('AI Response:', response.text());
    console.log('\n==================================');
    console.log('You can now run: npm test');
    console.log('==================================\n');
    
  } catch (error) {
    console.log('❌❌❌ API KEY TEST FAILED! ❌❌❌\n');
    console.log('Error:', error.message);
    console.log('\n');
    
    if (error.message.includes('API key not valid')) {
      console.log('🔧 ISSUE: Invalid API key');
      console.log('SOLUTION: Get new key from https://aistudio.google.com/app/apikey\n');
    } else if (error.message.includes('404')) {
      console.log('🔧 ISSUE: Model not available for your API key');
      console.log('SOLUTION: Try enabling Gemini API in your Google Cloud project\n');
    } else if (error.message.includes('quota')) {
      console.log('🔧 ISSUE: Quota exceeded');
      console.log('SOLUTION: Wait a few minutes or create new API key\n');
    } else {
      console.log('🔧 UNKNOWN ISSUE');
      console.log('Full error details:', error);
    }
  }
}

testKey();