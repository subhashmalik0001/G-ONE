// Test SambaNova API directly
const testSambaNova = async () => {
  try {
    const response = await fetch('https://api.sambanova.ai/v1/models', {
      headers: {
        'Authorization': 'Bearer 34b3691e-062e-4043-bfdc-b4b65453da8f'
      }
    });
    const data = await response.json();
    console.log('✅ SambaNova models loaded successfully:', data.data?.length, 'models available');
  } catch (error) {
    console.error('❌ SambaNova error:', error);
  }
};

// Test Gemini API directly  
const testGemini = async () => {
  const apiKey = process.env.VITE_GOOGLE_AI_STUDIO_KEY || 'AIzaSyD69i5YwMDcl0lahd-XA4gnmOpI_wIjkD4';
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Respond with "Gemini API is fully operational"' }] }]
      })
    });
    const data = await response.json();
    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.log('✅ Gemini API Response:', data.candidates[0].content.parts[0].text.trim());
    } else {
      console.log('❌ Gemini API unexpected response:', data);
    }
  } catch (error) {
    console.error('❌ Gemini API error:', error);
  }
};

testSambaNova();
testGemini();