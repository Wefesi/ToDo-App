import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { createTodo, getTodos } from './lib/api'

vi.mock('./lib/api', () => ({
  createTodo: vi.fn(),
  getTodos: vi.fn(),
}))

const mockedCreateTodo = vi.mocked(createTodo)
const mockedGetTodos = vi.mocked(getTodos)

function renderApp() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>,
  )
}

describe('App mutations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('refreshes the displayed ToDos after a successful create', async () => {
    const user = userEvent.setup()
    const refreshedTodo = {
      id: 1,
      title: 'Learn React Query',
      isCompleted: false,
    }
    mockedGetTodos
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([refreshedTodo])
    mockedCreateTodo.mockResolvedValue(refreshedTodo)

    renderApp()

    await screen.findByText('No current ToDos.')
    await user.type(
      screen.getByRole('textbox', { name: /todo title/i }),
      'Learn React Query',
    )
    await user.click(screen.getByRole('button', { name: /add todo/i }))

    expect(await screen.findByText('Learn React Query')).toBeInTheDocument()
    expect(mockedGetTodos).toHaveBeenCalledTimes(2)
  })
})
