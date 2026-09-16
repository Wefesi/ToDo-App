import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { TodoList } from './TodoList'

function renderTodoList() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <TodoList
        todos={[
          { id: 1, title: 'Learn Kubernetes', isCompleted: false },
          { id: 2, title: 'Write frontend tests', isCompleted: true },
        ]}
      />
    </QueryClientProvider>,
  )
}

describe('TodoList', () => {
  it('renders the returned ToDos', () => {
    renderTodoList()

    expect(screen.getByText('Learn Kubernetes')).toBeInTheDocument()
    expect(screen.getByText('Write frontend tests')).toBeInTheDocument()
    expect(screen.getByText('Open')).toBeInTheDocument()
    expect(screen.getByText('Completed')).toBeInTheDocument()
  })
})
