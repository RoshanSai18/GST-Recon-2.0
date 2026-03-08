import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    description: "For freelancers and small businesses",
    features: ["Up to 100 invoices/month", "Basic reconciliation", "CSV import", "Email support"],
    cta: "Get Started",
    featured: false,
  },
  {
    name: "Professional",
    price: "₹2,499",
    period: "/mo",
    description: "For growing businesses and CA firms",
    features: ["Unlimited invoices", "AI-powered matching", "GST portal sync", "Priority support", "Team collaboration", "Custom reports"],
    cta: "Start Free Trial",
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large organizations",
    features: ["Everything in Pro", "Dedicated account manager", "Custom integrations", "SLA guarantee", "On-premise option"],
    cta: "Contact Sales",
    featured: false,
  },
];

const PricingSection = () => {
  return (
    <section id="pricing" className="section-padding relative">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center max-w-2xl mx-auto mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4 font-semibold">Pricing</p>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-5 leading-tight">
            Simple, transparent
            <br />
            <span className="text-muted-foreground">pricing</span>
          </h2>
          <p className="text-muted-foreground text-lg">No hidden fees. Start free and scale as you grow.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto items-start">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              className={`rounded-2xl p-7 md:p-8 flex flex-col relative ${
                plan.featured
                  ? "bg-foreground text-primary-foreground shadow-2xl shadow-foreground/20 md:-mt-4 md:mb-4"
                  : "bg-background border border-border hover:border-foreground/20 transition-colors duration-300"
              }`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              {plan.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-background text-foreground text-[10px] font-bold px-4 py-1.5 rounded-full border border-border shadow-sm">
                  Most Popular
                </span>
              )}
              <p className={`text-sm font-semibold mb-2 ${plan.featured ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                {plan.name}
              </p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-display font-bold">{plan.price}</span>
                {plan.period && <span className={`text-sm ${plan.featured ? "text-primary-foreground/50" : "text-muted-foreground"}`}>{plan.period}</span>}
              </div>
              <p className={`text-xs mb-7 ${plan.featured ? "text-primary-foreground/50" : "text-muted-foreground"}`}>
                {plan.description}
              </p>
              <ul className="space-y-3.5 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check size={15} className={`mt-0.5 flex-shrink-0 ${plan.featured ? "text-primary-foreground/60" : "text-foreground"}`} strokeWidth={2.5} />
                    <span className={plan.featured ? "text-primary-foreground/80" : "text-foreground"}>{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                variant={plan.featured ? "secondary" : "default"}
                className={`w-full text-sm font-semibold h-11 group ${plan.featured ? "" : ""}`}
              >
                {plan.cta}
                {plan.featured && <ArrowRight size={14} className="ml-1.5 group-hover:translate-x-1 transition-transform" />}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
