import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/employees", { replace: true });
      } else {
        navigate("/login", { replace: true });
      }
    });
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        {/* Spinner */}
        <div className="relative w-10 h-10">
          <svg
            className="animate-spin w-10 h-10 text-indigo-600"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-20"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className="opacity-90"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        </div>

        {/* Brand mark */}
  

        {/* Status text */}
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700">Signing you in...</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Establishing your session, please wait.
          </p>
        </div>
      </div>
    </div>
  );
}
