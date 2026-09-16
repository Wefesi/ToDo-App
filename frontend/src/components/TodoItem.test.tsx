import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { deleteTodo, updateTodo } from '../lib/api'
import { TodoItem } from './TodoItem'

vi.mock('../lib/api', () => ({
  deleteTodo: vi.fn(),
  updateTodo: vi.fn(),
}))

const mockedDeleteTodo = vi.mocked(deleteTodo)
const mockedUpdateTodo = vi.mocked(updateTodo)

function renderTodoItem(onMutationSuccess = vi.fn()) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return {
    onMutationSuccess,
    ...render(
      <QueryClientProvider client={queryClient}>
        <TodoItem
          todo={{ id: 1, title: 'Learn Kubernetes', isCompleted: false }}
          onMutationSuccess={onMutationSuccess}
        />
      </QueryClientProvider>,
    ),
  }
}

describe('TodoItem', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('edits a ToDo and reports success', async () => {
    const user = userEvent.setup()
    const onMutationSuccess = vi.fn()
    mockedUpdateTodo.mockResolvedValue({
      id: 1,
      title: 'Learn React Query',
      isCompleted: true,
    })
    renderTodoItem(onMutationSuccess)

    await user.click(screen.getByRole('button', { name: 'Edit' }))
    const titleInput = screen.getByRole('textbox', { name: /todo title/i })
    await user.clear(titleInput)
    await user.type(titleInput, 'Learn React Query')
    await user.click(screen.getByRole('checkbox', { name: 'Completed' }))
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(mockedUpdateTodo).toHaveBeenCalledWith(
      1,
      { title: 'Learn React Query', isCompleted: true },
    )
    await vi.waitFor(() => {
      expect(onMutationSuccess).toHaveBeenCalledWith('Changes saved.')
    })
  })

  it('deletes a ToDo and reports success', async () => {
    const user = userEvent.setup()
    const onMutationSuccess = vi.fn()
    mockedDeleteTodo.mockResolvedValue()
    renderTodoItem(onMutationSuccess)

    await user.click(screen.getByRole('button', { name: 'Delete' }))

    expect(mockedDeleteTodo).toHaveBeenCalledWith(1)
    await vi.waitFor(() => {
      expect(onMutationSuccess).toHaveBeenCalledWith('ToDo deleted.')
    })
  })
})
