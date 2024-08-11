import {
  StreamingTextResponse,
  createStreamDataTransformer
} from 'ai';
import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { HttpResponseOutputParser } from 'langchain/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';
import { formatDocumentsAsString } from 'langchain/util/document';
import { JSONLoader } from 'langchain/document_loaders/fs/json';

const loader = new JSONLoader(
  "app/data/data.json",
  [
    "/state",
    "/code",
    "/nickname",
    "/website",
    "/admission_date",
    "/admission_number",
    "/capital_city",
    "/capital_url",
    "/population",
    "/population_rank",
    "/area_in_sq_miles",
    "/timezone",
    "/largest_city",
    "/median_household_income",
    "/poverty_rate",
    "/current_governor",
    "/senators",
    "/house_representatives",
    "/major_industries",
    "/top_exports",
    "/major_universities",
    "/state_university_system",
    "/popular_tourist_spots",
    "/state_parks",
    "/major_airports",
    "/interstate_highways",
    "/constitution_url",
    "/state_flag_url",
    "/state_seal_url",
    "/map_image_url",
    "/landscape_background_url",
    "/skyline_background_url",
    "/twitter_url",
    "/facebook_url"
  ]
);

const TEMPLATE = `You are a polite chatbot named Screeching Eagle that answers questions based on the following context:
==============================
Context: {context}
==============================
Current conversation: {chat_history}

user: {question}
assistant:`;

export const dynamic = 'force-dynamic';

const formatMessage = (message) => {
  return `${message.role}: ${message.content}`;
};

export async function POST(req) {
  try {
    const { messages } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      throw new Error('Invalid messages format or empty messages');
    }

    const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage);
    const currentMessageContent = messages[messages.length - 1].content;

    const docs = await loader.load();
    const prompt = PromptTemplate.fromTemplate(TEMPLATE);

    const model = new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      model: 'gpt-3.5-turbo',
      temperature: 0.5,
      streaming: true,
      verbose: true,
    });

    const parser = new HttpResponseOutputParser();
    const chain = RunnableSequence.from([
      {
        question: (input) => input.question,
        chat_history: (input) => input.chat_history,
        context: () => formatDocumentsAsString(docs),
      },
      prompt,
      model,
      parser,
    ]);

    const stream = await chain.stream({
      chat_history: formattedPreviousMessages.join('\n'),
      question: currentMessageContent,
    });

    // Ensure that the stream is a ReadableStream
    if (!(stream instanceof ReadableStream)) {
      throw new Error('Stream is not of type ReadableStream');
    }

    // Create a Response object from the ReadableStream
    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain' },
    });

  } catch (error) {
    console.error('General error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: error.status ?? 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
