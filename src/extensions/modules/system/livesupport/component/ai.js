export const generateCustomMessage = async (prompt) => {
    const apiKey = "AIzaSyB_DNNNAbBpaQ41rKHgDeL-zzGpQmjcRH4"; // Replace with your actual API key
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`;
    const headers = {
      "Content-Type": "application/json"
    };
    const body = JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ]
    });
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: headers,
        body: body
      });
      const data = await response.json();
      if (response.ok) {
        // Access the text from the first candidate's content parts
        const generatedText = data.candidates[0]?.content.parts[0]?.text.trim();
        return generatedText || "Sorry, I couldn't generate a response.";
      } else {
        console.error("Error generating message:", data);
        return "Sorry, I couldn't generate a response.";
      }
    } catch (error) {
      console.error("Network error generating message:", error);
      return "Sorry, I couldn't generate a response.";
    }
  };
  