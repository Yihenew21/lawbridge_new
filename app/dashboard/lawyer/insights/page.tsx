"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, BookOpen, Video, Trash2, Edit } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"

export default function LawyerInsightsPage() {
  const { user } = useAuth()
  const [insights, setInsights] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    content: "",
    video_url: ""
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (user?.id) {
      fetchMyInsights()
    }
  }, [user?.id])

  const fetchMyInsights = async () => {
    try {
      const res = await fetch(`/api/insights?lawyerId=${user?.id}`)
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

  const handleSubmit = async () => {
    if (!formData.title || !formData.category || !formData.content) {
      toast.error("Please fill in all required fields (Title, Category, Content).")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        setIsModalOpen(false)
        setFormData({ title: "", category: "", content: "", video_url: "" })
        fetchMyInsights() // refresh the list
        toast.success("Insight published successfully!")
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to publish insight")
      }
    } catch (e) {
      console.error(e)
      toast.error("An unexpected error occurred.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <DashboardShell role="lawyer">
      <div className="p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold font-serif md:text-3xl">My Insights & Vlogs</h1>
            <p className="mt-1 text-muted-foreground">Publish legal news, tips, and video logs directly to the community feed.</p>
          </div>
          <Button className="rounded-full gap-2" onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Publish Insight
          </Button>
        </motion.div>

        <div className="mt-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="h-64 bg-secondary/50 rounded-2xl animate-pulse" />
              <div className="h-64 bg-secondary/50 rounded-2xl animate-pulse" />
            </div>
          ) : insights.length === 0 ? (
            <Card className="border-border/50 col-span-full">
              <CardContent className="pt-16 pb-16 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">You haven't published any insights yet.</p>
                <Button variant="outline" size="sm" className="mt-4" onClick={() => setIsModalOpen(true)}>
                  Create Your First Post
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {insights.map((insight, i) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="h-full flex flex-col border-border/50 hover:border-primary/20 transition-all bg-card">
                    {insight.video_url && (
                       <div className="w-full flex items-center justify-center p-4 bg-secondary border-b border-border/50 text-muted-foreground">
                          <Video className="w-6 h-6 mr-2" /> Video Linked
                       </div>
                    )}
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                           <Badge variant="secondary" className="mb-2 bg-primary/10 text-primary">{insight.category}</Badge>
                           <CardTitle className="text-lg line-clamp-2">{insight.title}</CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                      <p className="text-sm text-muted-foreground line-clamp-3 flex-1 mb-4">{insight.content}</p>
                      <div className="flex items-center justify-between border-t border-border/50 pt-4 mt-auto">
                         <span className="text-xs text-muted-foreground">
                           {new Date(insight.created_at).toLocaleDateString()}
                         </span>
                         {/* We can add edit/delete in future iterations */}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg bg-card border-border/50">
          <DialogHeader>
            <DialogTitle>Publish a New Insight</DialogTitle>
            <DialogDescription>
              Share your expertise with the platform. Articles are visible exclusively on the public Insights feed.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
              <Input 
                id="title" 
                placeholder="e.g. 5 Common Mistakes in Ethiopian Property Law" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category <span className="text-destructive">*</span></Label>
              <Select value={formData.category} onValueChange={(val) => setFormData({...formData, category: val})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a legal area" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Family Law">Family Law</SelectItem>
                  <SelectItem value="Property Law">Property Law</SelectItem>
                  <SelectItem value="Corporate Law">Corporate Law</SelectItem>
                  <SelectItem value="Criminal Defense">Criminal Defense</SelectItem>
                  <SelectItem value="Legal News">Legal News</SelectItem>
                  <SelectItem value="Taxes & Finance">Taxes & Finance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="video_url">Video Vlog URL (Optional)</Label>
              <Input 
                id="video_url" 
                placeholder="https://youtube.com/watch?v=..." 
                value={formData.video_url}
                onChange={(e) => setFormData({...formData, video_url: e.target.value})}
              />
              <p className="text-[10px] text-muted-foreground">Paste a YouTube link to embed it beautifully as the cover visual.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content <span className="text-destructive">*</span></Label>
              <Textarea 
                id="content" 
                placeholder="Write your article here..." 
                className="min-h-32"
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Publishing..." : "Publish Insight"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  )
}
