'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface RatingFormProps {
  caseId: string
  lawyerId: string
  onSuccess?: () => void
}

export function RatingForm({ caseId, lawyerId, onSuccess }: RatingFormProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [review, setReview] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Please select a rating')
      return
    }

    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const res = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          case_id: caseId,
          rated_user_id: lawyerId,
          rating,
          review: review || null,
        }),
      })

      if (res.ok) {
        setSuccess(true)
        setRating(0)
        setReview('')
        onSuccess?.()
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to submit rating')
      }
    } catch (err) {
      setError('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 rounded-lg border border-border/50 bg-secondary/30 p-4">
      <div>
        <p className="text-sm font-medium mb-3">Rate this lawyer</p>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`h-6 w-6 ${
                  star <= (hoveredRating || rating) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'
                }`}
              />
            </button>
          ))}
        </div>
        {rating > 0 && <p className="text-xs text-muted-foreground mt-2">{rating} out of 5 stars</p>}
      </div>

      <div>
        <label className="text-sm font-medium">Leave a review (optional)</label>
        <Textarea
          placeholder="Share your experience with this lawyer..."
          value={review}
          onChange={(e) => setReview(e.target.value)}
          className="mt-2 bg-background border-border/50 min-h-20"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {success && <p className="text-sm text-emerald-500">Rating submitted successfully!</p>}

      <Button onClick={handleSubmit} disabled={loading || rating === 0} className="w-full">
        {loading ? 'Submitting...' : 'Submit Rating'}
      </Button>
    </div>
  )
}
