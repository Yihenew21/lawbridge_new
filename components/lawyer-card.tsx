'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ContactLawyerModal } from '@/components/contact-lawyer-modal'
import { Star, CheckCircle2, MessageSquare, Briefcase, Award } from 'lucide-react'
import Link from 'next/link'

interface LawyerCardProps {
  id: string
  firstName: string
  lastName: string
  specialization: string
  bio: string
  averageRating: number
  totalRatings: number
  completedCases: number
  totalCases: number
  isVerified: boolean
}

export function LawyerCard({
  id,
  firstName,
  lastName,
  specialization,
  bio,
  averageRating,
  totalRatings,
  completedCases,
  totalCases,
  isVerified,
}: LawyerCardProps) {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)
  const completionRate = totalCases > 0 ? Math.round((completedCases / totalCases) * 100) : 0

  return (
    <Card className='border-border/50 hover:border-primary/30 transition-all hover:shadow-lg'>
      <CardHeader className='pb-4'>
        <div className='flex items-start justify-between gap-4'>
          <div className='flex-1'>
            <div className='flex items-center gap-2 mb-2'>
              <h3 className='text-lg font-semibold text-foreground'>
                {firstName} {lastName}
              </h3>
              {isVerified && (
                <CheckCircle2 className='h-5 w-5 text-emerald-500' aria-label='Verified Lawyer' />
              )}
            </div>
            <p className='text-sm text-muted-foreground mb-3'>{specialization}</p>
            <p className='text-xs text-muted-foreground line-clamp-2'>{bio}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className='space-y-4'>
        {/* Rating Section */}
        <div className='flex items-center gap-3 pb-3 border-b border-border/50'>
          <div className='flex items-center gap-1'>
            <Star className='h-4 w-4 fill-amber-400 text-amber-400' />
            <span className='font-bold text-foreground'>{averageRating.toFixed(1)}</span>
            <span className='text-xs text-muted-foreground'>({totalRatings} reviews)</span>
          </div>
        </div>

        {/* Stats Section */}
        <div className='grid grid-cols-2 gap-3'>
          <div className='rounded-lg bg-secondary/50 p-2 text-center'>
            <div className='flex items-center justify-center gap-1 mb-1'>
              <Briefcase className='h-3.5 w-3.5 text-primary' />
              <span className='text-sm font-semibold text-foreground'>{completedCases}</span>
            </div>
            <p className='text-xs text-muted-foreground'>Completed</p>
          </div>
          <div className='rounded-lg bg-secondary/50 p-2 text-center'>
            <div className='flex items-center justify-center gap-1 mb-1'>
              <Award className='h-3.5 w-3.5 text-amber-400' />
              <span className='text-sm font-semibold text-foreground'>{completionRate}%</span>
            </div>
            <p className='text-xs text-muted-foreground'>Success Rate</p>
          </div>
        </div>

        {/* Verification Badge */}
        {isVerified && (
          <Badge variant='outline' className='w-full justify-center py-1.5 text-xs'>
            <CheckCircle2 className='h-3 w-3 mr-1.5' />
            Verified Professional
          </Badge>
        )}

        {/* Actions */}
        <div className='flex gap-2 pt-2'>
          <Link href={`/lawyer/${id}`} className='flex-1'>
            <Button variant='outline' size='sm' className='w-full rounded-lg'>
              View Profile
            </Button>
          </Link>
          <Button 
            size='sm' 
            className='flex-1 rounded-lg gap-2'
            onClick={() => setIsContactModalOpen(true)}
          >
            <MessageSquare className='h-3.5 w-3.5' />
            Contact
          </Button>
        </div>

        {/* Contact Modal */}
        <ContactLawyerModal
          isOpen={isContactModalOpen}
          onClose={() => setIsContactModalOpen(false)}
          lawyerName={`${firstName} ${lastName}`}
          lawyerId={id}
        />
      </CardContent>
    </Card>
  )
}
