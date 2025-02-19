import { getGetMedicationsIdQueryKey, getGetMedicationsQueryKey, usePatchMedicationsMedicationIdStock } from "@/api/generated/medications/medications"
import { GetMedications200Item } from "@/api/model"
import { useDialogStore } from "@/stores/use-deialog"
import { useToast } from "@/stores/use-toast"
import { useState } from "react"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { useQueryClient } from "@tanstack/react-query"

export function UpdateStockForm({ medication }: { medication: GetMedications200Item }) {
    const queryClient = useQueryClient()
    const [newQuantity, setNewQuantity] = useState(medication.totalQuantity)
    const { close } = useDialogStore()
    const toast = useToast(state => state.open)
    const { mutate: updateStock } = usePatchMedicationsMedicationIdStock()

    // Função para atualizar o estoque
    const handleUpdateStock = () => {
        if (newQuantity < 0) {
            toast({
                title: 'Erro',
                description: 'A quantidade não pode ser negativa',
                type: 'error'
            })
            return
        }

        updateStock(
            {
                medicationId: medication.id,
                data: { remainingQuantity: newQuantity }
            },
            {
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: getGetMedicationsIdQueryKey(medication.id) })
                    queryClient.invalidateQueries({ queryKey: getGetMedicationsQueryKey() })
                    toast({
                        title: 'Estoque atualizado',
                        description: 'O estoque foi atualizado com sucesso',
                        type: 'success'
                    })
                    close()
                },
                onError: () => {
                    toast({
                        title: 'Erro',
                        description: 'Erro ao atualizar estoque',
                        type: 'error'
                    })
                }
            }
        )
    }

    return (
        <div>
            <div className="mb-4">
                <label htmlFor="newQuantity" className="block text-sm font-medium text-foreground mb-2">
                    Nova Quantidade
                </label>
                <Input
                    type="number"
                    id="newQuantity"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-xs focus:border-indigo-300 focus:ring-3 focus:ring-indigo-200 focus:ring-opacity-50"
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(parseInt(e.target.value))}
                />
            </div>
            <div className="flex justify-end">
                <Button
                    size="sm"
                    className='w-full dark:bg-primary/50  dark:text-primary-foreground'
                    onClick={handleUpdateStock}
                >
                    Atualizar
                </Button>
            </div>
        </div>
    )
}
