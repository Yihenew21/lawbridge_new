"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Video, Phone, PhoneOff } from "lucide-react"
import { motion } from "framer-motion"

interface IncomingCallModalProps {
  isOpen: boolean
  callerName: string
  callerAvatar?: string
  callType: "video" | "audio"
  onAccept: () => void
  onDecline: () => void
}

export function IncomingCallModal({
  isOpen,
  callerName,
  callerAvatar,
  callType,
  onAccept,
  onDecline
}: IncomingCallModalProps) {
  const [ringCount, setRingCount] = useState(0)

  useEffect(() => {
    if (!isOpen) {
      setRingCount(0)
      return
    }

    // Animate ringing
    const interval = setInterval(() => {
      setRingCount((prev) => prev + 1)
    }, 1000)

    // Auto-decline after 30 seconds
    const timeout = setTimeout(() => {
      onDecline()
    }, 30000)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [isOpen, onDecline])

  return (
    <Dialog open={isOpen} onOpenChange={onDecline}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="p-8 flex flex-col items-center">
          {/* Animated Avatar */}
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="relative mb-6"
          >
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
            <Avatar className="h-24 w-24 border-4 border-primary/50 relative z-10">
              <AvatarImage src={callerAvatar} />
              <AvatarFallback className="text-2xl">
                {callerName.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
          </motion.div>

          {/* Caller Info */}
          <h3 className="text-2xl font-semibold mb-2">{callerName}</h3>
          <p className="text-muted-foreground mb-1">
            Incoming {callType} call
          </p>
          <p className="text-xs text-muted-foreground">
            {ringCount > 0 && `Ringing... (${ringCount}s)`}
          </p>

          {/* Call Icon */}
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
            className="my-6"
          >
            {callType === "video" ? (
              <Video className="h-12 w-12 text-primary" />
            ) : (
              <Phone className="h-12 w-12 text-primary" />
            )}
          </motion.div>

          {/* Action Buttons */}
          <div className="flex gap-4 w-full mt-4">
            <Button
              variant="destructive"
              size="lg"
              onClick={onDecline}
              className="flex-1 rounded-full h-14 gap-2"
            >
              <PhoneOff className="h-5 w-5" />
              Decline
            </Button>
            <Button
              size="lg"
              onClick={onAccept}
              className="flex-1 rounded-full h-14 gap-2 bg-green-500 hover:bg-green-600"
            >
              {callType === "video" ? (
                <Video className="h-5 w-5" />
              ) : (
                <Phone className="h-5 w-5" />
              )}
              Accept
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
