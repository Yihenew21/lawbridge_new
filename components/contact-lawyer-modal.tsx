'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { X, Send, Loader2 } from 'lucide-react'

interface ContactLawyerModalProps {
  isOpen: boolean
  onClose: () => void
  lawyerName: string
  lawyerId: string
}

export function ContactLawyerModal({
  isOpen,
  onClose,
  lawyerName,
  lawyerId,
}: ContactLawyerModalProps) {
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) return

    setSending(true)
    try {
      const res = await fetch('/api/messages/direct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          lawyerId,
          message: `Subject: ${subject}\n\n${message}`,
        }),
      })

      if (res.ok) {
        setSent(true)
        setTimeout(() => {
          onClose()
          setSubject('')
          setMessage('')
          setSent(false)
        }, 2000)
      }
    } catch (err) {
      console.error('Failed to send message:', err)
    } finally {
      setSending(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className='absolute inset-0 bg-black/50 backdrop-blur-sm'
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className='relative w-full max-w-lg bg-card border border-border/50 rounded-2xl shadow-2xl overflow-hidden'
          >
            {/* Header */}
            <div className='flex items-center justify-between px-6 py-4 border-b border-border/50'>
              <div>
                <h2 className='text-lg font-semibold text-foreground'>Contact {lawyerName}</h2>
                <p className='text-xs text-muted-foreground mt-1'>Send a direct message</p>
              </div>
              <button
                onClick={onClose}
                className='text-muted-foreground hover:text-foreground transition-colors'
              >
                <X className='h-5 w-5' />
              </button>
            </div>

            {/* Content */}
            {sent ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className='px-6 py-12 text-center'
              >
                <div className='flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 mx-auto mb-4'>
                  <Send className='h-6 w-6 text-emerald-500' />
                </div>
                <h3 className='text-lg font-semibold text-foreground mb-2'>Message Sent!</h3>
                <p className='text-sm text-muted-foreground'>
                  {lawyerName} will respond to your message soon.
                </p>
              </motion.div>
            ) : (
              <div className='px-6 py-6 space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-foreground mb-2'>Subject</label>
                  <Input
                    placeholder='What is this about?'
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className='rounded-lg bg-secondary/50 border-border/50'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-foreground mb-2'>Message</label>
                  <Textarea
                    placeholder='Tell {lawyerName} more about your case or questions...'
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className='rounded-lg bg-secondary/50 border-border/50 min-h-32 resize-none'
                  />
                </div>

                <div className='flex gap-2 pt-4'>
                  <Button
                    onClick={handleSend}
                    disabled={!subject.trim() || !message.trim() || sending}
                    className='flex-1 rounded-lg gap-2'
                  >
                    {sending ? (
                      <>
                        <Loader2 className='h-4 w-4 animate-spin' />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className='h-4 w-4' />
                        Send Message
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={onClose}
                    variant='outline'
                    className='rounded-lg px-6'
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
