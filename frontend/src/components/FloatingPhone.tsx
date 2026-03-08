import { motion } from "framer-motion";

const barData = [
  { height: 40, delay: 0.6 },
  { height: 65, delay: 0.8 },
  { height: 50, delay: 1.0 },
  { height: 82, delay: 1.2 },
  { height: 58, delay: 1.4 },
  { height: 90, delay: 1.6 },
  { height: 45, delay: 1.8 },
];

const FloatingPhone = () => {
  return (
    <div className="relative w-full flex items-center justify-center" style={{ perspective: "1200px" }}>
      {/* Ambient glow behind phone */}
      <div className="absolute w-[300px] h-[500px] rounded-full bg-foreground/[0.04] blur-[80px]" />

      <motion.div
        animate={{
          y: [0, -18, 0],
          rotateY: [-10, -10, -10],
          rotateX: [4, 4, 4],
        }}
        transition={{
          y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
        }}
        className="relative"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Phone body */}
        <div
          className="relative w-[270px] h-[540px] md:w-[290px] md:h-[580px] rounded-[44px] bg-foreground overflow-hidden"
          style={{ boxShadow: "30px 40px 80px -15px hsl(0 0% 0% / 0.3), 0 0 0 1px hsl(0 0% 0% / 0.05)" }}
        >
          {/* Screen */}
          <div className="absolute inset-[4px] rounded-[40px] bg-background overflow-hidden flex flex-col">
            {/* Status bar */}
            <div className="flex items-center justify-between px-7 pt-3 pb-1">
              <span className="text-[10px] text-foreground/60 font-semibold">9:41</span>
              <div className="w-24 h-[26px] bg-foreground rounded-full" />
              <div className="flex gap-0.5 items-center">
                <div className="w-[15px] h-[10px] rounded-sm border-[1.5px] border-foreground/40" />
              </div>
            </div>

            {/* App header */}
            <div className="px-5 pt-4 pb-2">
              <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-[0.15em]">GST Dashboard</p>
              <div className="flex items-baseline gap-1.5 mt-1">
                <p className="text-lg font-display font-bold text-foreground">₹24.5L</p>
                <motion.span
                  className="text-[9px] font-semibold text-foreground/50 bg-foreground/[0.06] px-1.5 py-0.5 rounded"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 2 }}
                >
                  +12.4%
                </motion.span>
              </div>
              <p className="text-[9px] text-muted-foreground mt-0.5">Total Reconciled This Quarter</p>
            </div>

            {/* Bar chart */}
            <div className="px-4 pt-2 flex-1">
              <div className="bg-foreground/[0.03] border border-border/60 rounded-xl p-3 h-full flex flex-col">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-[9px] text-foreground font-semibold">Monthly Overview</p>
                  <div className="flex gap-2">
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-foreground" />
                      <span className="text-[7px] text-muted-foreground">Filed</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-foreground/30" />
                      <span className="text-[7px] text-muted-foreground">Target</span>
                    </div>
                  </div>
                </div>
                <div className="flex-1 flex items-end gap-[5px]">
                  {barData.map((bar, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5 relative">
                      {/* Target ghost bar */}
                      <div className="absolute bottom-5 w-full rounded-sm bg-foreground/[0.06]" style={{ height: `${bar.height + 10}%` }} />
                      {/* Actual bar */}
                      <motion.div
                        className="w-full rounded-sm bg-foreground relative z-10"
                        initial={{ height: 0 }}
                        animate={{ height: `${bar.height}%` }}
                        transition={{ delay: bar.delay, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
                      />
                      <span className="text-[7px] text-muted-foreground font-medium">
                        {["J", "F", "M", "A", "M", "J", "J"][i]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Line chart */}
            <div className="px-4 py-3">
              <div className="bg-foreground/[0.03] border border-border/60 rounded-xl p-3">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-[9px] text-foreground font-semibold">Match Rate</p>
                  <motion.span
                    className="text-[10px] font-bold text-foreground"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.5 }}
                  >
                    98.7%
                  </motion.span>
                </div>
                <svg viewBox="0 0 200 45" className="w-full h-10">
                  {/* Grid lines */}
                  {[10, 20, 30, 40].map((y) => (
                    <line key={y} x1="0" y1={y} x2="200" y2={y} stroke="hsl(0 0% 0%)" strokeOpacity="0.04" strokeWidth="0.5" />
                  ))}
                  {/* Area fill */}
                  <motion.path
                    d="M 0 38 Q 30 33, 50 24 T 100 18 T 150 10 T 200 5 L 200 45 L 0 45 Z"
                    fill="hsl(0 0% 0%)"
                    fillOpacity="0.04"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.8, duration: 1 }}
                  />
                  {/* Line */}
                  <motion.path
                    d="M 0 38 Q 30 33, 50 24 T 100 18 T 150 10 T 200 5"
                    fill="none"
                    stroke="hsl(0 0% 8%)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray="250"
                    initial={{ strokeDashoffset: 250 }}
                    animate={{ strokeDashoffset: 0 }}
                    transition={{ delay: 1.5, duration: 2, ease: "easeOut" }}
                  />
                  {[
                    { cx: 0, cy: 38, delay: 1.7 },
                    { cx: 50, cy: 24, delay: 1.9 },
                    { cx: 100, cy: 18, delay: 2.1 },
                    { cx: 150, cy: 10, delay: 2.3 },
                    { cx: 200, cy: 5, delay: 2.5 },
                  ].map((dot, i) => (
                    <motion.circle
                      key={i}
                      cx={dot.cx}
                      cy={dot.cy}
                      r="3"
                      fill="hsl(0 0% 100%)"
                      stroke="hsl(0 0% 8%)"
                      strokeWidth="1.5"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: dot.delay, duration: 0.4, ease: "backOut" }}
                    />
                  ))}
                </svg>
              </div>
            </div>

            {/* Bottom actions */}
            <div className="px-4 pb-8 flex gap-2">
              <div className="flex-1 bg-foreground rounded-xl py-2 flex items-center justify-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground/60" />
                <span className="text-[9px] text-primary-foreground font-semibold">1,247 Matched</span>
              </div>
              <div className="flex-1 bg-foreground/[0.06] border border-border/60 rounded-xl py-2 flex items-center justify-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-foreground/40" />
                <span className="text-[9px] text-foreground font-medium">23 Pending</span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating badges */}
        <motion.div
          className="absolute -top-8 -right-14 bg-background border border-border rounded-xl px-4 py-2.5 glow-sm"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-foreground animate-pulse" />
            <p className="text-[10px] font-semibold text-foreground whitespace-nowrap">✓ 1,247 Matched</p>
          </div>
        </motion.div>

        <motion.div
          className="absolute -bottom-6 -left-20 bg-background border border-border rounded-xl px-4 py-2.5 glow-sm"
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        >
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-foreground flex items-center justify-center">
              <span className="text-[8px] text-primary-foreground font-bold">AI</span>
            </div>
            <p className="text-[10px] font-semibold text-foreground whitespace-nowrap">98.7% Accuracy</p>
          </div>
        </motion.div>

        <motion.div
          className="absolute top-1/3 -left-24 bg-background border border-border rounded-xl px-3 py-2 glow-sm"
          animate={{ y: [0, -6, 0], x: [0, 3, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        >
          <p className="text-[9px] text-muted-foreground">ITC Claimed</p>
          <p className="text-[11px] font-bold text-foreground">₹8.2L</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default FloatingPhone;
