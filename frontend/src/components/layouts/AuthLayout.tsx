import { useLocation, Outlet } from 'react-router-dom'
import { MedTimeIcon } from '@/components/icons/MedTimeIcon'

export function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col  overflow-hidden relative">
      {/* Elementos decorativos modernos */}
      <div className="absolute inset-0 pointer-events-none ">
        <div className="absolute w-[800px] h-[800px] -top-[400px] -right-[200px] rounded-full bg-primary/5" />
        <div className="absolute w-[600px] h-[600px] -bottom-[200px] -left-[100px] rounded-full bg-primary/5" />
      </div>

      <div className="flex flex-col min-h-screen w-full md:flex-row md:items-center md:justify-center md:gap-8 md:p-8 lg:gap-16 lg:p-16 max-w-7xl mx-auto">
        {/* Área do Logo */}
        <div className="flex-none pt-8 flex flex-col items-center md:flex-1 md:pt-0 lg:max-w-xl">
          <MedTimeIcon className="w-20 h-20 sm:w-24 sm:h-24 mb-6" />

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 md:text-4xl">
            Med<span className="text-primary">Time</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-500 text-center max-w-[280px] mb-6 md:mb-0">
            Seu assistente pessoal para gerenciar medicamentos
          </p>
        </div>

        {/* Área do Conteúdo */}
        <div className="w-full md:flex-1 lg:max-w-xl z-10">
          <Outlet />
        </div>
      </div>
    </div>
  )
} 