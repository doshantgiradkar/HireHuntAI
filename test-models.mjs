async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY is not set");
    process.exit(1);
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.error) {
      console.error("API Error:", data.error);
      return;
    }

    console.log("Available models:");
    if (data.models) {
      data.models.forEach(m => {
        console.log(`- ${m.name.replace('models/', '')} [${m.displayName}]`);
      });
    } else {
      console.log("No models found or access restricted.");
    }
  } catch (error) {
    console.error("Error fetching models:", error);
  }
}

listModels();
