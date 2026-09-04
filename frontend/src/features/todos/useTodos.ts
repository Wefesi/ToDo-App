import { useQuery } from '@tanstack/react-query'
import { getTodos } from '../../lib/api'

export function useTodos() {
  return useQuery({
    queryKey: ['todos'],
    queryFn: getTodos,
    throwOnError: false,
  })
}
