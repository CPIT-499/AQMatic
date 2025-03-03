"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Home, BarChart2, Map, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function SideNav() {
  const [activeSection, setActiveSection] = React.useState('dashboard')
  const router = useRouter()

  const handleNavigation = (section: string, path: string) => {
    setActiveSection(section)
    router.push(path)
  }

  return (
    <div className="hidden md:flex w-64 flex-col fixed inset-y-0 border-r bg-card/40 backdrop-blur-sm z-30">
      <div className="flex h-16 items-center justify-center border-b px-6">
        <h2 className="text-xl font-bold text-primary">AQMatic</h2>
      </div>
      <div className="flex flex-col flex-1 py-4 px-3 space-y-1">
        <Button 
          variant={activeSection === 'overview' ? 'secondary' : 'ghost'} 
          className={`justify-start transition-all duration-300 ${activeSection === 'overview' ? 'bg-primary/10 shadow-sm' : 'hover:bg-primary/5'}`}
          onClick={() => handleNavigation('overview', '/')}
        >
          <Home className="mr-2 h-4 w-4" />
          Overview
        </Button>
        <Button 
          variant={activeSection === 'dashboard' ? 'secondary' : 'ghost'} 
          className={`justify-start transition-all duration-300 ${activeSection === 'dashboard' ? 'bg-primary/10 shadow-sm' : 'hover:bg-primary/5'}`}
          onClick={() => handleNavigation('dashboard', '/dashboard')}
        >
          <BarChart2 className="mr-2 h-4 w-4" />
          Dashboard
        </Button>
        <Button 
          variant={activeSection === 'map' ? 'secondary' : 'ghost'} 
          className={`justify-start transition-all duration-300 ${activeSection === 'map' ? 'bg-primary/10 shadow-sm' : 'hover:bg-primary/5'}`}
          onClick={() => handleNavigation('map', '/map')}
        >
          <Map className="mr-2 h-4 w-4" />
          Map View
        </Button>
        <Button 
          variant={activeSection === 'settings' ? 'secondary' : 'ghost'} 
          className={`justify-start transition-all duration-300 ${activeSection === 'settings' ? 'bg-primary/10 shadow-sm' : 'hover:bg-primary/5'}`}
          onClick={() => handleNavigation('settings', '/settings')}
        >
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>
      </div>
      <div className="border-t p-4">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src="/avatar.png" />
            <AvatarFallback>AQ</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">Air Quality Admin</p>
            <p className="text-xs text-muted-foreground">admin@aqmatic.com</p>
          </div>
        </div>
      </div>
    </div>
  )
}