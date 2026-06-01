import { Button } from "./ui/button";

const HeroSection = () => {
  return (
    <section className="relative z-10 min-h-screen flex items-center px-6 lg:px-8 py-20">
      <div className="max-w-7xl mx-auto w-full flex justify-center">
        <div className="max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#171717]/80 border border-[#262626] text-xs text-[#d4d4d4] mb-6">
            <span className="font-medium">AI-Powered GST Reconciliation</span>
          </div>

          <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-medium text-[#e5e5e5] leading-[1.05] tracking-tight"
          >
            Reconcile your
            <br />
            GST <span className="text-[#d4d4d4]">in minutes,</span>
            <br />
            not days.
          </h1>

          <p className="mt-6 text-lg text-[#d4d4d4] max-w-xl mx-auto leading-relaxed">
            Automate GSTR-1, GSTR-2B & GSTR-3B matching with intelligent algorithms.
            Spot mismatches instantly, claim every ITC, and stay 100% compliant.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button className="rounded-full px-10 py-4 h-auto text-base bg-[#e5e5e5] text-[#171717] border border-[#e5e5e5] hover:bg-[#d4d4d4]">
              Start Free Trial
            </Button>
            <Button variant="outline" className="rounded-full px-10 py-4 h-auto text-base bg-transparent text-[#d4d4d4] border-[#d4d4d4] hover:bg-[#262626] hover:text-[#e5e5e5]">
              Watch Demo
            </Button>
          </div>

          <div className="mt-8 inline-flex items-center justify-center gap-8 rounded-2xl bg-[#171717]/85 border border-[#262626] px-6 py-4 text-[#e5e5e5]">
            <div>
              <p className="text-2xl font-semibold">50K+</p>
              <p className="text-xs text-[#d4d4d4]">Returns Filed</p>
            </div>
            <div>
              <p className="text-2xl font-semibold">99.2%</p>
              <p className="text-xs text-[#d4d4d4]">Accuracy</p>
            </div>
            <div>
              <p className="text-2xl font-semibold">3min</p>
              <p className="text-xs text-[#d4d4d4]">Avg. Time</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
