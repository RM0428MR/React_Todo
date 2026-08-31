import { atom, selector } from 'recoil'

export const todoState = atom({
  key: 'todoState',
  default: [],
})

export const completedTodoListState = selector({
  key: 'completedTodoListState',
  get: ({ get }) => {
    const todos = get(todoState)
    return todos.filter((todo) => todo.isCompleted)
  },
})

export const incompleteTodoListState = selector({
  key: 'incompleteTodoListState',
  get: ({ get }) => {
    const todos = get(todoState)
    return todos.filter((todo) => !todo.isCompleted)
  },
})