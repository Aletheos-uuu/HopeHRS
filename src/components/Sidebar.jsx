import SidebarBrand from "./sidebar/SidebarBrand";
import SidebarNav from "./sidebar/SidebarNav";
import SidebarUser from "./sidebar/SidebarUser";

export default function Sidebar({ user, open = false, onClose = () => {} }) {
  const asideClass =
    (open ? "translate-x-0" : "-translate-x-full") +
    " fixed inset-y-0 left-0 z-40 w-60 transform flex flex-col bg-white border-r border-gray-100 h-screen transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 lg:inset-auto";

  return (
    <div className="relative">
      {/* backdrop for mobile when open */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-30 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={asideClass}>
        <SidebarBrand />
        <SidebarNav onNavigate={onClose} />
        <SidebarUser user={user} />
      </aside>
    </div>
  );
}
