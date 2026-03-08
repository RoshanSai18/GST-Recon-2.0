import { motion } from "framer-motion";
import { FileCheck, Zap, Shield, BarChart3, Brain, Clock } from "lucide-react";

const features = [
  {
    icon: FileCheck,
    title: "Auto Reconciliation",
    description: "Match GSTR-1, 2B & 3B returns automatically with intelligent algorithms that handle mismatches.",
  },
  {
    icon: Brain,
    title: "AI-Powered Matching",
    description: "Smart fuzzy matching identifies discrepancies even when invoice numbers differ slightly.",
  },
  {
    icon: Zap,
    title: "Real-Time Sync",
    description: "Connect directly to GST portal for live data sync. No more manual CSV uploads.",
  },
  {
    icon: Shield,
    title: "100% Compliant",
    description: "Stay ahead of deadlines with automated compliance checks and filing reminders.",
  },
  {
    icon: BarChart3,
    title: "Visual Analytics",
    description: "Beautiful dashboards that transform complex GST data into actionable insights.",
  },
  {
    icon: Clock,
    title: "Save 90% Time",
    description: "What took days now takes minutes. Focus on growing your business, not paperwork.",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" },
  }),
};

const FeaturesSection = () => {
  return (
    <section id="features" className="section-padding relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 bg-surface-sunken" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          className="text-center max-w-2xl mx-auto mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4 font-semibold">Features</p>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-5 leading-tight">
            Everything you need for
            <br />
            <span className="text-muted-foreground">GST reconciliation</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Powerful tools designed to simplify the most complex GST workflows.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              className="glass-card-hover p-7 md:p-8 group cursor-default"
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={cardVariants}
            >
              <div className="w-11 h-11 rounded-xl bg-foreground flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <feature.icon size={18} className="text-primary-foreground" strokeWidth={2} />
              </div>
              <h3 className="font-display font-bold text-foreground mb-2 text-[15px]">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
