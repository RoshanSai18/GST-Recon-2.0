import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    quote: "GraphGST reduced our reconciliation time from 3 days to under 30 minutes. It's a game-changer for our CA firm.",
    name: "Priya Sharma",
    role: "Chartered Accountant",
    company: "Sharma & Associates",
    initials: "PS",
  },
  {
    quote: "The AI matching is incredibly accurate. We've recovered lakhs in missed ITC claims since switching to GraphGST.",
    name: "Rajesh Kumar",
    role: "CFO",
    company: "TechVentures India",
    initials: "RK",
  },
  {
    quote: "Finally, a GST tool that doesn't feel like it's from 2010. Clean UI, fast, and actually works as promised.",
    name: "Ananya Patel",
    role: "Tax Consultant",
    company: "Patel Tax Solutions",
    initials: "AP",
  },
];

const Testimonials = () => {
  return (
    <section id="testimonials" className="section-padding relative overflow-hidden">
      <div className="absolute inset-0 bg-surface-sunken" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          className="text-center max-w-2xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4 font-semibold">Testimonials</p>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground leading-tight">
            Trusted by <span className="text-muted-foreground">2,000+</span>
            <br />businesses
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              className="glass-card-hover p-7 md:p-8 flex flex-col"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.5 }}
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-5">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} size={14} className="fill-foreground text-foreground" />
                ))}
              </div>
              <p className="text-[15px] text-foreground leading-relaxed flex-1 mb-7">"{t.quote}"</p>
              <div className="flex items-center gap-3 pt-5 border-t border-border/60">
                <div className="w-10 h-10 rounded-full bg-foreground flex items-center justify-center flex-shrink-0">
                  <span className="text-[11px] font-bold text-primary-foreground">{t.initials}</span>
                </div>
                <div>
                  <p className="font-display font-semibold text-sm text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}, {t.company}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
