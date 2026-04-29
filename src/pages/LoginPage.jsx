import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import GoogleIcon from "../components/icons/GoogleIcon";
import EyeOpenIcon from "../components/icons/EyeOpenIcon";
import EyeClosedIcon from "../components/icons/EyeClosedIcon";
import SpinnerIcon from "../components/icons/SpinnerIcon";
import AlertBanner from "../components/ui/AlertBanner";
import FieldError from "../components/ui/FieldError";
import validateForm from "../lib/validation";
import { sansSerif, serif } from "../lib/fonts";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });
  const { authError } = useAuth();

  function handleBlur(field) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validateForm(email, password));
  }

  function handleEmailChange(value) {
    setEmail(value);
    if (touched.email) {
      setErrors(validateForm(value, password));
    }
  }

  function handlePasswordChange(value) {
    setPassword(value);
    if (touched.password) {
      setErrors(validateForm(email, value));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setTouched({ email: true, password: true });
    const errs = validateForm(email, password);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    setServerError("");
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      // useNavigate will handle the redirect via AuthContext changes
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Invalid login credentials.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    setServerError("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (error) throw error;
    } catch (error) {
      console.error("Google login error:", error);
      setServerError("Google sign-in failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  }

  const baseInput = [
    "w-full bg-stone-50 border text-stone-900 text-sm",
    "px-4 py-3 rounded-xl outline-none transition-all duration-200",
    "placeholder:text-stone-400",
    "focus:bg-white focus:shadow-[0_0_0_3px_rgba(120,113,108,0.15)]",
  ].join(" ");

  const validInput = "border-stone-200 focus:border-stone-400";
  const errorInput = "border-red-300 bg-red-50 focus:border-red-400 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]";

  const emailHasError = touched.email && Boolean(errors.email);
  const passwordHasError = touched.password && Boolean(errors.password);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{
        background: "radial-gradient(ellipse 80% 60% at 50% 0%, #e7e3dc 0%, #f5f3ef 45%, #fafaf8 100%)",
        ...serif,
      }}
    >
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.035]"
        style={{
          backgroundImage: "linear-gradient(#78716c 1px, transparent 1px), linear-gradient(90deg, #78716c 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="w-full max-w-md relative">

        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-6">
        
          </div>
          <h1 className="text-stone-900 text-5xl leading-tight mb-2" style={{ ...serif, fontWeight: 400, letterSpacing: "-0.03em" }}>
            HOPE, INC.
          </h1>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-stone-200/80 shadow-[0_8px_40px_rgba(0,0,0,0.08)] px-8 py-8">

          {(serverError || authError) && <AlertBanner message={serverError || authError} />}

          

  
          <form onSubmit={handleSubmit}>

            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-stone-600 text-xs font-medium mb-1.5 tracking-wide uppercase"
                style={sansSerif}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                onBlur={() => handleBlur("email")}
                aria-invalid={emailHasError}
                aria-describedby={emailHasError ? "email-error" : undefined}
                className={[baseInput, emailHasError ? errorInput : validInput].join(" ")}
                style={sansSerif}
              />
              {emailHasError && <FieldError id="email-error" message={errors.email} />}
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-stone-600 text-xs font-medium tracking-wide uppercase"
                  style={sansSerif}
                >
                  Password
                </label>
                {/* FIX: restored proper <a> tag syntax */}
                
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  onBlur={() => handleBlur("password")}
                  aria-invalid={passwordHasError}
                  aria-describedby={passwordHasError ? "password-error" : undefined}
                  className={[baseInput, "pr-11", passwordHasError ? errorInput : validInput].join(" ")}
                  style={sansSerif}
                />
                <a
                  href="/forgot-password"
                  className="text-stone-400 hover:text-stone-700 text-xs transition-colors duration-150"
                  style={sansSerif}
                >
                  Forgot password?
                </a>
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-5 top-6 -translate-y-3 text-stone-400 hover:text-stone-600 transition-colors p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOpenIcon /> : <EyeClosedIcon />}
                </button>
              </div>
              {passwordHasError && <FieldError id="password-error" message={errors.password} />}
            </div>
            <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 active:bg-stone-100 text-stone-700 text-sm font-medium transition-all duration-150 shadow-sm hover:shadow disabled:opacity-60 disabled:cursor-not-allowed mb-6"
            style={sansSerif}
          >
            {googleLoading ? <SpinnerIcon /> : <GoogleIcon />}
            {googleLoading ? "Redirecting..." : "Sign in with Google"}
          </button>

            {/* FIX: submit button moved back inside <form> */}
            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 active:bg-stone-950 text-white text-sm font-medium transition-all duration-150 shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
              style={sansSerif}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <SpinnerIcon />
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </button>

          </form>
          
        </div>

        <p className="text-center text-stone-500 text-sm mt-6" style={sansSerif}>
          Don't have an account?{" "}
          <a href="/register" className="text-stone-800 hover:text-stone-600 underline underline-offset-2 transition-colors">
            Register now
          </a>
        </p>
        

      </div>
      
    </div>
  );
}