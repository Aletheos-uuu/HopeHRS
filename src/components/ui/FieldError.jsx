function FieldError({ id, message }) {
  return (
    <p id={id} className="mt-1.5 text-red-500 text-xs flex items-center gap-1.5" style={{ fontFamily: "system-ui, sans-serif" }}>
      <svg className="w-3 h-3 shrink-0" viewBox="0 0 12 12" fill="currentColor">
        <path d="M6 1a5 5 0 100 10A5 5 0 006 1zm-.5 2.5h1v3h-1v-3zm0 4h1v1h-1v-1z" />
      </svg>
      {message}
    </p>
  );
}

export default FieldError;