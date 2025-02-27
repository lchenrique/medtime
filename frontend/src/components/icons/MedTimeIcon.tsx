interface MedTimeIconProps {
  className?: string
}

export function MedTimeIcon({ className = "w-9 h-9" }: MedTimeIconProps) {
  return (
    <svg 
      className={className}
      viewBox="0 0 127 127" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="127" height="127" rx="51" fill="#7C3BED"/>
      <rect x="45.085" y="16.6948" width="91.0078" height="42.2851" rx="21.1426" transform="rotate(43.2749 45.085 16.6948)" fill="#441D87"/>
      <path fill-rule="evenodd" clip-rule="evenodd" d="M45.7004 75.3524C59.7429 75.9844 72.6734 66.5366 75.9472 52.3496C76.4018 50.3795 76.6489 48.41 76.703 46.4639L60.4783 31.188C51.9768 23.1836 38.5962 23.5866 30.5918 32.0881C22.5874 40.5896 22.9904 53.9703 31.4919 61.9747L45.7004 75.3524Z" fill="white"/>
      <circle cx="63.6166" cy="62.8707" r="24.8711" fill="white"/>
      <circle cx="63.6166" cy="62.8707" r="22.2377" fill="#441D87"/>
      <rect x="62.8771" y="71.275" width="1.47904" height="9.73699" fill="white"/>
      <rect x="62.8771" y="45.0221" width="1.47904" height="9.73699" fill="white"/>
      <rect x="55.3587" y="61.4147" width="1.47904" height="9.73699" transform="rotate(90 55.3587 61.4147)" fill="white"/>
      <rect x="81.6115" y="61.4147" width="1.47904" height="9.73699" transform="rotate(90 81.6115 61.4147)" fill="white"/>
    </svg>
  )
}
