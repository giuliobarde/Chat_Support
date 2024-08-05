import { NextResponse } from "next/server";
import OpenAI from "openai";

const systemPrompt = ``;

export async function POST(req) {
    try {
        // Read raw body
        const rawBody = await req.text();

        // Parse JSON body
        let data;
        try {
            data = rawBody ? JSON.parse(rawBody) : {};
        } catch (parseError) {
            console.error('Error parsing request body:', parseError);
            return NextResponse.json(
                { error: 'Invalid JSON' }, 
                { status: 400 }
            );
        }

        // Initialize OpenAI
        const openai = new OpenAI();

        // Generate a completion
        const completion = await openai.chat.completions.create({
            messages: [
                {"role": "system", "content": systemPrompt}, ...data],
            model: "gpt-3.5-turbo",
        });

        // Check for valid choices
        if (!completion.choices || completion.choices.length === 0) {
            throw new Error('No choices returned from OpenAI API');
        }

        // Return response
        return NextResponse.json(
            { message: completion.choices[0].message.content }, 
            { status: 200 }
        );

    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json(
            { error: 'An error occurred' }, 
            { status: 500 }
        );
    }
}
