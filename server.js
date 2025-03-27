import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json()); // Parse JSON requests

const PORT = process.env.PORT || 5000;

// API Route for Business Growth Plan
app.post("/generate-plan", async (req, res) => {
    try {
        const { B_name, location, types, description, monthly_revenue, numOfEmp, challenges, govtSchemeAvail, B_type, marketUpdt } = req.body;

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "HTTP-Referer": process.env.SITE_URL,
                "X-Title": process.env.SITE_NAME,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "model": "deepseek/deepseek-r1:free",
                "messages": [
                    {
                        "role": "user",
                        "content": `You are a visionary business strategist and growth expert. Your task is to create an actionable, comprehensive business growth plan that will help a local business become dominant in its locality.

Use the following input details to craft the plan:

- *Business Name:* ${B_name}
- *Location:* ${location}
- *Business Types:* ${types}
- *Description:* ${description || "rural, price-oriented, with zero marketing knowledge and no content creation."}
- *Monthly Revenue:* ${monthly_revenue}
- *Number of Employees:* ${numOfEmp}
- *Challenges:* ${challenges}
- *Government Scheme Availability:* ${govtSchemeAvail}
- *Business Type (Detailed):* ${B_type}
- *Market Updates/Trends:* ${marketUpdt}

Based on the above data, generate a strategic plan with clear, step-by-step guidance.

1. *Monthly Tasks:* Key tasks the business owner should implement each month.
2. *Weekly Tasks:* Short-term actionable tasks to maintain momentum.
3. *Supportive Hints:* Tips and additional recommendations to overcome challenges, including advice on market analysis, government schemes, digital marketing, and operational improvements.

Please output your response as a JSON object with exactly three keys: "monthly_task", "weekly_task", and "supportive_hints". Each key should map to a detailed text plan that is both actionable and easy to understand.

Ensure your response is in strict JSON format without any additional commentary.

Example output format:
{
  "monthly_task": "Detailed monthly tasks...",
  "weekly_task": "Detailed weekly tasks...",
  "supportive_hints": "Additional supportive hints..."
}`
                    }
                ]
            })
        });

        const data = await response.json();

        // Extract and clean response content
        const rawContent = data.choices[0]?.message?.content || "{}";
        const cleanedContent = rawContent.replace(/```json|```/g, "").trim();

        try {
            const parsedResponse = JSON.parse(cleanedContent);

            res.json({
                success: true,
                message: "Business growth plan generated successfully.",
                data: parsedResponse
            });
        } catch (error) {
            console.error("Error parsing JSON:", error);
            res.status(500).json({
                success: false,
                message: "Invalid JSON format received from AI.",
                rawResponse: cleanedContent
            });
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.toString()
        });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});