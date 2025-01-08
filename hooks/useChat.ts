import { useState, useCallback, useRef, useEffect } from "react";

// Types for message and response structure
interface Message {
  id: string;
  content: string;
  role: "assistant" | "user";
}

// Custom hook for handling chat functionality
export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<Message | null>(null);

  // Function to handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  // Function to handle submitting the chat input
  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!input.trim()) return;

      // Add the user message
      const userMessage: Message = {
        id: Date.now().toString(),
        content: input,
        role: "user",
      };
      setMessages((prevMessages) => [...prevMessages, userMessage]);
      setInput("");
      setIsLoading(true);
      setErrorMessage(null);

      try {
        // Simulating API call to fetch response (replace with real API logic)
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt: input }),
        });
        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        const assistantMessage: Message = {
          id: Date.now().toString(),
          content: data?.llmResponse?.response || "Something went wrong.",
          role: "assistant",
        };

        setMessages((prevMessages) => [...prevMessages, assistantMessage]);
      } catch (error) {
        console.error("Chat error:", error);
        const errorMsg: Message = {
          id: Date.now().toString(),
          content:
            "An error occurred while processing your request. Please try again.",
          role: "assistant",
        };
        setErrorMessage(errorMsg);
        setMessages((prevMessages) => [...prevMessages, errorMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    [input]
  );

  // Scroll to bottom of the chat area when messages change
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    errorMessage,
    scrollAreaRef,
  };
}
