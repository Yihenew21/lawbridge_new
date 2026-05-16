"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ScheduleCallDialogProps {
  isOpen: boolean
  onClose: () => void
  conversationId: string
  participantId: string
  participantName: string
  onScheduled?: () => void
}

export function ScheduleCallDialog({
  isOpen,
  onClose,
  conversationId,
  participantId,
  participantName,
  onScheduled
}: ScheduleCallDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [scheduledDate, setScheduledDate] = useState("")
  const [scheduledTime, setScheduledTime] = useState("")
  const [duration, setDuration] = useState("60")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !scheduledDate || !scheduledTime) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    // Combine date and time
    const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`)

    // Validate future date
    if (scheduledAt <= new Date()) {
      toast({
        title: "Invalid date",
        description: "Please select a future date and time",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch("/api/scheduled-calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          conversationId,
          participantId,
          title,
          description,
          scheduledAt: scheduledAt.toISOString(),
          durationMinutes: parseInt(duration)
        })
      })

      if (res.ok) {
        toast({
          title: "Call scheduled",
          description: `Video call scheduled with ${participantName}`
        })
        onScheduled?.()
        onClose()
        // Reset form
        setTitle("")
        setDescription("")
        setScheduledDate("")
        setScheduledTime("")
        setDuration("60")
      } else {
        const data = await res.json()
        throw new Error(data.error || "Failed to schedule call")
      }
    } catch (error) {
      console.error("Error scheduling call:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to schedule call",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule Video Call</DialogTitle>
          <DialogDescription>
            Schedule a video call with {participantName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Meeting Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Case Discussion"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Add meeting agenda or notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time *</Label>
              <Input
                id="time"
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              min="15"
              max="240"
              step="15"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              <Calendar className="h-4 w-4" />
              {isSubmitting ? "Scheduling..." : "Schedule Call"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
