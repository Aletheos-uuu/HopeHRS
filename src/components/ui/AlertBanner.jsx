
function AlertBanner({ message }) {
  return (
    <div className="mb-5 flex items-start gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
      <svg className="w-4 h-4 text-red-500 mt-0.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
        />
      </svg>
      <p className="text-red-700 text-sm leading-snug" style={{ fontFamily: "system-ui, sans-serif" }}>
        {message}
      </p>
    </div>
  );
}

export default AlertBanner;