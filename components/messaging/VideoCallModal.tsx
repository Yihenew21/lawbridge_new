"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Video, VideoOff, Mic, MicOff, PhoneOff, Maximize2, Minimize2, Calendar } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface VideoCallModalProps {
  isOpen: boolean
  onClose: () => void
  conversationId: string
  otherUserName: string
  callId?: string
  roomId?: string
  isInitiator?: boolean
}

export function VideoCallModal({
  isOpen,
  onClose,
  conversationId,
  otherUserName,
  callId,
  roomId,
  isInitiator = false
}: VideoCallModalProps) {
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [callStatus, setCallStatus] = useState<"connecting" | "connected" | "ended">("connecting")
  const [callDuration, setCallDuration] = useState(0)
  const [currentRoomId, setCurrentRoomId] = useState(roomId)

  useEffect(() => {
    if (!isOpen) {
      setCallStatus("connecting")
      setCallDuration(0)
      return
    }

    // Simulate connection (in production, this would be WebRTC signaling)
    const connectTimer = setTimeout(() => {
      setCallStatus("connected")
    }, 2000)

    return () => clearTimeout(connectTimer)
  }, [isOpen])

  useEffect(() => {
    if (callStatus === "connected") {
      const interval = setInterval(() => {
        setCallDuration((prev) => prev + 1)
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [callStatus])

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleEndCall = async () => {
    if (callId) {
      try {
        await fetch(`/api/video-calls/${callId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ status: "ended" })
        })
      } catch (error) {
        console.error("Failed to end call:", error)
      }
    }
    setCallStatus("ended")
    setTimeout(() => {
      onClose()
    }, 1500)
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  // Generate Jitsi room URL
  const jitsiRoomUrl = currentRoomId
    ? `https://meet.jit.si/${currentRoomId}#config.prejoinPageEnabled=false`
    : `https://meet.jit.si/lawbridge-${conversationId}-${Date.now()}#config.prejoinPageEnabled=false`

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={`${
          isFullscreen ? "max-w-full h-screen" : "sm:max-w-4xl h-[80vh]"
        } p-0 overflow-hidden border-border/50 bg-black transition-all duration-300`}
      >
        <DialogTitle className="sr-only">Video Call with {otherUserName}</DialogTitle>
        <DialogDescription className="sr-only">
          WebRTC video chat interface. Use controls to manage audio, video, and end the call.
        </DialogDescription>

        <div className="relative w-full h-full flex flex-col">
          {/* Video Container */}
          <div className="flex-1 relative bg-gradient-to-br from-gray-900 to-black">
            {callStatus === "connecting" ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 flex flex-col items-center justify-center"
              >
                <div className="relative">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full"
                  />
                  <Video className="absolute inset-0 m-auto w-8 h-8 text-primary" />
                </div>
                <p className="mt-6 text-white text-lg font-medium">Connecting to {otherUserName}...</p>
                <p className="mt-2 text-gray-400 text-sm">Please wait</p>
              </motion.div>
            ) : callStatus === "ended" ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 flex flex-col items-center justify-center"
              >
                <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
                  <PhoneOff className="w-10 h-10 text-red-500" />
                </div>
                <p className="text-white text-lg font-medium">Call Ended</p>
                <p className="mt-2 text-gray-400 text-sm">Duration: {formatDuration(callDuration)}</p>
              </motion.div>
            ) : (
              <iframe
                src={jitsiRoomUrl}
                allow="camera; microphone; fullscreen; display-capture; autoplay"
                className="w-full h-full border-0"
                title="Video Call"
              />
            )}

            {/* Call Info Overlay */}
            <AnimatePresence>
              {callStatus === "connected" && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="absolute top-4 left-4 right-4 flex items-center justify-between"
                >
                  <div className="bg-black/60 backdrop-blur-md rounded-lg px-4 py-2 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-white font-medium">{otherUserName}</span>
                    <Badge variant="secondary" className="bg-white/10 text-white border-0">
                      {formatDuration(callDuration)}
                    </Badge>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleFullscreen}
                    className="bg-black/60 backdrop-blur-md text-white hover:bg-black/80"
                  >
                    {isFullscreen ? (
                      <Minimize2 className="h-4 w-4" />
                    ) : (
                      <Maximize2 className="h-4 w-4" />
                    )}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Controls */}
          {callStatus !== "ended" && (
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              className="bg-gradient-to-t from-black via-black/95 to-transparent p-6"
            >
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                  className={`rounded-full w-14 h-14 ${
                    isVideoEnabled
                      ? "bg-white/10 hover:bg-white/20 text-white border-white/20"
                      : "bg-red-500 hover:bg-red-600 text-white border-0"
                  }`}
                >
                  {isVideoEnabled ? (
                    <Video className="h-5 w-5" />
                  ) : (
                    <VideoOff className="h-5 w-5" />
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                  className={`rounded-full w-14 h-14 ${
                    isAudioEnabled
                      ? "bg-white/10 hover:bg-white/20 text-white border-white/20"
                      : "bg-red-500 hover:bg-red-600 text-white border-0"
                  }`}
                >
                  {isAudioEnabled ? (
                    <Mic className="h-5 w-5" />
                  ) : (
                    <MicOff className="h-5 w-5" />
                  )}
                </Button>

                <Button
                  variant="destructive"
                  size="lg"
                  onClick={handleEndCall}
                  className="rounded-full w-16 h-16 bg-red-500 hover:bg-red-600"
                >
                  <PhoneOff className="h-6 w-6" />
                </Button>
              </div>

              <p className="text-center text-gray-400 text-xs mt-4">
                {callStatus === "connecting" ? "Establishing connection..." : "Call in progress"}
              </p>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
