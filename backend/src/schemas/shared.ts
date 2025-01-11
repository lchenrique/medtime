import { z } from 'zod'

// Schema de resposta vazia (204 No Content)
export const noContentResponseSchema = z.object({}).describe('No Content')

// Schema de erro padrão
export const errorResponseSchema = z.object({
  statusCode: z.number().describe('Código do status HTTP'),
  error: z.string().describe('Tipo do erro'),
  message: z.string().describe('Mensagem de erro')
}).describe('Erro padrão da API')

// Schema de paginação
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1).describe('Número da página'),
  limit: z.coerce.number().min(1).max(100).default(10).describe('Quantidade de itens por página')
}).describe('Parâmetros de paginação')

// Schema de metadados de paginação
export const paginationMetaSchema = z.object({
  page: z.number().describe('Número da página atual'),
  limit: z.number().describe('Quantidade de itens por página'),
  totalItems: z.number().describe('Total de itens'),
  totalPages: z.number().describe('Total de páginas'),
  hasNextPage: z.boolean().describe('Indica se há próxima página'),
  hasPreviousPage: z.boolean().describe('Indica se há página anterior')
}).describe('Metadados de paginação')

// Schema de ID
export const idSchema = z.object({
  id: z.string().describe('ID do recurso')
}).describe('Parâmetros de ID')

// Schema de busca
export const searchSchema = z.object({
  search: z.string().optional().describe('Termo de busca')
}).describe('Parâmetros de busca')

// Schema de ordenação
export const sortSchema = z.object({
  sort_by: z.string().min(1).max(50).describe('Campo para ordenação'),
  order: z.enum(['asc', 'desc']).default('asc').describe('Direção da ordenação')
}).describe('Parâmetros de ordenação')
