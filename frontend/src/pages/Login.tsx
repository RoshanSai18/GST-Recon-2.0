import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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

  const fillAdmin = () => {
    setEmail(ADMIN_USER);
    setPassword(ADMIN_PASSWORD);
    setError("");
  };

  const fillDemo = () => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    setError("");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Dot grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, hsl(0 0% 0% / 0.06) 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-6 md:px-10 h-16 border-b border-border/50 bg-background/70 backdrop-blur-2xl">
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

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          {/* Brand mark above card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="flex flex-col items-center mb-8"
          >
            <div className="w-14 h-14 rounded-2xl bg-foreground flex items-center justify-center mb-4 shadow-lg shadow-foreground/15">
              <StarLogo className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="font-display font-bold text-2xl text-foreground">GraphGST</h1>
            <p className="text-sm text-muted-foreground mt-1">AI-Powered GST Reconciliation</p>
          </motion.div>

          <Card className="border-border shadow-xl shadow-foreground/[0.06]">
            <CardHeader className="pb-5">
              <CardTitle className="font-display text-xl text-foreground">Sign in</CardTitle>
              <CardDescription className="text-muted-foreground text-sm">
                Enter your credentials to access your workspace
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {/* Error message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2.5 px-3.5 py-3 rounded-lg bg-destructive/8 border border-destructive/20 text-sm text-destructive"
                  >
                    <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}

                {/* Email */}
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
                    className="h-10 text-sm"
                  />
                </div>

                {/* Password */}
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
                      className="h-10 text-sm pr-10"
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
                <Button
                  type="submit"
                  className="w-full h-10 text-sm font-semibold gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                      Signing in…
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <LogIn size={15} />
                      Sign in
                    </span>
                  )}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  Don't have an account?{" "}
                  <a href="#" className="text-foreground font-medium underline underline-offset-2 hover:opacity-70 transition-opacity">
                    Request access
                  </a>
                </p>
              </CardFooter>
            </form>
          </Card>

          {/* Demo credentials card */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-4"
          >
            <div className="rounded-xl border border-border bg-surface-sunken p-4 space-y-4">
              {/* Admin (real backend) */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Admin Login</p>
                  <button
                    type="button"
                    onClick={fillAdmin}
                    className="text-[11px] font-semibold text-foreground border border-border bg-background px-2.5 py-1 rounded-md hover:bg-accent transition-colors"
                  >
                    Autofill
                  </button>
                </div>
                <Separator className="mb-3" />
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Username</span>
                    <code className="text-xs font-mono text-foreground bg-background border border-border px-2 py-0.5 rounded-md">
                      {ADMIN_USER}
                    </code>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Password</span>
                    <code className="text-xs font-mono text-foreground bg-background border border-border px-2 py-0.5 rounded-md">
                      {ADMIN_PASSWORD}
                    </code>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Demo (offline) */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Demo (Offline)</p>
                  <button
                    type="button"
                    onClick={fillDemo}
                    className="text-[11px] font-semibold text-foreground border border-border bg-background px-2.5 py-1 rounded-md hover:bg-accent transition-colors"
                  >
                    Autofill
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Email</span>
                    <code className="text-xs font-mono text-foreground bg-background border border-border px-2 py-0.5 rounded-md">
                      {DEMO_EMAIL}
                    </code>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Password</span>
                    <code className="text-xs font-mono text-foreground bg-background border border-border px-2 py-0.5 rounded-md">
                      {DEMO_PASSWORD}
                    </code>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Footer note */}
      <div className="relative z-10 text-center py-6 border-t border-border/40">
        <p className="text-xs text-muted-foreground">© 2026 GraphGST. All rights reserved.</p>
      </div>
    </div>
  );
};

export default Login;
