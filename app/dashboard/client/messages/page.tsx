"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, Search, Video, Calendar, Phone, MoreVertical, Trash2 } from "lucide-react"
import { MessageList } from "@/components/messaging/MessageList"
import { MessageInput } from "@/components/messaging/MessageInput"
import { VideoCallModal } from "@/components/messaging/VideoCallModal"
import { ScheduleCallDialog } from "@/components/messaging/ScheduleCallDialog"
import { IncomingCallModal } from "@/components/messaging/IncomingCallModal"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function ClientMessagesPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [conversations, setConversations] = useState<any[]>([])
  const [selectedConv, setSelectedConv] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false)
  const [isScheduleCallOpen, setIsScheduleCallOpen] = useState(false)
  const [typingUsers, setTypingUsers] = useState<any[]>([])
  const [replyingTo, setReplyingTo] = useState<any>(null)
  const [incomingCall, setIncomingCall] = useState<any>(null)
  const [activeCall, setActiveCall] = useState<any>(null)
  const [showClearDialog, setShowClearDialog] = useState(false)

  useEffect(() => {
    fetchConversations()
    // Update online status
    updateOnlineStatus(true)

    // Set up interval to keep online status updated
    const interval = setInterval(() => {
      updateOnlineStatus(true)
    }, 60000) // Every minute

    // Poll for incoming calls
    const callInterval = setInterval(() => {
      checkForIncomingCalls()
    }, 3000) // Every 3 seconds

    // Cleanup on unmount
    return () => {
      clearInterval(interval)
      clearInterval(callInterval)
      updateOnlineStatus(false)
    }
  }, [])

  useEffect(() => {
    if (selectedConv?.id) {
      fetchMessages(selectedConv.id)
      // Poll for new messages every 5 seconds
      const interval = setInterval(() => {
        fetchMessages(selectedConv.id, true)
      }, 5000)

      return () => clearInterval(interval)
    }
  }, [selectedConv?.id])

  useEffect(() => {
    if (selectedConv?.id) {
      // Poll for typing indicators
      const interval = setInterval(() => {
        fetchTypingIndicators(selectedConv.id)
      }, 2000)

      return () => clearInterval(interval)
    }
  }, [selectedConv?.id])

  const updateOnlineStatus = async (isOnline: boolean) => {
    try {
      await fetch("/api/users/online-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isOnline })
      })
    } catch (error) {
      console.error("Failed to update online status:", error)
    }
  }

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/conversations", { credentials: "include" })
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

  const fetchMessages = async (conversationId: string, silent = false) => {
    if (!silent) setMessagesLoading(true)
    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        credentials: "include"
      })
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages || [])
      }
    } catch (err) {
      console.error("Failed to fetch messages:", err)
    } finally {
      if (!silent) setMessagesLoading(false)
    }
  }

  const fetchTypingIndicators = async (conversationId: string) => {
    try {
      const res = await fetch(`/api/conversations/${conversationId}/typing`, {
        credentials: "include"
      })
      if (res.ok) {
        const data = await res.json()
        setTypingUsers(data.typingUsers || [])
      }
    } catch (err) {
      // Silently fail
    }
  }

  const handleSendMessage = async (content: string, attachmentFiles?: File[]) => {
    if (!selectedConv) return

    try {
      let attachments = []

      // Upload attachments if any
      if (attachmentFiles && attachmentFiles.length > 0) {
        toast({
          title: "Uploading files...",
          description: `Uploading ${attachmentFiles.length} file(s)`
        })

        for (const file of attachmentFiles) {
          // Upload via API endpoint
          const formData = new FormData()
          formData.append('file', file)
          formData.append('folder', 'message-attachments')

          const uploadRes = await fetch('/api/upload', {
            method: 'POST',
            credentials: 'include',
            body: formData
          })

          if (!uploadRes.ok) {
            const error = await uploadRes.json()
            throw new Error(error.error || 'Failed to upload file')
          }

          const uploadData = await uploadRes.json()

          attachments.push({
            file_url: uploadData.url,
            file_name: file.name,
            file_type: file.type,
            file_size: file.size
          })
        }
      }

      const res = await fetch(`/api/conversations/${selectedConv.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          content,
          replyToId: replyingTo?.id,
          attachments: attachments.length > 0 ? attachments : undefined
        })
      })

      if (res.ok) {
        setReplyingTo(null)
        fetchMessages(selectedConv.id, true)
        fetchConversations()
      } else {
        throw new Error("Failed to send message")
      }
    } catch (err) {
      console.error("Failed to send message:", err)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleTyping = useCallback(() => {
    if (!selectedConv) return

    fetch(`/api/conversations/${selectedConv.id}/typing`, {
      method: "POST",
      credentials: "include"
    }).catch(() => {})
  }, [selectedConv])

  const handleStartVideoCall = async () => {
    if (!selectedConv) return

    try {
      const res = await fetch("/api/video-calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          conversationId: selectedConv.id,
          receiverId: selectedConv.other_user_id,
          callType: "video"
        })
      })

      if (res.ok) {
        const data = await res.json()
        setActiveCall(data.call)
        setIsVideoCallOpen(true)
      } else {
        throw new Error("Failed to initiate call")
      }
    } catch (error) {
      console.error("Failed to start video call:", error)
      toast({
        title: "Error",
        description: "Failed to start video call. Please try again.",
        variant: "destructive"
      })
    }
  }

  const checkForIncomingCalls = async () => {
    if (!user) return

    try {
      const res = await fetch("/api/video-calls?status=initiated", {
        credentials: "include"
      })

      if (res.ok) {
        const data = await res.json()
        const incomingCalls = data.calls?.filter((call: any) =>
          call.receiver_id === user.id && call.status === "initiated"
        )

        if (incomingCalls && incomingCalls.length > 0) {
          const call = incomingCalls[0]
          setIncomingCall(call)
        }
      }
    } catch (error) {
      console.error("Failed to check for incoming calls:", error)
    }
  }

  const handleAcceptCall = async () => {
    if (!incomingCall) return

    try {
      // Update call status to ringing
      await fetch(`/api/video-calls/${incomingCall.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: "ringing" })
      })

      setActiveCall(incomingCall)
      setIncomingCall(null)
      setIsVideoCallOpen(true)
    } catch (error) {
      console.error("Failed to accept call:", error)
      toast({
        title: "Error",
        description: "Failed to accept call. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleDeclineCall = async () => {
    if (!incomingCall) return

    try {
      await fetch(`/api/video-calls/${incomingCall.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: "declined" })
      })

      setIncomingCall(null)
      toast({
        title: "Call declined",
        description: "You declined the incoming call."
      })
    } catch (error) {
      console.error("Failed to decline call:", error)
    }
  }

  const handleCloseVideoCall = () => {
    setIsVideoCallOpen(false)
    setActiveCall(null)
    // Refresh messages to show call status
    if (selectedConv?.id) {
      fetchMessages(selectedConv.id, true)
    }
  }

  const handleClearChatHistory = async () => {
    if (!selectedConv) return

    try {
      const res = await fetch(`/api/conversations/${selectedConv.id}/clear`, {
        method: "POST",
        credentials: "include"
      })

      if (res.ok) {
        setMessages([])
        setShowClearDialog(false)
        toast({
          title: "Chat cleared",
          description: "Chat history has been cleared successfully."
        })
      } else {
        throw new Error("Failed to clear chat")
      }
    } catch (error) {
      console.error("Failed to clear chat history:", error)
      toast({
        title: "Error",
        description: "Failed to clear chat history. Please try again.",
        variant: "destructive"
      })
    }
  }

  const filteredConversations = conversations.filter(c =>
    (c.other_user_first_name + " " + c.other_user_last_name)
      .toLowerCase()
      .includes(search.toLowerCase())
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

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 h-10 bg-secondary/50"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-4 space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-16 bg-secondary/50 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No conversations yet</p>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {filteredConversations.map((conv) => (
                      <button
                        key={conv.id}
                        onClick={() => setSelectedConv(conv)}
                        className={`p-4 text-left transition-all hover:bg-secondary/50 border-b border-border/50 ${
                          selectedConv?.id === conv.id ? "bg-primary/10 border-l-2 border-l-primary" : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="relative">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={conv.other_user_avatar} />
                              <AvatarFallback>
                                {conv.other_user_first_name[0]}{conv.other_user_last_name[0]}
                              </AvatarFallback>
                            </Avatar>
                            {conv.other_user_online && (
                              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-medium text-foreground truncate">
                                {conv.other_user_first_name} {conv.other_user_last_name}
                              </p>
                              {conv.unread_count > 0 && (
                                <Badge variant="default" className="ml-2 h-5 min-w-5 px-1.5 text-xs">
                                  {conv.unread_count}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {conv.last_message_content || "No messages yet"}
                            </p>
                          </div>
                        </div>
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
              <Card className="border-border/50 h-[calc(100vh-12rem)] flex flex-col">
                <CardHeader className="border-b border-border/50 pb-3 shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={selectedConv.other_user_avatar} />
                        <AvatarFallback>
                          {selectedConv.other_user_first_name[0]}{selectedConv.other_user_last_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">
                          {selectedConv.other_user_first_name} {selectedConv.other_user_last_name}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">
                          {selectedConv.other_user_online ? (
                            <span className="text-green-500">● Online</span>
                          ) : (
                            `Last seen ${new Date(selectedConv.other_user_last_seen).toLocaleString()}`
                          )}
                        </p>
                        {typingUsers.length > 0 && (
                          <p className="text-xs text-primary animate-pulse">typing...</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleStartVideoCall}
                        className="rounded-full"
                      >
                        <Video className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="rounded-full">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setIsScheduleCallOpen(true)}>
                            <Calendar className="h-4 w-4 mr-2" />
                            Schedule Call
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setShowClearDialog(true)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Clear Chat History
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages - Scrollable */}
                <div className="flex-1 overflow-hidden">
                  <MessageList
                    messages={messages}
                    currentUserId={user?.id || ""}
                    onReply={setReplyingTo}
                    isLoading={messagesLoading}
                  />
                </div>

                {/* Message Input - Fixed */}
                <div className="shrink-0">
                  <MessageInput
                  onSend={handleSendMessage}
                  onTyping={handleTyping}
                  replyingTo={replyingTo}
                  onCancelReply={() => setReplyingTo(null)}
                />
                </div>
              </Card>
            ) : (
              <Card className="border-border/50 flex items-center justify-center h-full">
                <CardContent className="text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">Select a conversation to start messaging</p>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </div>

      {/* Video Call Modal */}
      {isVideoCallOpen && activeCall && (
        <VideoCallModal
          isOpen={isVideoCallOpen}
          onClose={handleCloseVideoCall}
          conversationId={activeCall.conversation_id}
          otherUserName={
            activeCall.initiator_id === user?.id
              ? `${activeCall.receiver_first_name} ${activeCall.receiver_last_name}`
              : `${activeCall.initiator_first_name} ${activeCall.initiator_last_name}`
          }
          callId={activeCall.id}
          roomId={activeCall.room_id}
          isInitiator={activeCall.initiator_id === user?.id}
        />
      )}

      {/* Incoming Call Modal */}
      {incomingCall && (
        <IncomingCallModal
          isOpen={!!incomingCall}
          callerName={`${incomingCall.initiator_first_name} ${incomingCall.initiator_last_name}`}
          callerAvatar={incomingCall.initiator_avatar}
          callType={incomingCall.call_type}
          onAccept={handleAcceptCall}
          onDecline={handleDeclineCall}
        />
      )}

      {/* Schedule Call Dialog */}
      {selectedConv && (
        <ScheduleCallDialog
          isOpen={isScheduleCallOpen}
          onClose={() => setIsScheduleCallOpen(false)}
          conversationId={selectedConv.id}
          participantId={selectedConv.other_user_id}
          participantName={`${selectedConv.other_user_first_name} ${selectedConv.other_user_last_name}`}
          onScheduled={() => {
            setIsScheduleCallOpen(false)
            toast({
              title: "Call scheduled",
              description: "Video call has been scheduled successfully."
            })
          }}
        />
      )}

      {/* Clear Chat Confirmation Dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Chat History?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all messages in this conversation. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearChatHistory}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Clear Chat
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardShell>
  )
}
