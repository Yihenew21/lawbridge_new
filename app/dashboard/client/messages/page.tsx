"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { MessageSquare, Send, Search, Video } from "lucide-react"
import Link from "next/link"

export default function ClientMessagesPage() {
  const [conversations, setConversations] = useState<any[]>([])
  const [selectedConv, setSelectedConv] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [isVideoOpen, setIsVideoOpen] = useState(false)

  useEffect(() => {
    fetchConversations()
  }, [])

  useEffect(() => {
    if (selectedConv?.id) {
      fetchMessages(selectedConv.id)
    }
  }, [selectedConv?.id])

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/messages", { credentials: "include" })
      if (res.ok) {
        const data = await res.json()
        setConversations(data.conversations || [])
        if (data.conversations?.length > 0 && !selectedConv) {
          setSelectedConv(data.conversations[0])
        }
      }
    } catch (err) {
      console.error("Failed to fetch conversations:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (id: string) => {
    try {
      const res = await fetch(`/api/messages?conversationId=${id}`, { credentials: "include" })
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages || [])
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedConv) return

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          conversationId: selectedConv.id,
          message: message,
        }),
      })

      if (res.ok) {
        setMessage("")
        fetchMessages(selectedConv.id)
        fetchConversations()
      }
    } catch (err) {
      console.error("Failed to send message:", err)
    }
  }

  const filteredConversations = conversations.filter(c =>
    (c.lawyer_first + " " + c.lawyer_last).toLowerCase().includes(search.toLowerCase())
  )

  return (
    <DashboardShell role="client">
      <div className="p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold font-serif md:text-3xl">Messages</h1>
          <p className="mt-1 text-muted-foreground">Communicate with your lawyers</p>
        </motion.div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <Card className="border-border/50 h-full flex flex-col">
              <CardHeader>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0 flex-1 overflow-y-auto">
                {loading ? (
                  <div className="h-32 bg-secondary/50 animate-pulse m-4 rounded-lg" />
                ) : filteredConversations.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    <p>No conversations yet</p>
                  </div>
                ) : (
                  <div className="flex flex-col divide-y divide-border/50">
                    {filteredConversations.map((conv) => (
                      <button
                        key={conv.id}
                        onClick={() => setSelectedConv(conv)}
                        className={`p-4 text-left transition-all hover:bg-secondary/50 ${
                          selectedConv?.id === conv.id ? "bg-primary/10 border-l-2 border-primary" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-foreground">{conv.lawyer_first} {conv.lawyer_last}</p>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {conv.message_count} messages
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Chat Area */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            {selectedConv ? (
              <Card className="border-border/50 h-full flex flex-col">
                <CardHeader className="border-b border-border/50 shrink-0">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <CardTitle>{selectedConv.lawyer_first} {selectedConv.lawyer_last}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button onClick={() => setIsVideoOpen(true)} className="gap-2 bg-primary">
                        <Video className="h-4 w-4" />
                        Video Call
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                     <div className="text-center text-muted-foreground text-sm py-8">
                       Start a conversation
                     </div>
                  ) : (
                    messages.map((msg: any, i: number) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.sender_id === selectedConv.client_id ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-lg ${
                            msg.sender_id === selectedConv.client_id
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-foreground"
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                          <p className="text-[10px] opacity-70 mt-1">
                            {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                        </div>
                      </motion.div>
                    ))
                  )}
                </CardContent>

                <CardContent className="border-t border-border/50 p-4 shrink-0">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Type your message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                      className="resize-none min-h-[44px] bg-secondary/50"
                      rows={1}
                    />
                    <Button onClick={handleSendMessage} size="icon" className="self-end" disabled={!message.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-border/50 flex items-center justify-center h-full">
                <CardContent className="text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">Select a lawyer to start messaging</p>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </div>

      <Dialog open={isVideoOpen} onOpenChange={setIsVideoOpen}>
        <DialogContent className="sm:max-w-4xl h-[80vh] p-0 overflow-hidden border-border/50 bg-background">
          <DialogTitle className="sr-only">Video Meeting</DialogTitle>
          <DialogDescription className="sr-only">WebRTC video chat interface via Jitsi</DialogDescription>
          {isVideoOpen && selectedConv && (
            <iframe 
              src={`https://meet.jit.si/lawbridge-chat-${selectedConv.id}`} 
              allow="camera; microphone; fullscreen; display-capture"
              className="w-full h-full border-0"
            />
          )}
        </DialogContent>
      </Dialog>
    </DashboardShell>
  )
}
