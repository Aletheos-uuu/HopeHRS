import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { getURL } from "../lib/auth-helpers";
import GoogleIcon from "../components/icons/GoogleIcon";
import SpinnerIcon from "../components/icons/SpinnerIcon";
import AlertBanner from "../components/ui/AlertBanner";
import { sansSerif, serif } from "../lib/fonts";

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const urlError = searchParams.get("error");
  const [serverError, setServerError] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const { authError } = useAuth();

  useEffect(() => {
    if (urlError) setServerError(decodeURIComponent(urlError));
  }, [urlError]);

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    setServerError("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${getURL()}auth/callback` },
      });
      if (error) throw error;
    } catch (error) {
      setServerError("Google sign-in failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: "#faf9f7", ...sansSerif }}>

      {/* ── Left panel: brand identity ── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[52%] min-h-screen relative overflow-hidden px-16 py-14"
        style={{
          background:
            "radial-gradient(ellipse 100% 80% at 20% 110%, #d6cfc4 0%, #e8e3db 40%, #f0ece5 100%)",
        }}
      >
        {/* Subtle grid texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(#78716c 1px, transparent 1px), linear-gradient(90deg, #78716c 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Decorative circle top-right */}
        <div
          className="pointer-events-none absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #a8998a 0%, transparent 70%)" }}
        />

        {/* Top: wordmark */}
        <div className="relative z-10">
          <p className="text-stone-400 text-xs tracking-[0.25em] uppercase mb-2" style={sansSerif}>
            People Management
          </p>
          <h1
            className="text-stone-800 leading-none"
            style={{ ...serif, fontSize: "3.5rem", fontWeight: 400, letterSpacing: "-0.03em" }}
          >
            HOPE, INC.
          </h1>
        </div>

        {/* Center: tagline */}
        <div className="relative z-10 flex flex-col gap-6">
          <div className="w-12 h-px bg-stone-400" />
          <p
            className="text-stone-600 leading-relaxed max-w-xs"
            style={{ ...serif, fontSize: "1.35rem", fontWeight: 400, letterSpacing: "-0.01em" }}
          >
            "People are the heart of every great organization."
          </p>
          <p className="text-stone-400 text-sm tracking-wide" style={sansSerif}>
            HR Management System
          </p>
        </div>

        {/* Bottom: version */}
        <div className="relative z-10">
          <p className="text-stone-400 text-xs" style={sansSerif}>
            &copy; {new Date().getFullYear()} Hope, Inc. &middot; v1.0
          </p>
        </div>
      </div>

      {/* ── Right panel: sign-in ── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 min-h-screen">

        {/* Mobile-only brand */}
        <div className="lg:hidden text-center mb-10">
          <h1
            className="text-stone-900 text-4xl leading-tight"
            style={{ ...serif, fontWeight: 400, letterSpacing: "-0.03em" }}
          >
            HOPE, INC.
          </h1>
          <p className="text-stone-400 text-xs tracking-widest uppercase mt-1" style={sansSerif}>
            HR Management System
          </p>
        </div>

        <div className="w-full max-w-sm">
          {/* Heading */}
          <div className="mb-8">
            <h2
              className="text-stone-900 text-2xl mb-1"
              style={{ ...serif, fontWeight: 400, letterSpacing: "-0.02em" }}
            >
              Welcome back
            </h2>
            <p className="text-stone-500 text-sm" style={sansSerif}>
              Sign in with your Google account to continue.
            </p>
          </div>

          {/* Error banner */}
          {(serverError || authError) && (
            <div className="mb-5">
              <AlertBanner message={serverError || authError} />
            </div>
          )}

          {/* Google OAuth button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 active:bg-stone-100 text-stone-700 text-sm font-medium transition-all duration-150 shadow-sm hover:shadow disabled:opacity-60 disabled:cursor-not-allowed"
            style={sansSerif}
          >
            {googleLoading ? <SpinnerIcon /> : <GoogleIcon />}
            {googleLoading ? "Redirecting…" : "Continue with Google"}
          </button>

          {/* Footer note */}
          <p className="text-center text-stone-400 text-xs mt-6" style={sansSerif}>
            Access is restricted to authorized personnel only.
          </p>
        </div>
      </div>
    </div>
  );
}