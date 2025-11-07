"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, MessageCircle, Search, Send } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { ProtectedRoute } from "@/components/protected-route"
import { LoadingSpinner } from "@/components/loading-spinner"
// Edge functions temporarily disabled - focusing on auth
import { useToast } from "@/components/ui/use-toast"

interface Message {
  id: string
  content: string
  sender_id?: string
  companion_id?: string
  created_at: string
  message_type: 'text' | 'image' | 'system'
}

interface Conversation {
  id: string
  companion: {
    id: string
    name: string
    image_url: string
    personality: string
  }
  last_message_at: string
  unreadCount: number
  messages?: Message[]
}

export default function ChatsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    loadConversations()
  }, [])

  const loadConversations = async () => {
    try {
      setIsLoading(true)
      const fetchedConversations = await getUserConversations()
      setConversations(fetchedConversations)
    } catch (error) {
      console.error("Error loading conversations:", error)
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadConversation = async (conversation: Conversation) => {
    try {
      const fullConversation = await getConversation(conversation.id)
      if (fullConversation) {
        setSelectedConversation(fullConversation)
        setMessages(fullConversation.messages || [])
      }
    } catch (error) {
      console.error("Error loading conversation:", error)
      toast({
        title: "Error",
        description: "Failed to load conversation",
        variant: "destructive"
      })
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || isSending) return

    const messageContent = newMessage.trim()
    setNewMessage("")
    setIsSending(true)

    try {
      // Add user message to UI immediately
      const userMessage: Message = {
        id: `temp-${Date.now()}`,
        content: messageContent,
        sender_id: 'user',
        created_at: new Date().toISOString(),
        message_type: 'text'
      }
      setMessages(prev => [...prev, userMessage])

      // Generate AI response
      const response = await generateCompanionResponse({
        companionId: selectedConversation.companion.id,
        userMessage: messageContent,
        conversationHistory: messages.slice(-10).map(msg => ({
          role: msg.sender_id ? 'user' : 'assistant',
          content: msg.content
        }))
      })

      // Add AI response to UI
      const aiMessage: Message = {
        id: response.messageId || `ai-${Date.now()}`,
        content: response.response,
        companion_id: selectedConversation.companion.id,
        created_at: new Date().toISOString(),
        message_type: 'text'
      }
      setMessages(prev => [...prev, aiMessage])

      // Update conversation list
      await loadConversations()

    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      })
    } finally {
      setIsSending(false)
    }
  }

  const filteredConversations = conversations.filter(conv =>
    conv.companion.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <LoadingSpinner size="medium" text="Loading conversations..." />
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black">
        <Navbar />

        <main className="pt-20 pb-8">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex h-[calc(100vh-8rem)]">
              {/* Conversations List */}
              <div className="w-1/3 border-r border-gray-800 pr-4">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href="/dashboard">
                        <ArrowLeft className="h-6 w-6 text-white" />
                      </Link>
                    </Button>
                    <h1 className="text-2xl font-bold text-white">Chats</h1>
                  </div>
                </div>

                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-gray-900 border-gray-700 text-white"
                  />
                </div>

                {/* Conversations */}
                <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-16rem)]">
                  {filteredConversations.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageCircle className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">No conversations yet</p>
                      <Button asChild className="mt-4 bg-teal-500 text-black hover:bg-teal-400">
                        <Link href="/swipe/enhanced">Start Swiping</Link>
                      </Button>
                    </div>
                  ) : (
                    filteredConversations.map((conversation) => (
                      <Card
                        key={conversation.id}
                        className={`cursor-pointer transition-colors ${
                          selectedConversation?.id === conversation.id
                            ? 'bg-teal-500/20 border-teal-500'
                            : 'bg-gray-900 border-gray-700 hover:bg-gray-800'
                        }`}
                        onClick={() => loadConversation(conversation)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={conversation.companion.image_url}
                              alt={conversation.companion.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-white truncate">
                                  {conversation.companion.name}
                                </h3>
                                {conversation.unreadCount > 0 && (
                                  <span className="bg-teal-500 text-black text-xs rounded-full px-2 py-1">
                                    {conversation.unreadCount}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-400 truncate">
                                {conversation.companion.personality}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>

              {/* Chat Area */}
              <div className="flex-1 pl-4 flex flex-col">
                {selectedConversation ? (
                  <>
                    {/* Chat Header */}
                    <div className="flex items-center gap-3 pb-4 border-b border-gray-800">
                      <img
                        src={selectedConversation.companion.image_url}
                        alt={selectedConversation.companion.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <h2 className="font-semibold text-white">
                          {selectedConversation.companion.name}
                        </h2>
                        <p className="text-sm text-gray-400">
                          {selectedConversation.companion.personality}
                        </p>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto py-4 space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender_id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.sender_id
                                ? 'bg-teal-500 text-black'
                                : 'bg-gray-800 text-white'
                            }`}
                          >
                            <p>{message.content}</p>
                            <p className={`text-xs mt-1 ${
                              message.sender_id ? 'text-black/70' : 'text-gray-400'
                            }`}>
                              {new Date(message.created_at).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Message Input */}
                    <div className="flex gap-2 pt-4 border-t border-gray-800">
                      <Input
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        className="flex-1 bg-gray-900 border-gray-700 text-white"
                        disabled={isSending}
                      />
                      <Button
                        onClick={sendMessage}
                        disabled={!newMessage.trim() || isSending}
                        className="bg-teal-500 text-black hover:bg-teal-400"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <MessageCircle className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">
                        Select a conversation
                      </h3>
                      <p className="text-gray-400">
                        Choose a conversation from the list to start chatting
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}