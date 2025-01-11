interface MedTimeIconProps {
  className?: string
}

export function MedTimeIcon({ className = "w-20 h-20" }: MedTimeIconProps) {
  return (
    <div className={`${className} bg-white rounded-3xl shadow-md flex items-center justify-center relative`}>
      {/* Pílula */}
      <div className="absolute w-[80%] h-[40%] rotate-45">
        <div className="w-full h-full rounded-full bg-primary border-2 border-primary" />
      </div>

      {/* Relógio */}
      <div className="absolute w-[50%] h-[50%] rounded-full border-2 border-primary bg-white flex items-center justify-center">
        {/* Marcadores de hora */}
        <div className="absolute w-1 h-2 bg-primary" style={{ top: '10%' }} />
        <div className="absolute w-1 h-2 bg-primary" style={{ bottom: '10%' }} />
        <div className="absolute h-1 w-2 bg-primary" style={{ left: '10%' }} />
        <div className="absolute h-1 w-2 bg-primary" style={{ right: '10%' }} />
        
        {/* Ponteiros fixos */}
        <div className="absolute w-[2px] h-3 bg-primary origin-bottom rotate-45" style={{ bottom: '50%' }} />
        <div className="absolute w-[1px] h-4 bg-primary origin-bottom -rotate-45" style={{ bottom: '50%' }} />
        
        {/* Ponto central */}
        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
      </div>
    </div>
  )
} 