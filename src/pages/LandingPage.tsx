import { useConvexAuth } from "convex/react";
import {
  ArrowRight,
  Check,
  BarChart3,
  Brain,
  Layers,
  Shield,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function LandingPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Hero */}
      <section className="relative flex-1 flex flex-col items-center justify-center px-4 py-16 md:py-24">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40" />
        </div>

        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-background text-xs font-medium">
            <ShieldCheck className="size-3 text-chart-1" />
            AI-Powered Dental Revenue Cycle Management
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
            Maximize Your
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-foreground via-foreground/80 to-foreground/60">
              Dental Collections
            </span>
          </h1>

          <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Intelligent claim scrubbing, automated billing workflows, and
            real-time analytics — purpose-built for dental practices that want
            to collect more and worry less.
          </p>

          {!isAuthenticated && !isLoading && (
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button size="lg" className="text-base h-11 px-6" asChild>
                <Link to="/signup">
                  Start Free Trial
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-base h-11 px-6"
                asChild
              >
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          )}
          {isAuthenticated && (
            <div className="pt-2">
              <Button size="lg" className="text-base h-11 px-6" asChild>
                <Link to="/dashboard">
                  Go to Dashboard
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          )}

          <div className="flex items-center justify-center gap-6 pt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Check className="size-4 text-chart-1" />
              <span>HIPAA Compliant</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="size-4 text-chart-1" />
              <span>40+ PMS Integrations</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5">
              <Check className="size-4 text-chart-1" />
              <span>98% Clean Claim Rate</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 md:py-32 border-t bg-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-muted-foreground mb-3 tracking-wide uppercase">
              Platform Features
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              End-to-End Revenue Cycle
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">
              From eligibility verification to payment posting — every step of
              your billing workflow, streamlined and automated.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-background to-muted/50 border p-6 md:p-8 transition-all hover:shadow-lg hover:border-foreground/20">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 size-24 rounded-full bg-chart-1/10 blur-2xl transition-all group-hover:bg-chart-1/20" />
              <div className="relative">
                <div className="inline-flex size-11 items-center justify-center rounded-xl bg-chart-1/10 mb-5">
                  <Brain className="size-5 text-chart-1" />
                </div>
                <h3 className="font-semibold text-lg mb-2">AI Claim Scrubbing</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Machine learning trained on millions of dental claims catches
                  errors before submission — boosting first-pass acceptance to 98%.
                </p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-background to-muted/50 border p-6 md:p-8 transition-all hover:shadow-lg hover:border-foreground/20">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 size-24 rounded-full bg-chart-2/10 blur-2xl transition-all group-hover:bg-chart-2/20" />
              <div className="relative">
                <div className="inline-flex size-11 items-center justify-center rounded-xl bg-chart-2/10 mb-5">
                  <Shield className="size-5 text-chart-2" />
                </div>
                <h3 className="font-semibold text-lg mb-2">EDI & Clearinghouse</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Native 837D/835/270/271 support. Submit claims electronically
                  and receive ERAs automatically — no manual downloads.
                </p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-background to-muted/50 border p-6 md:p-8 transition-all hover:shadow-lg hover:border-foreground/20">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 size-24 rounded-full bg-chart-3/10 blur-2xl transition-all group-hover:bg-chart-3/20" />
              <div className="relative">
                <div className="inline-flex size-11 items-center justify-center rounded-xl bg-chart-3/10 mb-5">
                  <BarChart3 className="size-5 text-chart-3" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Real-Time Analytics</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Track collections, A/R aging, denial trends, and provider
                  production from a single, real-time dashboard.
                </p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-background to-muted/50 border p-6 md:p-8 md:col-span-2 lg:col-span-2 transition-all hover:shadow-lg hover:border-foreground/20">
              <div className="absolute bottom-0 left-0 -mb-8 -ml-8 size-32 rounded-full bg-chart-4/10 blur-2xl transition-all group-hover:bg-chart-4/20" />
              <div className="relative flex flex-col md:flex-row md:items-center gap-6">
                <div className="inline-flex size-14 shrink-0 items-center justify-center rounded-2xl bg-chart-4/10">
                  <Layers className="size-7 text-chart-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    40+ Practice Management Integrations
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Plug in to Open Dental, Dentrix, Eaglesoft, Curve, and
                    dozens more. We pull patient data, procedures, and insurance
                    info directly — zero double-entry.
                  </p>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl bg-primary text-primary-foreground p-6 md:p-8 transition-all hover:shadow-lg">
              <div className="relative">
                <h3 className="font-semibold text-lg mb-2">
                  Ready to collect more?
                </h3>
                <p className="text-primary-foreground/80 text-sm leading-relaxed mb-4">
                  Join practices that have increased collections by an average of 22%.
                </p>
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-background text-foreground hover:bg-background/90"
                  asChild
                >
                  <Link to="/signup">
                    Start Free Trial
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
