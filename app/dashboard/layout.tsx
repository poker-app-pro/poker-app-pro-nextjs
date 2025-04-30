import type React from "react" 

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) { 
  return (
    <div className="flex h-screen bg-gray-50"> 
        {/* <Header userRole={userRole} userName={userName} /> */}
        <main className="flex-1 overflow-y-auto">{children}</main>
     </div>
  )
}
