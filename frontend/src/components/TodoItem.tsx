import { useState, type FormEvent } from 'react'
import {
  Button,
  Box,
  Checkbox,
  FormControlLabel,
  ListItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteTodo, updateTodo } from '../lib/api'
import type { ToDo } from '../types/todo'

type TodoItemProps = {
  todo: ToDo
  onMutationSuccess: (message: string) => void
}

export function TodoItem({ todo, onMutationSuccess }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(todo.title)
  const [isCompleted, setIsCompleted] = useState(todo.isCompleted)
  const queryClient = useQueryClient()
  const updateTodoMutation = useMutation({
    mutationFn: (updatedTodo: { title: string; isCompleted: boolean }) =>
      updateTodo(todo.id, updatedTodo),
    onSuccess: () => {
      setIsEditing(false)
      queryClient.invalidateQueries({ queryKey: ['todos'] })
      onMutationSuccess('Changes saved.')
    },
  })
  const deleteTodoMutation = useMutation({
    mutationFn: () => deleteTodo(todo.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
      onMutationSuccess('ToDo deleted.')
    },
  })

  function startEditing() {
    setTitle(todo.title)
    setIsCompleted(todo.isCompleted)
    setIsEditing(true)
  }

  function cancelEditing() {
    setTitle(todo.title)
    setIsCompleted(todo.isCompleted)
    setIsEditing(false)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!title.trim()) {
      return
    }

    updateTodoMutation.mutate({ title: title.trim(), isCompleted })
  }

  if (isEditing) {
    return (
      <ListItem className="todo-row">
        <Stack
          component="form"
          className="todo-edit-form"
          spacing={1}
          onSubmit={handleSubmit}
        >
          <Box component="label" htmlFor={`todo-title-${todo.id}`}>
            Edit ToDo
          </Box>
          <TextField
            id={`todo-title-${todo.id}`}
            size="small"
            label="ToDo title"
            slotProps={{ htmlInput: { maxLength: 70 } }}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            disabled={updateTodoMutation.isPending}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={isCompleted}
                onChange={(event) => setIsCompleted(event.target.checked)}
                disabled={updateTodoMutation.isPending}
              />
            }
            label="Completed"
          />
          <Stack direction="row" spacing={1} className="todo-actions">
            <Button
              type="submit"
              variant="contained"
              disabled={updateTodoMutation.isPending}
            >
              {updateTodoMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
            <Button
              type="button"
              variant="outlined"
              onClick={cancelEditing}
              disabled={updateTodoMutation.isPending}
            >
              Cancel
            </Button>
          </Stack>
          {updateTodoMutation.isPending && (
            <Typography role="status">Saving changes...</Typography>
          )}
          {updateTodoMutation.isError && (
            <Typography className="todo-feedback error" role="alert">
              Could not save changes. Please try again.
            </Typography>
          )}
        </Stack>
      </ListItem>
    )
  }

  return (
    <ListItem className="todo-row">
      <Typography className="todo-title">{todo.title}</Typography>
      <Typography
        className={`todo-status ${todo.isCompleted ? 'is-completed' : 'is-open'}`}
      >
        {todo.isCompleted ? 'Completed' : 'Open'}
      </Typography>
      <Stack direction="row" spacing={1} className="todo-actions">
        <Button
          size="small"
          variant="outlined"
          onClick={startEditing}
          disabled={deleteTodoMutation.isPending || updateTodoMutation.isPending}
        >
          Edit
        </Button>
        <Button
          size="small"
          color="error"
          variant="outlined"
          onClick={() => deleteTodoMutation.mutate()}
          disabled={deleteTodoMutation.isPending || updateTodoMutation.isPending}
        >
          {deleteTodoMutation.isPending ? 'Deleting...' : 'Delete'}
        </Button>
      </Stack>
      {deleteTodoMutation.isPending && (
        <Typography role="status">Deleting ToDo...</Typography>
      )}
      {deleteTodoMutation.isError && (
        <Typography className="todo-feedback error" role="alert">
          Could not delete the ToDo. Please try again.
        </Typography>
      )}
    </ListItem>
  )
}
