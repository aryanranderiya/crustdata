'use client'

import { useState } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Search } from 'lucide-react'

const suggestions = [
  "What is machine learning?",
  "How does natural language processing work?",
  "Explain the concept of neural networks",
  "What are the applications of AI in healthcare?",
]

export function SearchBar({ onSearch }: { onSearch: (query: string) => void }) {
  const [query, setQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(query)
    setShowSuggestions(false)
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto mb-8">
      <form onSubmit={handleSubmit} className="flex items-center">
        <Input
          type="text"
          placeholder="Search or ask a question..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          className="flex-1"
        />
        <Button type="submit" className="ml-2">
          <Search className="w-4 h-4" />
        </Button>
      </form>
      {showSuggestions && (
        <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              className="block w-full text-left px-4 py-2 hover:bg-accent"
              onClick={() => {
                setQuery(suggestion)
                onSearch(suggestion)
                setShowSuggestions(false)
              }}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

