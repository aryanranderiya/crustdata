'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from './ui/button'
import { ScrollArea } from './ui/scroll-area'
import { ThemeToggle } from './theme-toggle'

export function Sidebar() {
  const [chats, setChats] = useState([
    { id: '1', title: 'Chat 1' },
    { id: '2', title: 'Chat 2' },
    { id: '3', title: 'Chat 3' },
  ])
  const router = useRouter()

  const createNewChat = () => {
    const newChatId = Date.now().toString()
    setChats([...chats, { id: newChatId, title: `Chat ${chats.length + 1}` }])
    router.push(`/chat/${newChatId}`)
  }

  return (
    <div className="w-64 h-full bg-background border-r flex flex-col">
      <div className="p-4">
        <Button onClick={createNewChat} className="w-full">
          New Chat
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <nav className="space-y-2 p-4">
          {chats.map((chat) => (
            <Link
              key={chat.id}
              href={`/chat/${chat.id}`}
              className="block p-2 rounded-lg hover:bg-accent"
            >
              {chat.title}
            </Link>
          ))}
        </nav>
      </ScrollArea>
      <div className="p-4">
        <ThemeToggle />
      </div>
    </div>
  )
}

