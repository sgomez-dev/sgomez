'use client'

interface MacBookProps {
  children: React.ReactNode
  className?: string
  title?: string
}

export default function MacBook({ children, className = '', title }: MacBookProps) {
  return (
    <div className={className}>
      <div className="relative rounded-xl bg-[#0d1117] border border-gray-700/30 overflow-hidden shadow-[0_0_100px_-20px_rgba(139,92,246,0.12)]">
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.015] to-transparent pointer-events-none z-10" />
        <div className="flex items-center gap-2 px-4 py-2.5 bg-[#161b22]/90 border-b border-gray-700/20 relative z-20">
          <div className="flex gap-1.5">
            <div className="w-[10px] h-[10px] rounded-full bg-[#ff5f57] shadow-[inset_0_-1px_1px_rgba(0,0,0,0.2)]" />
            <div className="w-[10px] h-[10px] rounded-full bg-[#febc2e] shadow-[inset_0_-1px_1px_rgba(0,0,0,0.2)]" />
            <div className="w-[10px] h-[10px] rounded-full bg-[#28c840] shadow-[inset_0_-1px_1px_rgba(0,0,0,0.2)]" />
          </div>
          <div className="flex-1 text-center">
            <span className="text-[10px] text-gray-500 font-mono tracking-wide">{title || 'santiago.ts — sgomez.dev'}</span>
          </div>
          <div className="w-14" />
        </div>
        <div className="p-4 sm:p-5 min-h-[180px] sm:min-h-[220px] md:min-h-[260px] relative z-20">{children}</div>
      </div>
      <div className="relative h-[3px]">
        <div className="absolute inset-x-0 h-full bg-gradient-to-r from-transparent via-gray-600/30 to-transparent" />
      </div>
      <div className="mx-[-2%] relative">
        <div className="h-[6px] bg-gradient-to-b from-gray-700/20 to-gray-800/10 rounded-b-lg" />
        <div className="mx-auto w-[18%] h-[3px] bg-gray-700/15 rounded-b-sm" />
      </div>
    </div>
  )
}
