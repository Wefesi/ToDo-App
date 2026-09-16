import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { useTodos } from './features/todos/useTodos'

vi.mock('./features/todos/useTodos', () => ({
  useTodos: vi.fn(),
}))

const mockedUseTodos = vi.mocked(useTodos)

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

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows a loading state while ToDos are loading', () => {
    mockedUseTodos.mockReturnValue({
      data: undefined,
      isPending: true,
      isError: false,
    } as unknown as ReturnType<typeof useTodos>)

    renderApp()

    expect(screen.getByRole('status')).toHaveTextContent('Loading ToDos...')
  })

  it('shows an empty state when no ToDos are returned', () => {
    mockedUseTodos.mockReturnValue({
      data: [],
      isPending: false,
      isError: false,
    } as unknown as ReturnType<typeof useTodos>)

    renderApp()

    expect(screen.getByText('No current ToDos.')).toBeInTheDocument()
  })

  it('shows an error state when loading ToDos fails', () => {
    mockedUseTodos.mockReturnValue({
      data: [],
      isPending: false,
      isError: true,
    } as unknown as ReturnType<typeof useTodos>)

    renderApp()

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Could not refresh your ToDos. Showing the last available list.',
    )
  })
})
