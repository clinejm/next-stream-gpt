import {
    createParser,
    ParsedEvent,
    ReconnectInterval
} from "eventsource-parser";


export type ChatGPTMessage = {
    role: "user" | "system";
    content: string;
}

export type Prompt = {
    model: string;
    messages: ChatGPTMessage[];
    temperature: number;
    top_p: number;
    frequency_penalty: number;
    presence_penalty: number;
    max_tokens: number;
    n: number;
}

export async function ChatStream(payload: Prompt, apiKey?: string) {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    if (!apiKey) throw new Error("Missing OpenAI API Key");

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        method: "POST",
        body: JSON.stringify({ ...payload, stream: true }),
    });

    const stream = new ReadableStream({
        async start(controller) {
            function onParse(event: ParsedEvent | ReconnectInterval) {
                if (event.type === "event") {
                    const data = event.data;
                    // https://beta.openai.com/docs/api-reference/completions/create#completions/create-stream
                    if (data === "[DONE]") {
                        controller.close();
                        return;
                    }
                    //Each chunk from the stream is a JSON object with a single key, choices, 
                    // which is an array of objects with a single key, delta, 
                    // which is an object with a single key, content, which is a string.
                    try {
                        const json = JSON.parse(data);
                        const text = json.choices[0]?.delta?.content || "";
                        const queue = encoder.encode(text);
                        controller.enqueue(queue);
                    } catch (e) {
                        // in the "unlikely" event that bad JSON is returned.
                        controller.error(e);
                    }
                }
            }

            // stream response (SSE) from OpenAI may be fragmented into multiple chunks
            // this ensures we properly read chunks and invoke an event for each SSE event stream
            const parser = createParser(onParse);
            // https://web.dev/streams/#asynchronous-iteration
            for await (const chunk of res.body as any) {
                parser.feed(decoder.decode(chunk));
            }
        },
    });

    return stream;
}
