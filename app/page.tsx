"use client";

import { useChat } from "../hooks/useChat";
import { Bot, Send, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@nextui-org/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@nextui-org/input";
import MarkdownRenderer from "@/components/MarkdownRenderer";

export default function ChatComponent() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    errorMessage,
    scrollAreaRef,
  } = useChat();

  return (
    <div className="flex flex-col h-screen bg-zinc-900 text-white">
      <header className=" shadow-sm p-4">
        <h1 className="text-2xl font-bold text-center">
          Chat with CrustDataBot
        </h1>
      </header>
      <main className="flex-1 overflow-hidden justify-center flex">
        <ScrollArea className="h-full p-4 w-[60vw]" ref={scrollAreaRef}>
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex items-start space-x-2 mb-4 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" &&
                (message === errorMessage ? (
                  <AlertCircle className="w-6 h-6 mt-1 text-red-500 flex-shrink-0" />
                ) : (
                  <Bot className="w-6 h-6 mt-1 text-[#00bbff] flex-shrink-0" />
                ))}
              <div
                className={`py-3 px-5 rounded-2xl max-w-[80%] ${
                  message.role === "user"
                    ? "bg-[#00bbff] text-white"
                    : message === errorMessage
                    ? "bg-red-200 text-red-700"
                    : "bg-gray-700 text-white"
                }`}
              >
                {message.role === "assistant" ? (
                  <MarkdownRenderer content={message.content.toString()} />
                ) : (
                  message.content
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center space-x-2 text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>AI is thinking...</span>
            </div>
          )}
        </ScrollArea>
      </main>
      <footer className="p-4">
        <form onSubmit={handleSubmit} className="flex space-x-2 justify-center">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
            className="flex-grow max-w-screen-md text-white dark !pr-2"
            variant="faded"
            radius="full"
            size="lg"
            classNames={{ inputWrapper: "!pr-0" }}
            endContent={
              <Button
                type="submit"
                disabled={isLoading}
                isIconOnly
                radius="full"
                color="primary"
                variant="shadow"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            }
          />
        </form>
      </footer>
    </div>
  );
}
