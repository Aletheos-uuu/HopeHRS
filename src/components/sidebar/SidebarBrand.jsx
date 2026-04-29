export default function SidebarBrand() {
  return (
    <div className="px-5 py-5 border-b border-gray-100">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 20 20" fill="white" className="w-4 h-4">
            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
          </svg>
        </div>
        <span className="text-sm font-semibold text-gray-900 tracking-tight">PeopleHR</span>
      </div>
    </div>
  )
}