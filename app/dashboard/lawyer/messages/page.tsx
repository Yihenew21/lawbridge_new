"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Send, Search } from "lucide-react"

const conversations = [
  {
    id: 1,
    name: "Meron T.",
    role: "Client",
    avatar: "MT",
    lastMessage: "Thank you for the progress update on my case.",
    time: "1h ago",
    unread: true,
    messageCount: 3,
    status: "online",
  },
  {
    id: 2,
    name: "Tigist H.",
    role: "Client",
    avatar: "TH",
    lastMessage: "When can we schedule the next meeting?",
    time: "3h ago",
    unread: true,
    messageCount: 2,
    status: "offline",
  },
  {
    id: 3,
    name: "Yonas G.",
    role: "Client",
    avatar: "YG",
    lastMessage: "I have reviewed the draft and have some questions.",
    time: "1d ago",
    unread: false,
    messageCount: 5,
    status: "offline",
  },
]

export default function LawyerMessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState(conversations[0])
  const [searchQuery, setSearchQuery] = useState("")
  const [newMessage, setNewMessage] = useState("")

  const filteredConversations = conversations.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <DashboardShell role="lawyer">
      <div className="p-6 lg:p-8 h-[calc(100vh-6rem)] lg:h-[calc(100vh-4rem)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold font-serif md:text-3xl">Messages</h1>
            <p className="mt-1 text-muted-foreground">Chat with your clients about cases.</p>
          </div>
        </motion.div>

        {/* Messages Layout */}
        <div className="mt-8 flex gap-6 h-[calc(100%-6rem)]">
          {/* Conversations List */}
          <div className="w-full sm:w-80 flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary/50 border-border/50"
              />
            </div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-1 overflow-y-auto flex flex-col gap-2"
            >
              {filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`text-left flex items-start gap-3 rounded-xl border p-3 transition-all ${
                    selectedConversation.id === conv.id
                      ? "border-primary/50 bg-primary/10"
                      : "border-border/50 bg-secondary/30 hover:border-primary/20 hover:bg-secondary/50"
                  }`}
                >
                  <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                    {conv.avatar}
                    {conv.status === "online" && (
                      <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 border border-background" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{conv.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
                  </div>
                  {conv.unread && (
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                      {conv.messageCount}
                    </div>
                  )}
                </button>
              ))}
            </motion.div>
          </div>

          {/* Chat Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="hidden sm:flex flex-1 flex-col rounded-xl border border-border/50 bg-card overflow-hidden"
          >
            {/* Chat Header */}
            <div className="border-b border-border/50 p-4">
              <div className="flex items-center gap-3">
                <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                  {selectedConversation.avatar}
                  {selectedConversation.status === "online" && (
                    <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 border border-background" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{selectedConversation.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedConversation.status}</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              <div className="text-center text-xs text-muted-foreground py-4">
                Conversation with {selectedConversation.name}
              </div>
            </div>

            {/* Input */}
            <div className="border-t border-border/50 p-4 gap-2 flex">
              <Textarea
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="min-h-10 resize-none bg-secondary/50 border-border/50"
              />
              <Button size="icon" className="shrink-0">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardShell>
  )
}
