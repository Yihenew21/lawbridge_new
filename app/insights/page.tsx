"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Video, FileText, User, Calendar, ExternalLink } from "lucide-react"

export default function InsightsPage() {
  const [insights, setInsights] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInsights()
  }, [])

  const fetchInsights = async () => {
    try {
      const res = await fetch("/api/insights")
      if (res.ok) {
        const data = await res.json()
        setInsights(data.insights || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Helper to extract YouTube ID from standard youtube URL for embedding
  const getEmbedUrl = (url: string) => {
    if (!url) return null
    if (url.includes("youtube.com/watch")) {
      const videoId = new URLSearchParams(new URL(url).search).get("v")
      if (videoId) return `https://www.youtube.com/embed/${videoId}`
    } else if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0]
      if (videoId) return `https://www.youtube.com/embed/${videoId}`
    }
    return url // fallback
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="inline-flex h-9 items-center justify-center rounded-full border border-primary/20 bg-primary/10 px-4 mb-6">
            <span className="text-sm font-medium text-primary">Discover the Law</span>
          </div>
          <h1 className="text-4xl font-serif font-bold tracking-tight md:text-5xl lg:text-6xl mb-6">
            Insights & <span className="text-primary italic">Vlogs</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Stay updated with the latest legal news, professional advice, and case studies directly from top verified lawyers on LawBridge.
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             <div className="h-80 bg-secondary/50 rounded-2xl animate-pulse" />
             <div className="h-80 bg-secondary/50 rounded-2xl animate-pulse" />
             <div className="h-80 bg-secondary/50 rounded-2xl animate-pulse" />
          </div>
        ) : insights.length === 0 ? (
          <div className="text-center py-24 bg-card rounded-3xl border border-border/50">
             <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
             <h2 className="text-2xl font-bold mb-2">No Insights Yet</h2>
             <p className="text-muted-foreground">Lawyers haven't published any insights or vlogs yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {insights.map((insight, idx) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="h-full flex flex-col hover:border-primary/30 transition-all overflow-hidden rounded-2xl bg-card border-border/50 shadow-sm hover:shadow-md group">
                  {insight.video_url && getEmbedUrl(insight.video_url) ? (
                    <div className="relative w-full aspect-video border-b border-border/50 bg-black">
                      <iframe 
                        className="absolute inset-0 w-full h-full"
                        src={getEmbedUrl(insight.video_url) as string}
                        title="Embedded Video"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                     <div className="h-2 w-full bg-gradient-to-r from-primary/40 to-primary/10" />
                  )}
                  
                  <CardHeader className="flex-none pt-6">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-0 rounded-md">
                        {insight.category}
                      </Badge>
                      {insight.video_url && !getEmbedUrl(insight.video_url) && (
                        <a href={insight.video_url} target="_blank" rel="noopener noreferrer" className="text-xs flex items-center gap-1 text-primary hover:underline">
                           External Link <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <CardTitle className="text-xl line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                      {insight.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <p className="text-muted-foreground line-clamp-4 text-sm flex-1 mb-6">
                      {insight.content}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-border/50 mt-auto">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                          <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <span className="text-sm font-medium truncate max-w-[120px]">
                          {insight.lawyer_name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                        <Calendar className="h-3 w-3" />
                        {new Date(insight.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </main>
  )
}
