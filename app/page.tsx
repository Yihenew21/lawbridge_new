"use client"

import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/landing/hero-section"
import { HowItWorksSection } from "@/components/landing/how-it-works-section"
import { ServicesSection } from "@/components/landing/services-section"
import { LawyersSection } from "@/components/landing/lawyers-section"
import { TestimonialsSection } from "@/components/landing/testimonials-section"
import { CTASection } from "@/components/landing/cta-section"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <HowItWorksSection />
      <ServicesSection />
      <LawyersSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </main>
  )
}
