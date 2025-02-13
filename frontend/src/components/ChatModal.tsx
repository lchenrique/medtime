import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Send, User, Cpu, Info } from 'lucide-react'
import { createDeepSeekChatCompletion } from '@/services/deepSeekService'
import { useUserStore } from '@/stores/user'

export function ChatModal() {
    const userName = useUserStore(state => state.user?.name)
    console.log(userName)
    const [messages, setMessages] = useState<{ id: number; text: string; sender: 'user' | 'bot' }[]>([])
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const sendMessage = async () => {
      if (!input.trim()) return

      // Envia a mensagem do usuário
      const userMessage = { id: Date.now(), text: input, sender: "user" as 'user' }
      setMessages(prev => [...prev, userMessage])
      const messageContent = input // Salvamos o conteúdo antes de limpar o input
      setInput("")
      setIsLoading(true)

      try {
        // Chamada ao serviço DeepSeek com a mensagem do usuário
        const response = await createDeepSeekChatCompletion([{ role: 'user', content: messageContent }], userName || 'Usuário')
        const botMessage = { id: Date.now(), text: response.content, sender: "bot" as 'bot' }
        setMessages(prev => [...prev, botMessage])
      } catch (error) {
        const errorMessage = { id: Date.now(), text: "Erro ao processar a mensagem. Tente novamente.", sender: "bot" as 'bot' }
        setMessages(prev => [...prev, errorMessage])
      }
      setIsLoading(false)
    }

    return (
      <Card className="bg-card rounded-2xl shadow-lg p-4 flex flex-col h-full">
        <div className="flex-1 overflow-y-auto space-y-2 p-2">
          {!messages.length && (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Info className="mb-2" size={24} />
              <p className='font-bold mb-2'>Você pode pedir para:</p>
              <ul className="list-disc list-inside">
                <li>Adicionar um medicamento</li>
                <li>Remover um medicamento</li>
                <li>Consultar efeitos colaterais</li>
                <li>Configurar lembretes</li>
              </ul>
            </div>
          )}
          {messages.map((msg) => (
            <div key={msg.id} className={`flex items-center gap-2 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
              {msg.sender === "bot" && <Cpu className="text-muted-foreground" />}
              <div
                className={`p-2 rounded-xl max-w-[80%] ${msg.sender === "user" ? "bg-primary text-primary-foreground self-end" : "bg-muted text-muted-foreground"}`}
              >
                {msg.text}
              </div>
              {msg.sender === "user" && <User className="text-primary" />}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center gap-2 justify-start">
              <Cpu className="text-muted-foreground animate-spin" />
              <div className="p-2 rounded-xl max-w-[80%] bg-muted text-muted-foreground">Carregando...</div>
            </div>
          )}
        </div>
        <div className="flex gap-2 mt-2">
          <Input
            type="text"
            className="flex-1 border rounded-xl p-2 focus:outline-none h-12"
            placeholder="Digite uma mensagem..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            disabled={isLoading}
          />
          <Button size="icon" className="bg-primary text-primary-foreground p-2 rounded-xl w-12 h-12" onClick={sendMessage} disabled={isLoading}>
            <Send size={18} />
          </Button>
        </div>
      </Card>
    )
}