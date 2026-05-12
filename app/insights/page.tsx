"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Video, FileText, User, Calendar, ExternalLink, Play, BookOpen, Scale } from "lucide-react"

export default function InsightsPage() {
  const [insights, setInsights] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>("All")

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

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "Family Law": "bg-rose-500/10 text-rose-700 border-rose-200 dark:bg-rose-500/20 dark:text-rose-400",
      "Corporate Law": "bg-blue-500/10 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400",
      "Property Law": "bg-emerald-500/10 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400",
      "Legal News": "bg-purple-500/10 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-400",
      "Criminal Law": "bg-red-500/10 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400",
    }
    return colors[category] || "bg-primary/10 text-primary border-primary/20"
  }

  const categories = ["All", ...Array.from(new Set(insights.map(i => i.category)))]
  const filteredInsights = selectedCategory === "All"
    ? insights
    : insights.filter(i => i.category === selectedCategory)

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <div className="inline-flex h-10 items-center justify-center rounded-full border border-primary/20 bg-primary/5 px-5 mb-6">
            <BookOpen className="w-4 h-4 mr-2 text-primary" />
            <span className="text-sm font-medium text-primary">Legal Knowledge Hub</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight mb-6">
            Insights & <span className="text-primary italic">Expert Vlogs</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Stay informed with the latest legal insights, professional advice, and case studies
            from Ethiopia's top verified lawyers.
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12 flex flex-wrap justify-center gap-3"
        >
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="rounded-full transition-all"
            >
              {category}
            </Button>
          ))}
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
             <div className="h-96 bg-secondary/30 rounded-2xl animate-pulse" />
             <div className="h-96 bg-secondary/30 rounded-2xl animate-pulse" />
             <div className="h-96 bg-secondary/30 rounded-2xl animate-pulse" />
          </div>
        ) : filteredInsights.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-24 bg-card rounded-3xl border border-border/50 shadow-sm"
          >
             <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-6">
               <FileText className="w-10 h-10 text-primary" />
             </div>
             <h2 className="text-2xl font-bold mb-3">No Insights Available</h2>
             <p className="text-muted-foreground max-w-md mx-auto">
               {selectedCategory === "All"
                 ? "Lawyers haven't published any insights yet. Check back soon!"
                 : `No insights found in ${selectedCategory}. Try another category.`}
             </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filteredInsights.map((insight, idx) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.4 }}
              >
                <Card className="h-full flex flex-col hover:shadow-xl hover:border-primary/30 transition-all duration-300 overflow-hidden rounded-2xl bg-card border-border/50 group">
                  {/* Video/Header Section */}
                  {insight.video_url && getEmbedUrl(insight.video_url) ? (
                    <div className="relative w-full aspect-video border-b border-border/50 bg-gradient-to-br from-primary/5 to-primary/10 overflow-hidden">
                      <iframe
                        className="absolute inset-0 w-full h-full"
                        src={getEmbedUrl(insight.video_url) as string}
                        title="Embedded Video"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                      <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <Play className="w-3 h-3" />
                        Video
                      </div>
                    </div>
                  ) : (
                     <div className="h-2 w-full bg-gradient-to-r from-primary via-primary/60 to-primary/30" />
                  )}

                  <CardHeader className="flex-none pt-6 pb-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge
                        variant="secondary"
                        className={`${getCategoryColor(insight.category)} border font-medium px-3 py-1 rounded-lg`}
                      >
                        {insight.category}
                      </Badge>
                      {insight.video_url && !getEmbedUrl(insight.video_url) && (
                        <a
                          href={insight.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs flex items-center gap-1 text-primary hover:underline font-medium"
                        >
                           <ExternalLink className="w-3 h-3" />
                           Watch
                        </a>
                      )}
                    </div>
                    <CardTitle className="text-xl font-bold line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                      {insight.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="flex-1 flex flex-col pt-0">
                    <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed flex-1 mb-6">
                      {insight.content}
                    </p>

                    {/* Author & Date Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-border/50 mt-auto">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0 border border-primary/10">
                          <Scale className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-foreground truncate max-w-[140px]">
                            {insight.lawyer_name}
                          </span>
                          <span className="text-xs text-muted-foreground">Verified Lawyer</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(insight.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
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
