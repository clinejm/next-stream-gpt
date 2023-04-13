type ChatProps = {
    message: string,
    onMessage: (message: string) => void,
    onError: (message: string) => void,
    onDone: () => void
};

export default async function ChatFetch({ message, onMessage, onError, onDone }: ChatProps) {

    const response = await fetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ prompt: message }),
        headers: {
            'content-type': 'application/json'
        }
    });

    if (response.ok) {
        try {
            const data = response.body;
            if (!data) {
                return;
            }
            const reader = data.getReader();
            const decoder = new TextDecoder();
            while (true) {
                const { value, done } = await reader.read();
                const chunkValue = decoder.decode(value);

                onMessage(chunkValue);

                if (done) {
                    onDone();
                    break;
                }
            }
        } catch (e) {
            if (e instanceof Error && e.message) {
                onError(e.message);
            } else {
                onError("Unknown Error");
            }
        }
    } else {
        const error = await response.text();
        console.log("error", error);
        onError(error);
    }
};