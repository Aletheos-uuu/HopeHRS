import SidebarBrand from './sidebar/SidebarBrand'
import SidebarNav from './sidebar/SidebarNav'
import SidebarUser from './sidebar/SidebarUser'

export default function Sidebar({ user }) {
  return (
    <aside className="w-60 flex-shrink-0 flex flex-col bg-white border-r border-gray-100 h-screen">
      <SidebarBrand />
      <SidebarNav />
      <SidebarUser user={user} />
    </aside>
  )
}