"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Briefcase, Shield, Zap, Users, CheckCircle2, Star } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0f172a]">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-[#0f172a]">FreelanceHub</span>
          </div>
          <nav className="hidden items-center gap-8 md:flex">
            <Link href="#features" className="text-sm font-medium text-gray-600 transition-colors hover:text-[#0f172a]">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium text-gray-600 transition-colors hover:text-[#0f172a]">
              How it works
            </Link>
            <Link href="#pricing" className="text-sm font-medium text-gray-600 transition-colors hover:text-[#0f172a]">
              Pricing
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-gray-600 hover:text-[#0f172a] hover:bg-gray-50">
                Sign in
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-[#22c55e] text-white hover:bg-[#16a34a] shadow-sm">
                Get started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-50 to-white px-6 pt-16">
        <div className="relative mx-auto max-w-5xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#22c55e]/20 bg-[#22c55e]/5 px-4 py-2 text-sm font-medium text-[#16a34a]">
            <Shield className="h-4 w-4" />
            Escrow-protected payments for every project
          </div>
          
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-[#0f172a] md:text-6xl lg:text-7xl">
            <span className="text-balance">Hire top freelancers with</span>
            <br />
            <span className="text-[#22c55e]">secure payments</span>
          </h1>
          
          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-gray-600">
            Connect with talented professionals worldwide. Our escrow system ensures 
            you only pay when you're satisfied with the work delivered.
          </p>
          
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/signup">
              <Button size="lg" className="h-14 bg-[#0f172a] px-8 text-base text-white hover:bg-[#1e293b] shadow-lg shadow-gray-900/10">
                Start hiring today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/signup?role=freelancer">
              <Button size="lg" variant="outline" className="h-14 border-gray-300 bg-white px-8 text-base text-[#0f172a] hover:bg-gray-50 hover:border-gray-400">
                Find freelance work
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="mt-16 flex flex-col items-center gap-4">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-[#f59e0b] text-[#f59e0b]" />
              ))}
              <span className="ml-2 text-sm font-medium text-gray-700">4.9/5 from 2,000+ reviews</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <span>Trusted by 10,000+ businesses</span>
              <span className="h-1 w-1 rounded-full bg-gray-300" />
              <span>$2M+ paid to freelancers</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="border-t border-gray-100 bg-white px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-[#0f172a] md:text-4xl">
              Everything you need to succeed
            </h2>
            <p className="mx-auto max-w-2xl text-gray-600">
              Powerful features designed to make freelancing and hiring seamless
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Briefcase,
                title: "Quality Projects",
                description: "Access diverse projects from verified clients worldwide",
                color: "bg-blue-50 text-blue-600",
              },
              {
                icon: Users,
                title: "Talented Network",
                description: "Connect with skilled professionals in every field",
                color: "bg-purple-50 text-purple-600",
              },
              {
                icon: Shield,
                title: "Escrow Protection",
                description: "Secure payments held until work is approved",
                color: "bg-green-50 text-[#22c55e]",
              },
              {
                icon: Zap,
                title: "Fast Payments",
                description: "Get paid quickly with automated payment releases",
                color: "bg-amber-50 text-amber-600",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:border-gray-200 hover:shadow-md"
              >
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${feature.color}`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-[#0f172a]">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="border-t border-gray-100 bg-gray-50 px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-[#0f172a] md:text-4xl">
              How it works
            </h2>
            <p className="mx-auto max-w-2xl text-gray-600">
              Get started in minutes with our simple process
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Create your profile",
                description: "Sign up and showcase your skills or post your first job in minutes",
              },
              {
                step: "02",
                title: "Connect and collaborate",
                description: "Browse jobs, submit proposals, or review freelancer applications",
              },
              {
                step: "03",
                title: "Get paid securely",
                description: "Complete milestones and receive payments through our escrow system",
              },
            ].map((item) => (
              <div key={item.step} className="relative rounded-2xl bg-white p-8 shadow-sm">
                <div className="mb-4 text-5xl font-bold text-[#22c55e]/20">{item.step}</div>
                <h3 className="mb-2 text-xl font-semibold text-[#0f172a]">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-gray-100 bg-[#0f172a] px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-white md:text-4xl">
            Ready to get started?
          </h2>
          <p className="mb-8 text-lg text-gray-400">
            Join thousands of freelancers and clients already using FreelanceHub
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/signup">
              <Button size="lg" className="h-14 bg-[#22c55e] px-8 text-base text-white hover:bg-[#16a34a]">
                Create free account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-gray-400">
            {["No credit card required", "Free plan available", "Cancel anytime"].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#22c55e]" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white px-6 py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0f172a]">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-[#0f172a]">FreelanceHub</span>
          </div>
          <p className="text-sm text-gray-500">
            2024 FreelanceHub. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
