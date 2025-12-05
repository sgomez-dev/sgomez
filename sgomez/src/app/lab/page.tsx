'use client'

import { useState } from 'react'
import Desktop from './Desktop'
import Taskbar from './Taskbar'
import Window from './Window'
import ToDoApp from './apps/ToDoApp'
import Skyzen from './apps/Skyzen'
import Sortlab from './apps/Sortlab'
import LandingPage from './apps/LandingPage'
import SgomezCLI from './apps/sgomez-cli'
import Docs from './apps/Docs'
import Terminal from './apps/Terminal'
import CVViewer from './apps/CVViewer'

export interface WindowState {
  id: string
  title: string
  component?: React.ComponentType
  url?: string
  isMinimized: boolean
  isMaximized: boolean
  position: { x: number; y: number }
  size: { width: number; height: number }
  zIndex: number
  icon?: string
}

export interface AppConfig {
  id: string
  title: string
  component?: React.ComponentType
  url?: string
  icon: string
  color: string
}

export const apps: AppConfig[] = [
  // Apps integradas (componentes React)
  { id: 'terminal', title: 'Terminal', component: Terminal, icon: '/lab/icons/terminal.svg', color: 'bg-gray-900' },
  { id: 'todo', title: 'To-Do App', url: 'https://todo.sgomez.dev', icon: '/lab/icons/todo-app.png', color: 'bg-green-500' },
  { id: 'budget', title: 'Budget App', url: 'https://budget.sgomez.dev', icon: '/lab/icons/budget.png', color: 'bg-yellow-500' },
  { id: 'skyzen', title: 'Skyzen', url: 'https://skyzen.sgomez.dev', icon: '/lab/icons/skyzen.png', color: 'bg-cyan-500' },
  { id: 'sortlab', title: 'Sortlab',url: 'https://sortlab.sgomez.dev', icon: '/lab/icons/sortlab.png', color: 'bg-purple-500' },
  { id: 'landing', title: 'Landing Page', url: 'https://landing.sgomez.dev', icon: '/lab/icons/landing-page.png', color: 'bg-pink-500' },
  { id: 'cli', title: 'sgomez-cli', url: 'https://www.npmjs.com/package/sgomez-cli', icon: '/lab/icons/sgomez-cli.png', color: 'bg-gray-700' },
  { id: 'docs', title: 'Docs', url: 'https://docs.sgomez.dev', icon: '/lab/icons/docs.png', color: 'bg-orange-500' },
  { id: 'cv', title: 'Mi CV', component: CVViewer, icon: '/lab/icons/cv.svg', color: 'bg-red-600' },
  { id: 'portfolio', title: 'Portafolio', url: '/', icon: '/lab/icons/portfolio.svg', color: 'bg-blue-600' },
  
  // Apps externas (iframes) - Ejemplos comentados:
  // { id: 'github', title: 'GitHub', url: 'https://github.com/sgomez-dev', icon: '/lab/icons/github.png', color: 'bg-gray-800' },
  // { id: 'portfolio', title: 'Portfolio 3D', url: 'https://tu-portfolio-3d.vercel.app', icon: '/lab/icons/portfolio.png', color: 'bg-purple-600' },
]

export default function LabPage() {
  const [windows, setWindows] = useState<WindowState[]>([])
  const [nextZIndex, setNextZIndex] = useState(1000)

  const openWindow = (appId: string) => {
    const app = apps.find(a => a.id === appId)
    if (!app) return

    // Check if window is already open
    const existingWindow = windows.find(w => w.id === appId)
    if (existingWindow) {
      // Bring to front and restore if minimized
      bringToFront(appId)
      if (existingWindow.isMinimized) {
        toggleMinimize(appId)
      }
      return
    }

    // Create new window
    const newWindow: WindowState = {
      id: appId,
      title: app.title,
      component: app.component,
      url: app.url,
      isMinimized: false,
      isMaximized: false,
      position: { 
        x: 100 + windows.length * 30, 
        y: 50 + windows.length * 30 
      },
      size: { width: 800, height: 600 },
      zIndex: nextZIndex,
      icon: app.icon,
    }

    setWindows([...windows, newWindow])
    setNextZIndex(nextZIndex + 1)
  }

  const closeWindow = (id: string) => {
    setWindows(windows.filter(w => w.id !== id))
  }

  const toggleMinimize = (id: string) => {
    setWindows(windows.map(w => 
      w.id === id ? { ...w, isMinimized: !w.isMinimized } : w
    ))
  }

  const toggleMaximize = (id: string) => {
    setWindows(windows.map(w => 
      w.id === id ? { ...w, isMaximized: !w.isMaximized } : w
    ))
  }

  const bringToFront = (id: string) => {
    const maxZ = Math.max(...windows.map(w => w.zIndex), nextZIndex - 1)
    setWindows(windows.map(w => 
      w.id === id ? { ...w, zIndex: maxZ + 1 } : w
    ))
    setNextZIndex(maxZ + 2)
  }

  const updateWindowPosition = (id: string, position: { x: number; y: number }) => {
    setWindows(windows.map(w => 
      w.id === id ? { ...w, position } : w
    ))
  }

  const updateWindowSize = (id: string, size: { width: number; height: number }) => {
    setWindows(windows.map(w => 
      w.id === id ? { ...w, size } : w
    ))
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-linear-to-br from-blue-900 via-purple-900 to-pink-900 relative">
      <Desktop onOpenApp={openWindow} />
      
      {windows.map(window => (
        <Window
          key={window.id}
          window={window}
          onClose={() => closeWindow(window.id)}
          onMinimize={() => toggleMinimize(window.id)}
          onMaximize={() => toggleMaximize(window.id)}
          onFocus={() => bringToFront(window.id)}
          onPositionChange={(pos) => updateWindowPosition(window.id, pos)}
          onSizeChange={(size) => updateWindowSize(window.id, size)}
        />
      ))}

      <Taskbar 
        windows={windows}
        onWindowClick={(id) => {
          const window = windows.find(w => w.id === id)
          if (window?.isMinimized) {
            toggleMinimize(id)
          }
          bringToFront(id)
        }}
      />
    </div>
  )
}
