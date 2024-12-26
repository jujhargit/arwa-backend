const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config()
const KEY = process.env.GEMINI_API_KEY;

gemini = async(content)=>{
    
    const genAI = new GoogleGenerativeAI(KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = content;
    
    const result = await model.generateContent(prompt);
    console.log(result.response.text());
    return result.response.text();
}