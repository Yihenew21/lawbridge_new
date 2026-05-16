"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Check, CheckCheck, Reply, Paperclip, Image as ImageIcon, FileText, Download, ZoomIn } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Message {
  id: string
  sender_id: string
  content: string
  message_type: string
  is_edited: boolean
  is_deleted: boolean
  reply_to_id?: string
  created_at: string
  first_name: string
  last_name: string
  avatar_url?: string
  attachments?: Array<{
    id: string
    file_url: string
    file_name: string
    file_type: string
    file_size: number
  }>
  read_receipts?: Array<{
    user_id: string
    read_at: string
  }>
}

interface MessageListProps {
  messages: Message[]
  currentUserId: string
  onReply?: (message: Message) => void
  isLoading?: boolean
}

export function MessageList({
  messages,
  currentUserId,
  onReply,
  isLoading = false
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const prevMessageCountRef = useRef(0)
  const [previewFile, setPreviewFile] = useState<{
    url: string
    name: string
    type: string
    allImages?: Array<{ url: string; name: string }>
    currentIndex?: number
  } | null>(null)
  const [imageLoadStates, setImageLoadStates] = useState<Record<string, boolean>>({})

  useEffect(() => {
    // Only auto-scroll when new messages are added (not on initial load or clear)
    if (messages.length > prevMessageCountRef.current && prevMessageCountRef.current > 0) {
      // Delay scroll by 300ms to allow images to load
      const timer = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
      }, 300)

      return () => clearTimeout(timer)
    }

    prevMessageCountRef.current = messages.length
  }, [messages])

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return <ImageIcon className="h-4 w-4" />
    return <FileText className="h-4 w-4" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  const isImageFile = (fileType: string) => {
    return fileType.startsWith("image/")
  }

  const isPDFFile = (fileType: string) => {
    return fileType === "application/pdf"
  }

  const handleFileClick = (attachment: any, e: React.MouseEvent, allAttachments?: any[], index?: number) => {
    e.preventDefault()
    if (isImageFile(attachment.file_type)) {
      // Get all images from attachments
      const allImages = allAttachments
        ?.filter(a => isImageFile(a.file_type))
        .map(a => ({ url: a.file_url, name: a.file_name })) || []

      setPreviewFile({
        url: attachment.file_url,
        name: attachment.file_name,
        type: attachment.file_type,
        allImages: allImages.length > 1 ? allImages : undefined,
        currentIndex: index
      })
    } else if (isPDFFile(attachment.file_type)) {
      setPreviewFile({
        url: attachment.file_url,
        name: attachment.file_name,
        type: attachment.file_type
      })
    } else {
      // For non-previewable files, download directly
      window.open(attachment.file_url, '_blank')
    }
  }

  const navigateImage = (direction: 'prev' | 'next') => {
    if (!previewFile?.allImages || previewFile.currentIndex === undefined) return

    const newIndex = direction === 'prev'
      ? (previewFile.currentIndex - 1 + previewFile.allImages.length) % previewFile.allImages.length
      : (previewFile.currentIndex + 1) % previewFile.allImages.length

    const newImage = previewFile.allImages[newIndex]
    setPreviewFile({
      ...previewFile,
      url: newImage.url,
      name: newImage.name,
      currentIndex: newIndex
    })
  }

  const handleImageLoad = (attachmentId: string) => {
    setImageLoadStates(prev => ({ ...prev, [attachmentId]: true }))
  }

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Loading messages...</p>
        </div>
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <p className="text-muted-foreground">No messages yet</p>
          <p className="text-sm text-muted-foreground mt-1">Start the conversation!</p>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="h-full overflow-y-auto p-4 space-y-4">
      <AnimatePresence initial={false}>
        {messages.map((message, index) => {
          const isOwnMessage = message.sender_id === currentUserId
          const isSystemMessage = message.message_type === "system"
          const showAvatar = !isOwnMessage && (index === 0 || messages[index - 1].sender_id !== message.sender_id)
          const isRead = message.read_receipts && message.read_receipts.length > 0

          if (isSystemMessage) {
            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex justify-center"
              >
                <Badge variant="secondary" className="text-xs px-3 py-1">
                  {message.content}
                </Badge>
              </motion.div>
            )
          }

          return (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex gap-2 ${isOwnMessage ? "justify-end" : "justify-start"}`}
            >
              {!isOwnMessage && (
                <div className="flex-shrink-0">
                  {showAvatar ? (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={message.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {message.first_name[0]}{message.last_name[0]}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="w-8" />
                  )}
                </div>
              )}

              <div className={`flex flex-col ${isOwnMessage ? "items-end" : "items-start"} max-w-[70%]`}>
                {showAvatar && !isOwnMessage && (
                  <span className="text-xs text-muted-foreground mb-1 px-1">
                    {message.first_name} {message.last_name}
                  </span>
                )}

                <div
                  className={`group relative rounded-2xl px-4 py-2 ${
                    isOwnMessage
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-secondary text-foreground rounded-bl-sm"
                  }`}
                >
                  {message.reply_to_id && (
                    <div className="mb-2 pb-2 border-b border-current/10">
                      <div className="flex items-center gap-1 text-xs opacity-70">
                        <Reply className="h-3 w-3" />
                        <span>Replying to message</span>
                      </div>
                    </div>
                  )}

                  <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>

                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {/* Separate images and files */}
                      {(() => {
                        const images = message.attachments.filter(a => isImageFile(a.file_type))
                        const files = message.attachments.filter(a => !isImageFile(a.file_type))

                        return (
                          <>
                            {/* Image Grid */}
                            {images.length > 0 && (
                              <div className={`
                                grid gap-1 rounded-lg overflow-hidden
                                ${images.length === 1 ? 'grid-cols-1' : ''}
                                ${images.length === 2 ? 'grid-cols-2' : ''}
                                ${images.length === 3 ? 'grid-cols-2' : ''}
                                ${images.length >= 4 ? 'grid-cols-2' : ''}
                              `}>
                                {images.slice(0, 4).map((attachment, idx) => {
                                  const isLoaded = imageLoadStates[attachment.id]
                                  const showMore = images.length > 4 && idx === 3

                                  return (
                                    <div
                                      key={attachment.id}
                                      className={`
                                        relative group cursor-pointer overflow-hidden rounded-lg
                                        ${images.length === 1 ? 'aspect-[4/3] max-h-80' : ''}
                                        ${images.length === 2 ? 'aspect-square' : ''}
                                        ${images.length === 3 && idx === 0 ? 'col-span-2 aspect-[2/1]' : 'aspect-square'}
                                        ${images.length >= 4 ? 'aspect-square' : ''}
                                      `}
                                      onClick={(e) => handleFileClick(attachment, e, message.attachments, idx)}
                                    >
                                      {/* Loading skeleton */}
                                      {!isLoaded && (
                                        <div className="absolute inset-0 bg-secondary/50 animate-pulse" />
                                      )}

                                      <img
                                        src={attachment.file_url}
                                        alt={attachment.file_name}
                                        className={`
                                          w-full h-full object-cover transition-all duration-300
                                          ${isLoaded ? 'opacity-100' : 'opacity-0'}
                                          group-hover:scale-105
                                        `}
                                        onLoad={() => handleImageLoad(attachment.id)}
                                      />

                                      {/* Hover overlay */}
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <div className="absolute inset-0 flex items-center justify-center">
                                          <div className="bg-black/60 backdrop-blur-sm rounded-full p-3">
                                            <ZoomIn className="h-5 w-5 text-white" />
                                          </div>
                                        </div>
                                      </div>

                                      {/* Show "+N more" overlay for 5+ images */}
                                      {showMore && (
                                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                                          <span className="text-white text-2xl font-semibold">
                                            +{images.length - 4}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                            )}

                            {/* File attachments */}
                            {files.map((attachment) => (
                              <button
                                key={attachment.id}
                                onClick={(e) => handleFileClick(attachment, e)}
                                className={`w-full flex items-center gap-2 p-2 rounded-lg ${
                                  isOwnMessage
                                    ? "bg-primary-foreground/10 hover:bg-primary-foreground/20"
                                    : "bg-background/50 hover:bg-background/70"
                                } transition-colors text-left`}
                              >
                                {getFileIcon(attachment.file_type)}
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium truncate">{attachment.file_name}</p>
                                  <p className="text-[10px] opacity-70">{formatFileSize(attachment.file_size)}</p>
                                </div>
                                <Paperclip className="h-3 w-3 opacity-50" />
                              </button>
                            ))}
                          </>
                        )
                      })()}
                    </div>
                  )}

                  {message.is_edited && (
                    <span className="text-[10px] opacity-50 ml-2">(edited)</span>
                  )}

                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-[10px] opacity-70">
                      {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                    </span>
                    {isOwnMessage && (
                      <span className="ml-1">
                        {isRead ? (
                          <CheckCheck className="h-3 w-3 text-blue-400" />
                        ) : (
                          <Check className="h-3 w-3 opacity-70" />
                        )}
                      </span>
                    )}
                  </div>

                  {/* Reply button on hover */}
                  {onReply && (
                    <button
                      onClick={() => onReply(message)}
                      className={`absolute -top-2 ${
                        isOwnMessage ? "left-2" : "right-2"
                      } opacity-0 group-hover:opacity-100 transition-opacity bg-background border border-border rounded-full p-1 shadow-sm hover:bg-secondary`}
                    >
                      <Reply className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
      <div ref={messagesEndRef} />

      {/* Enhanced File Preview Modal */}
      <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
        <DialogContent className="max-w-6xl max-h-[95vh] p-0 bg-black/95 border-none [&>button]:hidden">
          <DialogTitle className="sr-only">File Preview</DialogTitle>
          {previewFile && (
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 bg-black/50 backdrop-blur-sm border-b border-white/10">
                <div className="flex-1 min-w-0 mr-4">
                  <p className="font-medium truncate text-white">{previewFile.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-white/60">
                      {isImageFile(previewFile.type) ? "Image" : "PDF Document"}
                    </p>
                    {previewFile.allImages && previewFile.currentIndex !== undefined && (
                      <Badge variant="secondary" className="text-xs">
                        {previewFile.currentIndex + 1} / {previewFile.allImages.length}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDownload(previewFile.url, previewFile.name)}
                    className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setPreviewFile(null)}
                    className="text-white hover:bg-white/10 h-9 w-9"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-hidden relative">
                {isImageFile(previewFile.type) ? (
                  <div className="flex items-center justify-center h-full p-8">
                    <img
                      src={previewFile.url}
                      alt={previewFile.name}
                      className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                    />

                    {/* Navigation arrows for multiple images */}
                    {previewFile.allImages && previewFile.allImages.length > 1 && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full h-12 w-12"
                          onClick={() => navigateImage('prev')}
                        >
                          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full h-12 w-12"
                          onClick={() => navigateImage('next')}
                        >
                          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Button>
                      </>
                    )}
                  </div>
                ) : isPDFFile(previewFile.type) ? (
                  <iframe
                    src={previewFile.url}
                    className="w-full h-full"
                    title={previewFile.name}
                  />
                ) : null}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
