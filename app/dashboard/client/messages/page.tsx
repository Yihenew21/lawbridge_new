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
    name: "Abeba Tesfaye",
    role: "Lawyer",
    avatar: "AT",
    lastMessage: "I have submitted the final custody agreement for your review.",
    time: "2h ago",
    unread: true,
    messageCount: 8,
    status: "online",
    messages: [
      { sender: "Abeba Tesfaye", text: "Good morning! How are you today?", time: "10:30 AM" },
      { sender: "You", text: "Hi Abeba, I'm doing well. Have you made progress on the custody agreement?", time: "10:45 AM" },
      { sender: "Abeba Tesfaye", text: "Yes, I have submitted the final custody agreement for your review.", time: "2h ago" },
    ],
  },
  {
    id: 2,
    name: "Dawit Mengistu",
    role: "Lawyer",
    avatar: "DM",
    lastMessage: "Let's schedule a call to discuss the partnership terms.",
    time: "5h ago",
    unread: true,
    messageCount: 12,
    status: "offline",
    messages: [],
  },
  {
    id: 3,
    name: "Solomon Bekele",
    role: "Lawyer",
    avatar: "SB",
    lastMessage: "The land survey results are in. Everything looks good.",
    time: "1d ago",
    unread: false,
    messageCount: 15,
    status: "offline",
    messages: [],
  },
]

export default function ClientMessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState(conversations[0])
  const [searchQuery, setSearchQuery] = useState("")
  const [newMessage, setNewMessage] = useState("")

  const filteredConversations = conversations.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <DashboardShell role="client">
      <div className="p-6 lg:p-8 h-[calc(100vh-6rem)] lg:h-[calc(100vh-4rem)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold font-serif md:text-3xl">Messages</h1>
            <p className="mt-1 text-muted-foreground">Chat with your lawyers about cases.</p>
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
              {selectedConversation.messages.length > 0 ? (
                selectedConversation.messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.sender === "You" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`rounded-lg px-4 py-2 max-w-xs ${
                        msg.sender === "You"
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary/50 text-foreground"
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>
                      <p className="text-xs mt-1 opacity-70">{msg.time}</p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p className="text-sm">No messages yet. Start a conversation!</p>
                </div>
              )}
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
