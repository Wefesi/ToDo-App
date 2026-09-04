export type CreateToDoRequest = {
  title: string
  isCompleted?: boolean
}

export type UpdateToDoRequest = {
  title: string
  isCompleted: boolean
}
