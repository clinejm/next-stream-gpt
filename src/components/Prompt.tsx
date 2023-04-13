"use client"

import ChatFetch from "@/openai/ChatFetch";
import { useRef, useState } from "react"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm';

export default function Prompt() {

    const [response, setResponse] = useState('')
    const promptTextRef = useRef<HTMLTextAreaElement>(null);
    const [isStreaming, setIsStreaming] = useState(false);
    const [error, setError] = useState('');
    const [output, setOutput] = useState("markdown")

    const handlePrompt = async () => {

        const promptText = promptTextRef.current?.value;

        if (!promptText) {
            setError('Please enter an prompt');
            return;
        }

        setIsStreaming(true);
        setError('');
        setResponse('')

        ChatFetch({
            message: promptText,
            onDone: () => setIsStreaming(false),
            onMessage: (message) => setResponse((prev) => prev + message),
            onError: (error) => setError(error)
        });
    }

    return (
        <div>
            <div>
                <div> <textarea ref={promptTextRef} placeholder="Prompt" /></div>
                <div> <button disabled={isStreaming} onClick={handlePrompt}>{isStreaming ? "•••" : "Sumbit"}</button></div>
            </div>
            <div>
                Response Format:
                <select onChange={(e) => setOutput(e.target.value)}>
                    <option value="markdown">Markdown</option>
                    <option value="raw">RAW</option>
                </select>
                <div>{response && output === "markdown" ? <ReactMarkdown remarkPlugins={[remarkGfm]} className="">{response}</ReactMarkdown> : response}</div>
                <pre>{error}</pre>
            </div>
        </div>
    )
}