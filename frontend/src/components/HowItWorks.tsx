import { motion } from "framer-motion";
import { Upload, GitCompare, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: Upload,
    step: "01",
    title: "Upload Returns",
    description: "Import your GSTR-1, GSTR-2B, and purchase data via CSV or direct portal sync.",
  },
  {
    icon: GitCompare,
    step: "02",
    title: "Auto Match",
    description: "Our AI engine cross-references every invoice, flagging mismatches and duplicates instantly.",
  },
  {
    icon: CheckCircle,
    step: "03",
    title: "Resolve & File",
    description: "Review flagged items, resolve discrepancies, and file your returns with confidence.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="section-padding relative">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center max-w-2xl mx-auto mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4 font-semibold">How it works</p>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground leading-tight">
            Three steps to perfect
            <br />
            <span className="text-muted-foreground">reconciliation</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-[52px] left-[calc(16.67%+28px)] right-[calc(16.67%+28px)] h-[2px]">
            <div className="w-full h-full bg-border relative">
              <motion.div
                className="absolute inset-0 bg-foreground origin-left"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 1.2, ease: "easeOut" }}
              />
            </div>
          </div>

          {steps.map((step, i) => (
            <motion.div
              key={step.step}
              className="text-center relative glass-card-hover p-8 md:p-10"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2, duration: 0.5 }}
            >
              <div className="w-16 h-16 rounded-2xl bg-foreground mx-auto mb-6 flex items-center justify-center relative z-10 shadow-lg shadow-foreground/10">
                <step.icon size={24} className="text-primary-foreground" strokeWidth={1.5} />
              </div>
              <span className="text-[11px] text-muted-foreground font-mono font-semibold tracking-wider">{step.step}</span>
              <h3 className="font-display font-bold text-xl text-foreground mt-2 mb-3">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
