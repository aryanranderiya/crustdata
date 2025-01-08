import { Textarea } from '@/components/ui/textarea'

interface ChatInputProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export function ChatInput({ ...props }: ChatInputProps) {
  return (
    <Textarea
      placeholder="Type your message here..."
      className="flex-1 min-h-[80px]"
      {...props}
    />
  )
}

