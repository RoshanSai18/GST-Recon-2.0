import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import StarLogo from "@/components/StarLogo";
import { Eye, EyeOff, ArrowLeft, LogIn, AlertCircle } from "lucide-react";
import { api, ApiError, tokenStore } from "@/lib/api";

const ADMIN_USER     = "admin";
const ADMIN_PASSWORD = "admin@gst123";
// Offline demo credentials (no backend required)
const DEMO_EMAIL     = "demo@graphgst.com";
const DEMO_PASSWORD  = "demo1234";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Attempt real backend login (treats email field as username)
      const resp = await api.auth.login(email, password);
      tokenStore.set(resp.access_token);
      navigate("/dashboard");
      return;
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        // Backend responded — credentials rejected
        // Check if demo credentials match for offline/preview mode
        if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
          navigate("/dashboard");
          return;
        }
        setError("Invalid credentials. Check your username and password.");
      } else {
        // Backend unavailable — fall back to offline demo
        if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
          navigate("/dashboard");
          return;
        }
        if (email === ADMIN_USER && password === ADMIN_PASSWORD) {
          // Admin credentials entered but backend is down
          setError("Backend is unreachable. Start the FastAPI server and try again.");
        } else {
          setError("Invalid credentials. Use the demo credentials or start the backend.");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    setError("");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,hsl(0_0%_16%),hsl(0_0%_9%)_55%)]" />
        <div
          className="absolute inset-0 opacity-35"
          style={{
            backgroundImage:
              "linear-gradient(to right, hsl(0 0% 15% / 0.35) 1px, transparent 1px), linear-gradient(to bottom, hsl(0 0% 15% / 0.35) 1px, transparent 1px)",
            backgroundSize: "46px 46px",
          }}
        />
      </div>

      <div className="relative z-10 flex items-center justify-between px-6 md:px-10 h-16 border-b border-border/70 bg-background/70 backdrop-blur-2xl">
        <a href="/" className="flex items-center gap-2.5 group">
          <StarLogo className="w-6 h-6 text-foreground group-hover:scale-110 transition-transform duration-200" />
          <span className="font-display font-bold text-foreground">GraphGST</span>
        </a>
        <a
          href="/"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} />
          Back to home
        </a>
      </div>

      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-10 md:px-8 md:py-14">
        <div className="max-w-6xl mx-auto grid gap-7 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="rounded-3xl border border-border/80 bg-card/55 backdrop-blur-xl p-7 md:p-9"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1 text-xs text-muted-foreground">
              Workspace Access
            </div>
            <h1 className="mt-5 font-display text-4xl md:text-5xl leading-[1.08] tracking-tight text-foreground">
              Secure sign in for your GST operations hub.
            </h1>
            <p className="mt-4 text-sm md:text-base text-muted-foreground max-w-xl leading-relaxed">
              Access reconciliation dashboards, risk graphs, invoice intelligence, and vendor anomaly workflows from a single control plane.
            </p>

            <div className="mt-8 grid sm:grid-cols-3 gap-3">
              <div className="rounded-2xl border border-border bg-background/70 p-4">
                <p className="text-xl font-semibold text-foreground">50K+</p>
                <p className="text-xs text-muted-foreground mt-1">Returns processed</p>
              </div>
              <div className="rounded-2xl border border-border bg-background/70 p-4">
                <p className="text-xl font-semibold text-foreground">99.2%</p>
                <p className="text-xs text-muted-foreground mt-1">Matching accuracy</p>
              </div>
              <div className="rounded-2xl border border-border bg-background/70 p-4">
                <p className="text-xl font-semibold text-foreground">3 min</p>
                <p className="text-xs text-muted-foreground mt-1">Average cycle</p>
              </div>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full"
          >
            <Card className="border-border/80 bg-card/90 backdrop-blur-2xl shadow-2xl shadow-black/25">
              <CardHeader className="pb-5">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-10 h-10 rounded-xl bg-foreground flex items-center justify-center">
                    <StarLogo className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle className="font-display text-xl text-foreground">Sign in</CardTitle>
                    <CardDescription className="text-muted-foreground text-sm">
                      Enter your credentials to access your workspace
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-2.5 px-3.5 py-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-destructive"
                    >
                      <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
                      <span>{error}</span>
                    </motion.div>
                  )}

                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-sm font-medium text-foreground">
                      Email address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      className="h-11 text-sm bg-background"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-sm font-medium text-foreground">
                        Password
                      </Label>
                      <a
                        href="#"
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                      >
                        Forgot password?
                      </a>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                        className="h-11 text-sm pr-10 bg-background"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-3 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={fillDemo}
                      className="w-full h-11 text-sm font-semibold"
                    >
                      Autofill
                    </Button>

                    <Button
                      type="submit"
                      className="w-full h-11 text-sm font-semibold gap-2"
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                          Signing in...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <LogIn size={15} />
                          Sign in
                        </span>
                      )}
                    </Button>
                  </div>

                  <p className="text-center text-xs text-muted-foreground">
                    Don't have an account?{" "}
                    <a href="#" className="text-foreground font-medium underline underline-offset-2 hover:opacity-70 transition-opacity">
                      Request access
                    </a>
                  </p>
                </CardFooter>
              </form>
            </Card>
          </motion.section>
        </div>
      </div>

      <div className="relative z-10 text-center py-6 border-t border-border/50 bg-background/45 backdrop-blur-md">
        <p className="text-xs text-muted-foreground">© 2026 GraphGST. All rights reserved.</p>
      </div>
    </div>
  );
};

export default Login;
