import {
  StreamingTextResponse,
  createStreamDataTransformer
} from 'ai';
import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { HttpResponseOutputParser } from 'langchain/output_parsers';
import { CharacterTextSplitter } from 'langchain/text_splitter';
import { RunnableSequence } from '@langchain/core/runnables';
import { formatDocumentsAsString } from 'langchain/util/document';
import { JSONLoader } from 'langchain/document_loaders/fs/json';

const loader = new JSONLoader(
  "app/data/data.json",
  ["/state", "/code", "/nickname", "/website", "/admission_date", "/admission_number", "/capital_city", "/capital_url", "/population", "/population_rank", "/constitution_url", "/twitter_url"],
);

const TEMPLATE = `You are a polite chatbot that answers questions based on the following context:
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

    // Convert the response into a friendly text-stream
    const stream = await chain.stream({
      chat_history: formattedPreviousMessages.join('\n'),
      question: currentMessageContent,
    });

    // Handle and accumulate stream data
    const handleStream = async (stream) => {
      let accumulatedText = '';
      const reader = stream.getReader();
      let result = await reader.read();

      while (!result.done) {
        const chunk = new TextDecoder().decode(result.value);
        console.log('Received chunk:', chunk);
        accumulatedText += chunk;
        result = await reader.read();
      }

      console.log('Final accumulated result:', accumulatedText);
      return accumulatedText;
    };

    const responseText = await handleStream(stream);

    return new StreamingTextResponse(responseText);
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: error.status ?? 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
