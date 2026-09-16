import type { CreateToDoRequest, UpdateToDoRequest } from '../types/todoRequests'
import type { ToDo } from '../types/todo'

const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ??
  (import.meta.env.PROD ? '' : 'http://localhost:5056')

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`)
  }

  return response.json() as Promise<T>
}

export function getTodos(): Promise<ToDo[]> {
  return request<ToDo[]>('/api/todos')
}

export function createTodo(todo: CreateToDoRequest): Promise<ToDo> {
  return request<ToDo>('/api/todos', {
    method: 'POST',
    body: JSON.stringify(todo),
  })
}

export function updateTodo(
  id: number,
  todo: UpdateToDoRequest,
): Promise<ToDo> {
  return request<ToDo>(`/api/todos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(todo),
  })
}

export async function deleteTodo(id: number): Promise<void> {
  const response = await fetch(`${apiBaseUrl}/api/todos/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`)
  }
}
