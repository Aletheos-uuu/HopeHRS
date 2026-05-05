import Sidebar from './Sidebar'
import { useUserRights } from '../context/UserRightsContext'

export default function AppShell({ children }) {
  const { currentUser } = useUserRights()

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar user={currentUser} />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  )
}