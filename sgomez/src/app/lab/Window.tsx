'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { WindowState } from './page'

/* eslint-disable @next/next/no-img-element */

interface WindowProps {
  window: WindowState
  onClose: () => void
  onMinimize: () => void
  onMaximize: () => void
  onFocus: () => void
  onPositionChange: (position: { x: number; y: number }) => void
  onSizeChange: (size: { width: number; height: number }) => void
}

export default function Window({
  window,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  onPositionChange,
  onSizeChange,
}: WindowProps) {
  const windowRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeDirection, setResizeDirection] = useState('')
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 })

  const Component = window.component as React.ComponentType<any>

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && !window.isMaximized) {
        const deltaX = e.clientX - dragStart.x
        const deltaY = e.clientY - dragStart.y
        onPositionChange({
          x: window.position.x + deltaX,
          y: window.position.y + deltaY,
        })
        setDragStart({ x: e.clientX, y: e.clientY })
      }

      if (isResizing && !window.isMaximized) {
        const deltaX = e.clientX - resizeStart.x
        const deltaY = e.clientY - resizeStart.y

        let newWidth = resizeStart.width
        let newHeight = resizeStart.height
        let newX = window.position.x
        let newY = window.position.y

        if (resizeDirection.includes('e')) {
          newWidth = Math.max(400, resizeStart.width + deltaX)
        }
        if (resizeDirection.includes('w')) {
          newWidth = Math.max(400, resizeStart.width - deltaX)
          newX = window.position.x + (resizeStart.width - newWidth)
        }
        if (resizeDirection.includes('s')) {
          newHeight = Math.max(300, resizeStart.height + deltaY)
        }
        if (resizeDirection.includes('n')) {
          newHeight = Math.max(300, resizeStart.height - deltaY)
          newY = window.position.y + (resizeStart.height - newHeight)
        }

        onSizeChange({ width: newWidth, height: newHeight })
        if (newX !== window.position.x || newY !== window.position.y) {
          onPositionChange({ x: newX, y: newY })
        }
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      setIsResizing(false)
      setResizeDirection('')
    }

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, isResizing, dragStart, resizeStart, window, onPositionChange, onSizeChange, resizeDirection])

  const handleDragStart = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.window-controls')) return
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
    onFocus()
  }

  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    e.stopPropagation()
    setIsResizing(true)
    setResizeDirection(direction)
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: window.size.width,
      height: window.size.height,
    })
    onFocus()
  }

  if (window.isMinimized) {
    return null
  }

  const style = window.isMaximized
    ? { top: 0, left: 0, width: '100%', height: 'calc(100% - 48px)' }
    : {
        top: window.position.y,
        left: window.position.x,
        width: window.size.width,
        height: window.size.height,
      }

  return (
    <motion.div
      ref={windowRef}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="absolute flex flex-col bg-white rounded-lg shadow-2xl overflow-hidden"
      style={{ ...style, zIndex: window.zIndex }}
      onMouseDown={onFocus}
    >
      {/* Title bar */}
      <div
        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 flex items-center justify-between cursor-move select-none"
        onMouseDown={handleDragStart}
      >
        <div className="flex items-center gap-2">
          {window.icon?.startsWith('/') ? (
            <img src={window.icon} alt={window.title} className="w-6 h-6 object-contain" />
          ) : (
            <span className="text-xl">{window.icon}</span>
          )}
          <span className="font-medium">{window.title}</span>
        </div>
        <div className="window-controls flex gap-2">
          <button
            onClick={onMinimize}
            className="w-8 h-8 rounded hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <span className="text-xl leading-none">−</span>
          </button>
          <button
            onClick={onMaximize}
            className="w-8 h-8 rounded hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <span className="text-lg leading-none">{window.isMaximized ? '❐' : '□'}</span>
          </button>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded hover:bg-red-500 flex items-center justify-center transition-colors"
          >
            <span className="text-xl leading-none">×</span>
          </button>
        </div>
      </div>

      {/* Window content */}
      <div className="flex-1 overflow-auto bg-gray-50">
        {window.component ? (
          <Component />
        ) : window.url ? (
          <iframe
            src={window.url}
            className="w-full h-full border-0"
            title={window.title}
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            No content available
          </div>
        )}
      </div>

      {/* Resize handles */}
      {!window.isMaximized && (
        <>
          {/* Corners */}
          <div
            className="absolute top-0 left-0 w-3 h-3 cursor-nw-resize"
            onMouseDown={(e) => handleResizeStart(e, 'nw')}
          />
          <div
            className="absolute top-0 right-0 w-3 h-3 cursor-ne-resize"
            onMouseDown={(e) => handleResizeStart(e, 'ne')}
          />
          <div
            className="absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize"
            onMouseDown={(e) => handleResizeStart(e, 'sw')}
          />
          <div
            className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize"
            onMouseDown={(e) => handleResizeStart(e, 'se')}
          />
          
          {/* Edges */}
          <div
            className="absolute top-0 left-3 right-3 h-1 cursor-n-resize"
            onMouseDown={(e) => handleResizeStart(e, 'n')}
          />
          <div
            className="absolute bottom-0 left-3 right-3 h-1 cursor-s-resize"
            onMouseDown={(e) => handleResizeStart(e, 's')}
          />
          <div
            className="absolute left-0 top-3 bottom-3 w-1 cursor-w-resize"
            onMouseDown={(e) => handleResizeStart(e, 'w')}
          />
          <div
            className="absolute right-0 top-3 bottom-3 w-1 cursor-e-resize"
            onMouseDown={(e) => handleResizeStart(e, 'e')}
          />
        </>
      )}
    </motion.div>
  )
}
