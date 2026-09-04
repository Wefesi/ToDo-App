import { List, Typography } from '@mui/material'
import { useState } from 'react'
import type { ToDo } from '../types/todo'
import { TodoItem } from './TodoItem'

type TodoListProps = {
  todos: ToDo[]
}

export function TodoList({ todos }: TodoListProps) {
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  if (todos.length === 0) {
    return (
      <>
        {successMessage && (
          <Typography className="todo-feedback success" role="status">
            {successMessage}
          </Typography>
        )}
        <Typography className="todo-empty">No current ToDos.</Typography>
      </>
    )
  }

  return (
    <>
      {successMessage && (
        <Typography className="todo-feedback success" role="status">
          {successMessage}
        </Typography>
      )}
      <List className="todo-list">
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onMutationSuccess={setSuccessMessage}
          />
        ))}
      </List>
    </>
  )
}
