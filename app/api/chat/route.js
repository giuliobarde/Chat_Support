import { NextResponse } from "next/server";

import OpenAI from "openai";


export function POST(req) {

    const openai = new OpenAI();
    
    async function main() {
        const completion = await openai.chat.completions.create({
          messages: [
              {"role": "system", "content": "You are a helpful assistant."},
              {"role": "user", "content": "What is a LLM?"}
            ],
          model: "gpt-4o-mini",
        });
      
        console.log(completion.choices[0]);
      }
      main();
    return NextResponse.json({message: "Hello from the server"});
}