import { ChatInterface } from '@/components/chat-interface'
import { Sidebar } from '@/components/sidebar'

export default function Home() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        <ChatInterface />
      </main>
    </div>
  )
}

