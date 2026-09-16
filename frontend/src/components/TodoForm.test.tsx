import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createTodo } from '../lib/api'
import { TodoForm } from './TodoForm'

vi.mock('../lib/api', () => ({
  createTodo: vi.fn(),
}))

const mockedCreateTodo = vi.mocked(createTodo)

beforeEach(() => {
  vi.clearAllMocks()
})

function renderTodoForm() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <TodoForm />
    </QueryClientProvider>,
  )
}

describe('TodoForm', () => {
  it.each(['', '   '])(
    'does not submit when the title is %j',
    (title) => {
      renderTodoForm()

      fireEvent.change(screen.getByRole('textbox', { name: /todo title/i }), {
        target: { value: title },
      })
      fireEvent.click(screen.getByRole('button', { name: /add todo/i }))

      expect(mockedCreateTodo).not.toHaveBeenCalled()
    },
  )

  it('creates a ToDo and shows a success message', async () => {
    const user = userEvent.setup()
    mockedCreateTodo.mockResolvedValue({
      id: 1,
      title: 'Learn Kubernetes',
      isCompleted: false,
    })
    renderTodoForm()

    await user.type(
      screen.getByRole('textbox', { name: /todo title/i }),
      'Learn Kubernetes',
    )
    await user.click(screen.getByRole('button', { name: /add todo/i }))

    expect(mockedCreateTodo.mock.calls[0]?.[0]).toEqual({
      title: 'Learn Kubernetes',
    })
    expect(await screen.findByText('ToDo added.')).toBeInTheDocument()
  })
})
