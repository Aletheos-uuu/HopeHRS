import { useState } from "react";
import { useNavigate } from "react-router-dom";
import  validateForm  from "../lib/validation";
import AlertBanner from "../components/ui/AlertBanner";
import FieldError from "../components/ui/FieldError";
import EyeClosedIcon from "../components/icons/EyeClosedIcon";
import EyeOpenIcon from "../components/icons/EyeOpenIcon";
import SpinnerIcon from "../components/icons/SpinnerIcon";
import GoogleIcon from "../components/icons/GoogleIcon";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "", lastName: "", username: "", email: "", password: "",
  });
  const [errors, setErrors] = useState({});
  const [alertMsg, setAlertMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setAlertMsg("");

    const fieldErrors = validateForm(form.email, form.password);
    if (!form.firstName) fieldErrors.firstName = "First name is required.";
    if (!form.lastName)  fieldErrors.lastName  = "Last name is required.";
    if (!form.username)  fieldErrors.username  = "Username is required.";
    else if (form.username.length < 3)
      fieldErrors.username = "Username must be at least 3 characters.";

    if (Object.keys(fieldErrors).length) {
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          first_name: form.firstName,
          last_name: form.lastName,
          username: form.username,
        },
      },
    });
    setLoading(false);

    if (error) {
      setAlertMsg(error.message);
    } else {
      navigate("/");
    }
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({ provider: "google" });
  }
    

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">

        <div className="text-center mb-7">
          <h1 className="text-xl font-semibold text-gray-900">Create an account</h1>
          <p className="text-sm text-gray-500 mt-1">Fill in your details to get started</p>
        </div>

        {alertMsg && <AlertBanner message={alertMsg} />}

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                First name
              </label>
              <input
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                placeholder="Jane"
                className={`w-full h-9 px-3 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-gray-200 ${
                  errors.firstName ? "border-red-400" : "border-gray-300"
                }`}
              />
              {errors.firstName && (
                <FieldError id="err-firstName" message={errors.firstName} />
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Last name
              </label>
              <input
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                placeholder="Doe"
                className={`w-full h-9 px-3 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-gray-200 ${
                  errors.lastName ? "border-red-400" : "border-gray-300"
                }`}
              />
              {errors.lastName && (
                <FieldError id="err-lastName" message={errors.lastName} />
              )}
            </div>
          </div>

          {[
            { name: "username", label: "Username", type: "text", placeholder: "janedoe" },
            { name: "email",    label: "Email",    type: "email", placeholder: "jane@example.com" },
          ].map(({ name, label, type, placeholder }) => (
            <div key={name} className="mb-4">
              <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
              <input
                name={name}
                type={type}
                value={form[name]}
                onChange={handleChange}
                placeholder={placeholder}
                className={`w-full h-9 px-3 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-gray-200 ${
                  errors[name] ? "border-red-400" : "border-gray-300"
                }`}
              />
              {errors[name] && <FieldError id={`err-${name}`} message={errors[name]} />}
            </div>
          ))}

          <div className="mb-5">
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Password</label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                placeholder="Min. 8 characters"
                className={`w-full h-9 pl-3 pr-9 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-gray-200 ${
                  errors.password ? "border-red-400" : "border-gray-300"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
              </button>
            </div>
            {errors.password && <FieldError id="err-password" message={errors.password} />}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? <SpinnerIcon /> : "Create account"}
          </button>
        </form>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <button
          onClick={handleGoogle}
          className="w-full h-10 border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
        >
          <GoogleIcon />
          Register with Google
        </button>

        <p className="text-center text-sm text-gray-500 mt-5">
          Already have an account?{" "}
          <a href="/login" className="text-gray-900 font-medium hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}