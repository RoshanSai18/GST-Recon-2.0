import { motion } from "framer-motion";
import FloatingPhone from "./FloatingPhone";
import { Button } from "./ui/button";
import { ArrowRight, Sparkles, Play } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
      {/* Dot grid background */}
      <div className="absolute inset-0 dot-grid" />
      
      {/* Large radial gradient for depth */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-[0.04]"
        style={{ background: "radial-gradient(circle, hsl(0 0% 0%), transparent 70%)" }}
      />

      <div className="max-w-7xl mx-auto w-full px-6 md:px-8 py-12 md:py-0 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left: Text */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-foreground/[0.04] border border-border text-xs text-muted-foreground mb-6 backdrop-blur-sm">
                <Sparkles size={12} className="text-foreground" />
                <span className="font-medium">AI-Powered GST Reconciliation</span>
              </div>
            </motion.div>

            <motion.h1
              className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold text-foreground leading-[1.05] tracking-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
            >
              Reconcile your
              <br />
              GST <span className="text-muted-foreground">in minutes,</span>
              <br />
              not days.
            </motion.h1>

            <motion.p
              className="text-lg text-muted-foreground max-w-lg leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              Automate GSTR-1, GSTR-2B & GSTR-3B matching with intelligent algorithms. 
              Spot mismatches instantly, claim every ITC, and stay 100% compliant.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              <Button size="lg" className="text-sm font-semibold px-7 h-12 group shadow-lg shadow-foreground/10">
                Start Free Trial
                <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="lg" className="text-sm font-medium px-7 h-12 gap-2">
                <Play size={14} className="fill-foreground" />
                Watch Demo
              </Button>
            </motion.div>

            <motion.div
              className="flex items-center gap-8 pt-6 border-t border-border/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.6 }}
            >
              {[
                { value: "50K+", label: "Returns Filed" },
                { value: "99.2%", label: "Accuracy" },
                { value: "3min", label: "Avg. Time" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: Floating Phone */}
          <motion.div
            initial={{ opacity: 0, x: 60, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
            className="relative lg:h-[650px] flex items-center justify-center"
          >
            <FloatingPhone />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
