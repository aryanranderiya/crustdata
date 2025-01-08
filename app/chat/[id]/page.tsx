import { ChatInterface } from '@/components/chat-interface'
import { Sidebar } from '@/components/sidebar'

export default function ChatPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        <ChatInterface chatId={params.id} />
      </main>
    </div>
  )
}

