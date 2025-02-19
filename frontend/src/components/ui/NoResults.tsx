import { Search } from 'lucide-react'

interface NoResultsProps {
  message?: string
}

export function NoResults({ message = "Nenhum resultado encontrado" }: NoResultsProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="relative w-full max-w-[200px] ">
        {/* Círculo decorativo de fundo */}
        
        {/* Imagem principal */}
        <figure className="mx-auto w-28 h-28">
        <img
          src="/imgs/no_result.png"
          alt="Nenhum resultado encontrado"
          className="w-full h-full object-contain"
        />
        </figure>

        {/* Ícones decorativos flutuantes */}
        <div className="absolute -top-4 -right-2 w-12 h-12 bg-violet-100/80 rounded-2xl rotate-12 flex items-center justify-center backdrop-blur-xs">
          <Search className="w-6 h-6 text-primary" />
        </div>
        
        {/* Círculos decorativos */}
        <div className="absolute -bottom-2 -left-4 w-8 h-8 bg-violet-200/50 rounded-full animate-bounce" />
        <div className="absolute top-1/2 -right-6 w-4 h-4 bg-violet-300/30 rounded-full animate-ping" />
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-violet-950">{message}</h2>
        <p className="text-sm text-violet-400">
          Tente buscar usando palavras diferentes ou verifique a ortografia
        </p>
      </div>

      {/* Linha decorativa */}
      <div className="mt-6 w-24 h-1 rounded-full bg-linear-to-r from-violet-200/50 via-violet-300/50 to-violet-200/50" />
    </div>
  )
}
