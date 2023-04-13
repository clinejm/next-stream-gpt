import { ChatStream, Prompt } from "@/openai/ChatStream";

export const config = {
    runtime: 'edge',
};


const API_KEY = process.env.OPENAI_API_KEY;

if (!API_KEY) throw new Error("Missing OpenAI API Key");

export async function POST(request: Request, response: Response) {
    const { prompt } = await request.json();

    //NOTE you really should have auth here and not just use the prompt 
    // as the message without any validation but this is just leave that 
    // as an exercise for the reader

    const payload: Prompt = {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        max_tokens: 1000,
        n: 1,
    };

    const stream = await ChatStream(payload, API_KEY);
    return new Response(stream);
}

