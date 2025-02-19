import { useLocation, Outlet } from 'react-router-dom'
import { MedTimeIcon } from '@/components/icons/MedTimeIcon'

export function AuthLayout() {
  return (
    <div className="flex flex-col overflow-x-hidden overflow-y-auto  relative ">
       

      <div className="flex flex-col min-h-screen w-full md:flex-row md:items-center md:justify-center md:gap-8 md:p-8 lg:gap-16 lg:p-16 max-w-7xl mx-auto">
        {/* Área do Logo */}
        <div className="flex-none pt-8 flex flex-col items-center md:flex-1 md:pt-0 lg:max-w-xl">
          <svg 
            className="w-32 h-32 sm:w-40 sm:h-40 mb-6"
            viewBox="0 0 228 200" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Retângulo principal */}
            <rect 
              x="51" 
              width="127" 
              height="127" 
              rx="51" 
              className="fill-primary"
            />
            
            {/* Retângulo rotacionado */}
            <rect 
              x="96.085" 
              y="16.6948" 
              width="91.0078" 
              height="42.2851" 
              rx="21.1426" 
              transform="rotate(43.2749 96.085 16.6948)" 
              className="fill-background"
            />
            
            {/* Parte branca do relógio */}
            <path 
              fillRule="evenodd" 
              clipRule="evenodd" 
              d="M96.7004 75.3524C110.743 75.9844 123.673 66.5366 126.947 52.3496C127.402 50.3795 127.649 48.41 127.703 46.4639L111.478 31.188C102.977 23.1836 89.5962 23.5866 81.5918 32.0881C73.5874 40.5896 73.9904 53.9703 82.4919 61.9747L96.7004 75.3524Z" 
              className="fill-background"
            />
            
            {/* Círculos do relógio */}
            <circle 
              cx="114.617" 
              cy="62.8707" 
              r="24.8711" 
              className="fill-background"
            />
            <circle 
              cx="114.617" 
              cy="62.8707" 
              r="22.2377" 
              className="fill-primary/60"
            />
            
            {/* Ponteiros do relógio */}
            <rect 
              x="113.877" 
              y="71.275" 
              width="1.47904" 
              height="9.73699" 
              className="fill-background"
            />
            <rect 
              x="113.877" 
              y="45.0221" 
              width="1.47904" 
              height="9.73699" 
              className="fill-background"
            />
            <rect 
              x="106.359" 
              y="61.4147" 
              width="1.47904" 
              height="9.73699" 
              transform="rotate(90 106.359 61.4147)" 
              className="fill-background"
            />
            <rect 
              x="132.612" 
              y="61.4147" 
              width="1.47904" 
              height="9.73699" 
              transform="rotate(90 132.612 61.4147)" 
              className="fill-background"
            />
            
            {/* Texto "MED" */}
            <path 
              d="M4.8015 154.4H11.3775L22.9935 177.2L34.5135 154.4H41.0895V188H35.8575L35.8095 162.32L24.7695 184.496H21.1695L10.0335 162.32V188H4.8015V154.4ZM49.1261 154.4H73.1261V159.248H54.7901V168.704H71.2061V173.504H54.7901V183.152H73.7021V188H49.1261V154.4ZM93.5861 154.4C96.1141 154.4 98.4341 154.816 100.546 155.648C102.658 156.48 104.482 157.648 106.018 159.152C107.586 160.656 108.802 162.432 109.666 164.48C110.53 166.528 110.962 168.768 110.962 171.2C110.962 173.632 110.53 175.872 109.666 177.92C108.802 179.936 107.586 181.712 106.018 183.248C104.45 184.752 102.594 185.92 100.45 186.752C98.3061 187.584 95.9701 188 93.4421 188H79.8101V154.4H93.5861ZM93.7301 183.152C95.3621 183.152 96.8661 182.864 98.2421 182.288C99.6501 181.712 100.866 180.896 101.89 179.84C102.946 178.752 103.762 177.488 104.338 176.048C104.946 174.576 105.25 172.976 105.25 171.248C105.25 169.488 104.946 167.888 104.338 166.448C103.73 164.976 102.898 163.696 101.842 162.608C100.786 161.52 99.5381 160.688 98.0981 160.112C96.6901 159.536 95.1541 159.248 93.4901 159.248H85.4741V183.152H93.7301Z" 
              className="fill-primary/60"
            />
            
            {/* Texto "TIME" */}
            <path 
              d="M111.573 154.4H138.501V159.248H127.845V188H122.181V159.248H111.573V154.4ZM142.537 154.4H148.201V188H142.537V154.4ZM156.206 154.4H162.782L174.398 177.2L185.918 154.4H192.494V188H187.262L187.214 162.32L176.174 184.496H172.574L161.438 162.32V188H156.206V154.4ZM200.531 154.4H224.531V159.248H206.195V168.704H222.611V173.504H206.195V183.152H225.107V188H200.531V154.4Z" 
              className="fill-primary"
            />
          </svg>
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
