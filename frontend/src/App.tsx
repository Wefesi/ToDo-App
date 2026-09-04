import { Box, Container, Paper, Stack, Typography } from '@mui/material'
import './App.css'
import { TodoForm } from './components/TodoForm'
import { TodoList } from './components/TodoList'
import { useTodos } from './features/todos/useTodos'

function App() {
  const { data: todos = [], isPending, isError } = useTodos()

  return (
    <Container component="main" maxWidth="md" className="todo-app">
      <Paper component="header" className="todo-header" elevation={0}>
        <Stack spacing={1.5}>
          <Typography className="eyebrow">Training project</Typography>
          <Typography component="h1" variant="h1">
            ToDo App
          </Typography>
          <Box className="header-rule" />
        </Stack>
      </Paper>

      <Paper
        component="section"
        className="todo-content"
        aria-labelledby="todo-list-title"
        elevation={0}
      >
        <TodoForm />
        <Typography component="h2" variant="h5" id="todo-list-title">
          Your ToDos
        </Typography>
        {isPending && (
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }} role="status">
            <Box className="loading-indicator" />
            <Typography>Loading ToDos...</Typography>
          </Stack>
        )}
        {isError && (
          <Typography className="todo-feedback error" role="alert">
            Could not refresh your ToDos. Showing the last available list.
          </Typography>
        )}
        {!isPending && <TodoList todos={todos} />}
      </Paper>
    </Container>
  )
}

export default App
