import { useState, type FormEvent } from 'react'
import { Box, Button, Stack, TextField, Typography } from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createTodo } from '../lib/api'

export function TodoForm() {
  const [title, setTitle] = useState('')
  const queryClient = useQueryClient()
  const createTodoMutation = useMutation({
    mutationFn: createTodo,
    onSuccess: () => {
      setTitle('')
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!title.trim()) {
      return
    }

    createTodoMutation.mutate({ title: title.trim() })
  }

  return (
    <Stack
      component="form"
      className="todo-form"
      spacing={1}
      onSubmit={handleSubmit}
    >
      <Box component="label" htmlFor="todo-title" sx={{ fontWeight: 'bold' }}>
        Create a new ToDo
      </Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
        <TextField
          id="todo-title"
          fullWidth
          size="small"
          label="ToDo title"
          slotProps={{ htmlInput: { maxLength: 70 } }}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="What needs doing?"
          disabled={createTodoMutation.isPending}
        />
        <Button
          type="submit"
          variant="contained"
          disabled={createTodoMutation.isPending}
        >
          {createTodoMutation.isPending ? 'Adding...' : 'Add ToDo'}
        </Button>
      </Stack>
      {createTodoMutation.isPending && (
        <Typography role="status">Adding ToDo...</Typography>
      )}
      {createTodoMutation.isError && (
        <Typography className="todo-feedback error" role="alert">
          Could not add the ToDo. Please try again.
        </Typography>
      )}
      {createTodoMutation.isSuccess && (
        <Typography className="todo-feedback success" role="status">
          ToDo added.
        </Typography>
      )}
    </Stack>
  )
}
