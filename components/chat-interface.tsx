'use client'

import { useState } from 'react'
import { useChat } from 'ai/react'
import { SearchBar } from './search-bar'
import { ChatMessages } from './chat-messages'
import { ChatInput } from './chat-input'
import { Button } from './ui/button'
import { Loader2 } from 'lucide-react'

export function ChatInterface({ chatId }: { chatId?: string }) {
  const [searchQuery, setSearchQuery] = useState('')
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    id: chatId,
    api: '/api/chat', // This points to our custom API route
  })

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    // Implement search functionality here
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        <SearchBar onSearch={handleSearch} />
        <ChatMessages messages={messages} />
      </div>
      <div className="p-4">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <ChatInput
            value={input}
            onChange={handleInputChange}
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin" /> : 'Send'}
          </Button>
        </form>
      </div>
    </div>
  )
}

