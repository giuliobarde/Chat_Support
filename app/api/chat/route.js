import { NextResponse } from "next/server";
import OpenAI from "openai";

const systemPrompt = `Hello! Thank you for reaching out to Headstarter. We're here to help you make the most out of your interview practice experience. Whether you have questions about using our platform, need assistance with technical issues, or are looking for guidance on how to get the best feedback from our AI, we're here for you!

Please provide details about your issue or question:

Account & Login Issues: If you're having trouble with your account or logging in, let us know your username or email associated with the account and any error messages you’re seeing.

Technical Problems: For issues related to our interview practice sessions, such as bugs, glitches, or difficulties with the AI, please describe the problem in detail and include any relevant screenshots if possible.

Feedback and Performance: If you need help interpreting the feedback you received from the AI or want tips on improving your practice sessions, share the specifics of the feedback and your current goals.

General Inquiries: For any other questions about features, subscription plans, or our services, just ask!

Our support team is dedicated to providing you with a smooth and effective practice experience. We'll do our best to respond promptly and help you get back on track. Thank you for using Headstarter, and happy practicing!`;

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
