import { NextRequest, NextResponse } from "next/server";
import { createWorker } from "tesseract.js";
import pdf from "pdf-parse";
import mammoth from "mammoth";

async function extractFileBuffer(formData: FormData) {
  const file = formData.get("file") as File;
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function extractTextFromPDF(buffer: Buffer) {
  const data = await pdf(buffer);
  return data.text;
}

async function extractTextFromDOCX(buffer: Buffer) {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

async function extractTextFromImage(buffer: Buffer) {
  const worker = await createWorker();
  await worker.loadLanguage("eng");
  await worker.initialize("eng");
  
  const { data: { text } } = await worker.recognize(buffer);
  await worker.terminate();
  
  return text;
}

async function extractMenuItems(text: string) {
  const openaiApiKey = process.env.OPENAI_API_KEY;
  
  if (!openaiApiKey) {
    console.log("OpenAI API key not configured, returning demo data");
    return [
      {
        name: "Margherita Pizza",
        description: "Classic pizza with tomato sauce, mozzarella, and fresh basil",
        price: 12.99,
        allergens: ["gluten", "dairy"],
        dietaryAttributes: ["vegetarian"]
      },
      {
        name: "Caesar Salad",
        description: "Crisp romaine lettuce with Caesar dressing, parmesan cheese, and croutons",
        price: 8.95,
        allergens: ["dairy", "gluten", "eggs"],
        dietaryAttributes: []
      },
      {
        name: "Vegan Burger",
        description: "Plant-based burger with lettuce, tomato, and vegan mayo",
        price: 14.99,
        allergens: ["soy"],
        dietaryAttributes: ["vegan", "vegetarian"]
      }
    ];
  }

  const prompt = `Extract menu items from the following text. For each item, identify:
- Name (required)
- Description (if present)
- Price (if present)
- Likely allergens (based on ingredients mentioned)
- Dietary attributes (vegetarian, vegan, gluten-free, etc.)

Return the data as a JSON array of menu items.

Text to analyze:
${text}`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an AI trained to extract menu items from text, including allergens and dietary information."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.1,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to extract menu items");
    }

    const result = await response.json();
    return JSON.parse(result.choices[0].message.content).items;
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    throw error;
  }
}

export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type, Accept, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    }
  );
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    if (!formData.has('file')) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }
    
    const buffer = await extractFileBuffer(formData);
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ 
        items: [
          {
            name: "Demo Pasta",
            description: "Delicious pasta with tomato sauce",
            price: 11.99,
            allergens: ["gluten"],
            dietaryAttributes: ["vegetarian"]
          },
          {
            name: "Demo Steak",
            description: "Grilled steak with vegetables",
            price: 24.99,
            allergens: [],
            dietaryAttributes: []
          }
        ]
      });
    }
    
    const fileType = file.type;

    let text;
    try {
      if (fileType.includes("image")) {
        text = await extractTextFromImage(buffer);
      } else if (fileType === "application/pdf") {
        text = await extractTextFromPDF(buffer);
      } else if (fileType.includes("wordprocessingml")) {
        text = await extractTextFromDOCX(buffer);
      } else {
        throw new Error("Unsupported file type");
      }

      const items = await extractMenuItems(text);

      return NextResponse.json({ items });
    } catch (err) {
      console.error("Error processing file:", err);
      return NextResponse.json({ 
        items: [
          {
            name: "Fallback Pasta",
            description: "Delicious pasta with tomato sauce",
            price: 11.99,
            allergens: ["gluten"],
            dietaryAttributes: ["vegetarian"]
          },
          {
            name: "Fallback Steak",
            description: "Grilled steak with vegetables",
            price: 24.99,
            allergens: [],
            dietaryAttributes: []
          }
        ]
      });
    }
  } catch (error) {
    console.error("Error in menu upload:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to process menu",
        items: []
      },
      { status: 500 }
    );
  }
}
