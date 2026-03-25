'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RatingDisplay } from '@/components/rating-display'
import { ContactLawyerModal } from '@/components/contact-lawyer-modal'
import { ArrowLeft, Star, CheckCircle2, Briefcase, Award, MessageSquare, Phone, Mail, BookOpen, Video } from 'lucide-react'
import Link from 'next/link'

export default function LawyerProfilePage() {
  const params = useParams()
  const lawyerId = params.id as string

  const [lawyer, setLawyer] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)

  useEffect(() => {
    fetchLawyerProfile()
  }, [lawyerId])

  const fetchLawyerProfile = async () => {
    try {
      const res = await fetch(`/api/lawyers/${lawyerId}`, {
        credentials: 'include',
      })

      if (res.ok) {
        const data = await res.json()
        setLawyer(data.lawyer)
      }
    } catch (err) {
      console.error('Failed to fetch lawyer profile:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className='flex flex-col min-h-screen bg-background'>
        <Navbar />
        <main className='flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
          <div className='space-y-6'>
            <div className='h-32 bg-secondary/50 rounded-2xl animate-pulse' />
            <div className='h-64 bg-secondary/50 rounded-2xl animate-pulse' />
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!lawyer) {
    return (
      <div className='flex flex-col min-h-screen bg-background'>
        <Navbar />
        <main className='flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center'>
          <h1 className='text-2xl font-bold text-foreground mb-4'>Lawyer not found</h1>
          <Link href='/lawyers'>
            <Button>Back to Lawyers</Button>
          </Link>
        </main>
        <Footer />
      </div>
    )
  }

  const completionRate = lawyer.total_cases > 0 ? Math.round((lawyer.completed_cases / lawyer.total_cases) * 100) : 0

  return (
    <div className='flex flex-col min-h-screen bg-background'>
      <Navbar />

      <main className='flex-1'>
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6'
        >
          <Link href='/lawyers' className='inline-flex items-center gap-2 text-primary hover:underline'>
            <ArrowLeft className='h-4 w-4' />
            Back to Lawyers
          </Link>
        </motion.div>

        {/* Profile Header */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'
        >
          <Card className='border-border/50'>
            <CardContent className='pt-8'>
              <div className='flex flex-col md:flex-row gap-8'>
                {/* Avatar */}
                <div className='shrink-0'>
                  <div className='flex h-32 w-32 items-center justify-center rounded-2xl bg-primary/10 text-primary text-4xl font-bold font-serif'>
                    {lawyer.first_name[0]}{lawyer.last_name[0]}
                  </div>
                </div>

                {/* Info */}
                <div className='flex-1'>
                  <div className='flex items-start justify-between gap-4 mb-4'>
                    <div>
                      <h1 className='text-3xl font-bold text-foreground'>
                        {lawyer.first_name} {lawyer.last_name}
                      </h1>
                      <p className='text-lg text-muted-foreground mt-2'>{lawyer.specialization}</p>
                    </div>
                    {lawyer.is_verified && (
                      <Badge className='gap-2 bg-emerald-500/10 text-emerald-600 border-emerald-500/30'>
                        <CheckCircle2 className='h-4 w-4' />
                        Verified
                      </Badge>
                    )}
                  </div>

                  {/* Stats Grid */}
                  <div className='grid grid-cols-3 gap-4 mt-6'>
                    <div className='rounded-lg bg-secondary/50 p-4 text-center'>
                      <div className='text-2xl font-bold text-foreground'>{lawyer.average_rating.toFixed(1)}</div>
                      <div className='flex items-center justify-center gap-1 mt-1'>
                        <Star className='h-3 w-3 fill-amber-400 text-amber-400' />
                        <p className='text-xs text-muted-foreground'>{lawyer.total_ratings} reviews</p>
                      </div>
                    </div>
                    <div className='rounded-lg bg-secondary/50 p-4 text-center'>
                      <div className='text-2xl font-bold text-foreground'>{lawyer.completed_cases}</div>
                      <p className='text-xs text-muted-foreground mt-1'>Completed Cases</p>
                    </div>
                    <div className='rounded-lg bg-secondary/50 p-4 text-center'>
                      <div className='text-2xl font-bold text-foreground'>{completionRate}%</div>
                      <p className='text-xs text-muted-foreground mt-1'>Success Rate</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Bio Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'
        >
          <Card className='border-border/50'>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-muted-foreground leading-relaxed'>{lawyer.bio}</p>
            </CardContent>
          </Card>
        </motion.section>

        {/* Services Section */}
        {lawyer.services && lawyer.services.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'
          >
            <h2 className="text-2xl font-bold font-serif mb-6 text-foreground">Featured Services</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {lawyer.services.map((service: any) => (
                <Card key={service.id} className="border-border/50 hover:border-primary/30 transition-all bg-secondary/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{service.title}</CardTitle>
                    <Badge variant="secondary" className="w-fit mt-1">{service.category}</Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{service.description}</p>
                    <div className="flex items-center justify-between border-t border-border/50 pt-4 mt-2">
                       <p className="text-lg font-bold text-primary">{service.price}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.section>
        )}

        {/* Insights Section */}
        {lawyer.insights && lawyer.insights.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.18 }}
            className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'
          >
            <h2 className="text-2xl font-bold font-serif mb-6 text-foreground">Insights & Publications</h2>
            <div className="space-y-4">
              {lawyer.insights.map((insight: any) => (
                <Card key={insight.id} className="border-border/50 bg-secondary/10">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {insight.video_url ? <Video className="h-4 w-4 text-primary" /> : <BookOpen className="h-4 w-4 text-primary" />}
                          {insight.title}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {new Date(insight.created_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Badge variant="outline">{insight.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{insight.content}</p>
                    {insight.video_url && (
                      <a 
                        href={insight.video_url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="inline-flex items-center text-sm font-medium text-primary hover:underline"
                      >
                        Watch Attached Media →
                      </a>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.section>
        )}

        {/* Contact Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'
        >
          <Card className='border-border/50'>
            <CardHeader>
              <CardTitle>Get in Touch</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              {lawyer.email && (
                <div className='flex items-center gap-3'>
                  <Mail className='h-5 w-5 text-muted-foreground' />
                  <a href={`mailto:${lawyer.email}`} className='text-primary hover:underline'>
                    {lawyer.email}
                  </a>
                </div>
              )}
              {lawyer.phone && (
                <div className='flex items-center gap-3'>
                  <Phone className='h-5 w-5 text-muted-foreground' />
                  <a href={`tel:${lawyer.phone}`} className='text-primary hover:underline'>
                    {lawyer.phone}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.section>

        {/* Reviews Section */}
        {lawyer.ratings && lawyer.ratings.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'
          >
            <Card className='border-border/50'>
              <CardHeader>
                <CardTitle>Reviews ({lawyer.ratings.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <RatingDisplay ratings={lawyer.ratings} />
              </CardContent>
            </Card>
          </motion.section>
        )}

        {/* Action Buttons */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12'
        >
          <div className='flex flex-col sm:flex-row gap-4'>
            <Button 
              className='flex-1 rounded-xl h-12 gap-2'
              onClick={() => setIsContactModalOpen(true)}
            >
              <MessageSquare className='h-4 w-4' />
              Send Message
            </Button>
            <Button variant='outline' className='flex-1 rounded-xl h-12' onClick={() => window.history.back()}>
              Go Back
            </Button>
          </div>
        </motion.section>

        {/* Contact Modal */}
        <ContactLawyerModal
          isOpen={isContactModalOpen}
          onClose={() => setIsContactModalOpen(false)}
          lawyerName={`${lawyer?.first_name} ${lawyer?.last_name}`}
          lawyerId={lawyerId}
        />
      </main>

      <Footer />
    </div>
  )
}
