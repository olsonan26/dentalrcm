import { useAuth } from "@/contexts/SupabaseAuthContext";
import {
  ArrowRight,
  BarChart3,
  Brain,
  Check,
  ChevronRight,
  FileText,
  Layers,
  Play,
  Shield,
  ShieldCheck,
  Star,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Brain,
    title: "AI Claim Scrubbing",
    description:
      "Machine learning trained on 21B+ data points catches errors before submission — boosting first-pass acceptance to 98%.",
    color: "text-chart-1",
    bg: "bg-chart-1/10",
  },
  {
    icon: Shield,
    title: "EDI & Clearinghouse",
    description:
      "Native 837D / 835 / 270 / 271 support. Submit claims electronically and receive ERAs automatically.",
    color: "text-chart-2",
    bg: "bg-chart-2/10",
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    description:
      "Track collections, A/R aging, denial trends, and provider production from a single dashboard.",
    color: "text-chart-3",
    bg: "bg-chart-3/10",
  },
  {
    icon: Layers,
    title: "40+ PMS Integrations",
    description:
      "Open Dental, Dentrix, Eaglesoft, Curve and more — zero double-entry.",
    color: "text-chart-4",
    bg: "bg-chart-4/10",
  },
  {
    icon: Zap,
    title: "Automated Workflows",
    description:
      "From eligibility verification to payment posting, automate every step of the billing workflow.",
    color: "text-chart-5",
    bg: "bg-chart-5/10",
  },
  {
    icon: FileText,
    title: "Appeal Management",
    description:
      "AI-generated appeal letters with denial tracking. Auto-generate appeals in seconds, not hours.",
    color: "text-chart-1",
    bg: "bg-chart-1/10",
  },
];

const stats = [
  { value: "98%", label: "Clean Claim Rate", description: "First-pass acceptance" },
  { value: "22%", label: "More Collections", description: "Average increase" },
  { value: "40+", label: "PMS Integrations", description: "Connect any system" },
  { value: "<48h", label: "Claims Processed", description: "Average turnaround" },
];

const testimonials = [
  {
    quote: "DentalRCM cut our claim denials by 60% in the first three months. The AI scrubbing alone paid for itself.",
    name: "Dr. Sarah Mitchell",
    title: "Mitchell Family Dentistry",
    rating: 5,
  },
  {
    quote: "We went from spending 30 hours a week on billing to under 10. The automation is incredible.",
    name: "Lisa Chen, RDH",
    title: "Billing Manager — Pacific Dental Group",
    rating: 5,
  },
  {
    quote: "The real-time analytics finally gave me visibility into our revenue cycle. I know exactly where every dollar is.",
    name: "Dr. James Walker",
    title: "Walker Orthodontics (3 locations)",
    rating: 5,
  },
];

const pricingPlans = [
  {
    name: "Starter",
    price: "$299",
    period: "/mo",
    description: "For solo practices",
    features: [
      "Up to 500 claims/month",
      "AI claim scrubbing",
      "Basic reporting",
      "1 PMS integration",
      "Email support",
    ],
    cta: "Start Free Trial",
    highlighted: false,
  },
  {
    name: "Professional",
    price: "$599",
    period: "/mo",
    description: "For growing practices",
    features: [
      "Up to 2,000 claims/month",
      "AI claim scrubbing + appeal generation",
      "Advanced analytics & reports",
      "Unlimited PMS integrations",
      "Payment posting & reconciliation",
      "Priority support",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For DSOs & multi-location",
    features: [
      "Unlimited claims",
      "Dedicated billing specialists",
      "Custom integrations",
      "Multi-location management",
      "SLA guarantee",
      "Dedicated account manager",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

const faqs = [
  {
    q: "How long does onboarding take?",
    a: "Most practices are fully operational in 48-72 hours. Our team handles PMS integration, data migration, and staff training at no extra charge.",
  },
  {
    q: "Is DentalRCM HIPAA compliant?",
    a: "Absolutely. We maintain SOC 2 Type II certification, encrypt all data at rest and in transit, and undergo annual third-party security audits.",
  },
  {
    q: "Which practice management systems do you integrate with?",
    a: "We support 40+ PMS platforms including Open Dental, Dentrix, Eaglesoft, Curve, Denticon, and many more. Custom integrations are available for Enterprise plans.",
  },
  {
    q: "What makes the AI scrubbing different?",
    a: "Our CoPilot AI is trained on 21 billion data points from dental claims. It checks CDT code accuracy, narrative requirements, documentation gaps, and payer-specific rules before submission.",
  },
  {
    q: "Can I try before I commit?",
    a: "Yes — every plan includes a 14-day free trial with full access to all features. No credit card required.",
  },
];

export function LandingPage() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* ─── Hero ─── */}
      <section className="relative flex flex-col items-center justify-center px-4 pt-20 pb-16 md:pt-28 md:pb-24">
        {/* Background: dot pattern */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,hsl(var(--border))_1px,transparent_0)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_60%,transparent_100%)] opacity-60" />
        </div>

        <div className="mx-auto max-w-5xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-background text-xs font-medium shadow-sm">
            <ShieldCheck className="size-3.5 text-chart-1" />
            AI-Powered Dental Revenue Cycle Management
            <ArrowRight className="size-3" />
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08]">
            Maximize Your{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Dental Collections
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-base md:text-lg text-muted-foreground leading-relaxed">
            Intelligent claim scrubbing, automated billing workflows, and
            real-time analytics — purpose-built for dental practices that want
            to collect more and worry less.
          </p>

          {!isAuthenticated && !isLoading && (
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button size="lg" className="text-base h-12 px-8" asChild>
                <Link to="/signup">
                  Start Free Trial
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-base h-12 px-8" asChild>
                <Link to="/login">
                  <Play className="mr-2 size-4" />
                  Watch Demo
                </Link>
              </Button>
            </div>
          )}
          {isAuthenticated && (
            <div className="pt-2">
              <Button size="lg" className="text-base h-12 px-8" asChild>
                <Link to="/dashboard">
                  Go to Dashboard
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-4 text-sm text-muted-foreground">
            {["HIPAA Compliant", "40+ PMS Integrations", "98% Clean Claim Rate", "SOC 2 Type II"].map(
              (item) => (
                <div key={item} className="flex items-center gap-1.5">
                  <Check className="size-4 text-chart-1" />
                  <span>{item}</span>
                </div>
              )
            )}
          </div>
        </div>

        {/* Dashboard preview */}
        <div className="mx-auto mt-16 max-w-5xl w-full px-4">
          <div className="relative">
            <div className="absolute top-2 lg:-top-8 left-1/2 -translate-x-1/2 w-[90%] h-24 lg:h-64 bg-primary/30 rounded-full blur-3xl" />
            <div className="relative rounded-xl border bg-card shadow-2xl overflow-hidden">
              <div className="bg-muted/50 px-4 py-3 border-b flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="size-3 rounded-full bg-red-400/60" />
                  <div className="size-3 rounded-full bg-yellow-400/60" />
                  <div className="size-3 rounded-full bg-green-400/60" />
                </div>
                <div className="flex-1 mx-8">
                  <div className="mx-auto max-w-sm h-5 rounded-md bg-muted border text-xs flex items-center justify-center text-muted-foreground">
                    dentalrcm.com/dashboard
                  </div>
                </div>
              </div>
              <div className="p-3 sm:p-6 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                {[
                  { label: "Monthly Collections", value: "$127,450", trend: "+12%" },
                  { label: "A/R Balance", value: "$42,380", trend: "-8%" },
                  { label: "Clean Claim Rate", value: "96.4%", trend: "+2.1%" },
                  { label: "Avg Days to Payment", value: "18.2", trend: "-3.5" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-lg border bg-background p-2 sm:p-3 overflow-hidden">
                    <p className="text-[10px] text-muted-foreground truncate">{stat.label}</p>
                    <p className="text-sm sm:text-lg font-bold mt-1 truncate">{stat.value}</p>
                    <p className="text-[10px] text-chart-2 font-medium">{stat.trend}</p>
                  </div>
                ))}
              </div>
              <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-b from-transparent to-card" />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats ─── */}
      <section className="py-12 sm:py-16 relative border-y">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
        <div className="container mx-auto px-4 relative">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <Card key={stat.label} className="text-center bg-background/60 backdrop-blur-sm border-border/50">
                <CardContent className="p-6">
                  <h3 className="text-3xl sm:text-4xl font-bold text-foreground">{stat.value}</h3>
                  <p className="font-semibold text-foreground mt-1">{stat.label}</p>
                  <p className="text-sm text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="py-20 md:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Platform Features</Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              End-to-End Revenue Cycle Management
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              From eligibility verification to payment posting — every step of
              your billing workflow, streamlined and automated.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-background to-muted/50 border p-6 md:p-8 transition-all hover:shadow-lg hover:border-foreground/20"
              >
                <div className="absolute top-0 right-0 -mt-4 -mr-4 size-24 rounded-full bg-primary/5 blur-2xl transition-all group-hover:bg-primary/10" />
                <div className="relative">
                  <div className={`inline-flex size-11 items-center justify-center rounded-xl ${feature.bg} mb-5`}>
                    <feature.icon className={`size-5 ${feature.color}`} />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">How It Works</Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Get Started in Three Steps
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "01",
                title: "Connect Your PMS",
                desc: "Plug in your practice management system. We support 40+ platforms and handle the integration for you.",
                icon: Layers,
              },
              {
                step: "02",
                title: "AI Scrubs Your Claims",
                desc: "Our CoPilot reviews every claim for coding errors, missing info, and payer-specific rules before submission.",
                icon: Brain,
              },
              {
                step: "03",
                title: "Collect More Revenue",
                desc: "Watch your clean claim rate soar and denials drop. Real-time dashboards keep you informed.",
                icon: BarChart3,
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-primary/10">
                  <item.icon className="size-7 text-primary" />
                </div>
                <div className="text-xs font-bold text-primary tracking-widest mb-2">
                  STEP {item.step}
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="py-20 md:py-28 bg-muted/30 border-y">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Testimonials</Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Trusted by 3,000+ Dental Practices
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((t) => (
              <Card key={t.name} className="bg-background">
                <CardContent className="p-6">
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <blockquote className="text-sm leading-relaxed mb-4">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.title}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Pricing</Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Plans That Scale With Your Practice
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              14-day free trial on every plan. No credit card required.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto items-start">
            {pricingPlans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative overflow-hidden ${
                  plan.highlighted
                    ? "border-primary shadow-lg ring-1 ring-primary/20"
                    : ""
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
                )}
                <CardContent className="p-6">
                  {plan.highlighted && (
                    <Badge className="mb-3">Most Popular</Badge>
                  )}
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.period && (
                      <span className="text-muted-foreground">{plan.period}</span>
                    )}
                  </div>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <Check className="size-4 text-chart-2 mt-0.5 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={plan.highlighted ? "default" : "outline"}
                    asChild
                  >
                    <Link to="/signup">
                      {plan.cta}
                      <ChevronRight className="ml-1 size-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="py-20 md:py-28 bg-muted/30 border-t">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">FAQ</Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq) => (
              <details key={faq.q} className="group rounded-lg border bg-background">
                <summary className="flex cursor-pointer items-center justify-between p-5 font-medium text-sm">
                  {faq.q}
                  <ChevronRight className="size-4 text-muted-foreground transition-transform group-open:rotate-90" />
                </summary>
                <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center rounded-2xl bg-primary p-10 md:p-16 text-primary-foreground">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Ready to Collect More?
            </h2>
            <p className="text-primary-foreground/80 mb-8 text-lg max-w-xl mx-auto">
              Join 3,000+ dental practices that increased collections by an
              average of 22%. Start your free trial today.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" variant="secondary" className="text-base h-12 px-8 bg-background text-foreground hover:bg-background/90" asChild>
                <Link to="/signup">
                  Start Free Trial
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-base h-12 px-8 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10" asChild>
                <a href="mailto:sales@dentalrcm.com">
                  Contact Sales
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 font-semibold text-lg mb-3">
                <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" className="size-5 text-primary-foreground" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L4 6v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V6l-8-4z" />
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                </div>
                DentalRCM
              </div>
              <p className="text-sm text-muted-foreground">
                AI-powered dental revenue cycle management for modern practices.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Changelog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="mailto:sales@dentalrcm.com" className="hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">BAA (HIPAA)</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} DentalRCM. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
