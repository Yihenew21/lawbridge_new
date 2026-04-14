import Link from "next/link"
import { Scale } from "lucide-react"

const footerLinks = {
  Platform: [
    { label: "How It Works", href: "#how-it-works" },
    { label: "Browse Lawyers", href: "/lawyers" },
    { label: "Post a Case", href: "/dashboard/client" },
    { label: "Pricing", href: "#" },
  ],
  "For Lawyers": [
    { label: "Join as Lawyer", href: "/auth/register?role=lawyer" },
    { label: "Lawyer Dashboard", href: "/dashboard/lawyer" },
    { label: "Verification", href: "#" },
    { label: "Resources", href: "#" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Cookie Policy", href: "#" },
    { label: "Dispute Resolution", href: "#" },
  ],
  Support: [
    { label: "Help Center", href: "#" },
    { label: "Contact Us", href: "#" },
    { label: "FAQ", href: "#" },
    { label: "Report Issue", href: "#" },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/50">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Scale className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight font-serif text-foreground">
                LawBridge
              </span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              Ethiopia{"'"}s first legal services marketplace. Connecting people with verified lawyers.
            </p>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-foreground">{category}</h3>
              <ul className="mt-4 flex flex-col gap-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/50 pt-8 md:flex-row">
          <p className="text-xs text-muted-foreground">
            2026 LawBridge. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Built for Ethiopia, powered by trust.
          </p>
        </div>
      </div>
    </footer>
  )
}