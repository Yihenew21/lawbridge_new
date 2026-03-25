import { Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface Rating {
  id: string
  rating: number
  review: string
  first_name: string
  last_name: string
  created_at: string
}

interface RatingDisplayProps {
  ratings: Rating[]
  averageRating?: number
  totalReviews?: number
}

export function RatingDisplay({ ratings, averageRating, totalReviews }: RatingDisplayProps) {
  const avgRating = averageRating || (ratings.length > 0 ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1) : 0)

  return (
    <div className="space-y-4">
      {/* Average Rating Summary */}
      {ratings.length > 0 && (
        <div className="flex items-center gap-4 pb-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-5 w-5 ${i < Math.floor(Number(avgRating)) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'}`}
              />
            ))}
          </div>
          <div>
            <p className="font-semibold text-lg">{avgRating}</p>
            <p className="text-sm text-muted-foreground">{totalReviews || ratings.length} review{(totalReviews || ratings.length) !== 1 ? 's' : ''}</p>
          </div>
        </div>
      )}

      {/* Individual Ratings */}
      <div className="space-y-3">
        {ratings.map((rating) => (
          <div key={rating.id} className="rounded-lg border border-border/50 bg-secondary/30 p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < rating.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'}`}
                      />
                    ))}
                  </div>
                  <p className="text-sm font-medium">{rating.rating}/5</p>
                </div>
                {rating.review && <p className="text-sm text-foreground">{rating.review}</p>}
              </div>
              <div className="text-right text-xs text-muted-foreground shrink-0">
                <p className="font-medium text-foreground">{rating.first_name} {rating.last_name}</p>
                <p>{new Date(rating.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {ratings.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No ratings yet</p>
        </div>
      )}
    </div>
  )
}
