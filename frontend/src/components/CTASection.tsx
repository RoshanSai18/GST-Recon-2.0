import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";
import StarLogo from "./StarLogo";

const CTASection = () => {
  return (
    <section className="section-padding relative">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="relative rounded-3xl overflow-hidden bg-foreground p-12 md:p-20 text-center"
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          style={{ boxShadow: "0 30px 80px -20px hsl(0 0% 0% / 0.3)" }}
        >
          {/* Decorative dots */}
          <div className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, hsl(0 0% 100%) 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <StarLogo className="w-10 h-10 text-primary-foreground/20 mx-auto" />
          </motion.div>

          <h2 className="text-3xl md:text-5xl font-display font-bold text-primary-foreground mb-5 relative z-10 leading-tight">
            Ready to simplify
            <br />your GST?
          </h2>
          <p className="text-primary-foreground/60 mb-10 max-w-md mx-auto relative z-10 text-lg">
            Join thousands of businesses who have already automated their GST reconciliation.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center relative z-10">
            <Button variant="secondary" size="lg" className="text-sm font-semibold px-8 h-12 group shadow-lg">
              Get Started Free
              <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-sm font-medium px-8 h-12 bg-transparent border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              Schedule Demo
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
