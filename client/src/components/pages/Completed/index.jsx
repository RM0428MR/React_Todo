import { useEffect, useCallback } from 'react' 
import { useRecoilValue, useSetRecoilState } from 'recoil' 
import { axios } from '../../../utils/axiosConfig' 
import { todoState, completedTodoListState } from '../../../stores/todoState' 

import { Layout } from '../../ui/Layout'
import { ListItem } from '../../ui/ListItem' 

import { errorToast } from '../../../utils/errorToast' 

import styles from './index.module.css'

export const Completed = () => {
  const todos = useRecoilValue(completedTodoListState) 
  const setTodos = useSetRecoilState(todoState) 

  const handleToggleButtonClick = useCallback(
    (id) => {
      axios
        .patch(`http://localhost:3000/todo/${id}/completion-status`, {
          isCompleted: todos.find((todo) => todo.id === id).isCompleted,
        })
        .then(({ data }) => {
          setTodos((prev) =>
            prev.map((todo) => (todo.id === data.id ? data : todo))
          )
        })
        .catch((error) => {
          switch (error.statusCode) {
            case 404:
              errorToast(
                '完了・未完了を切り替えるToDoが見つかりませんでした。画面を更新して再度お試しください。'
              )
              break
            default:
              errorToast(error.message)
              break
          }
        })
    },
    [todos, setTodos]
  )

  useEffect(() => {
    axios
      .get('http://localhost:3000/todo')
      .then(({ data }) => {
        setTodos(data)
      })
      .catch((error) => {
        errorToast(error.message)
      })
  }, [setTodos])

  return (
    <Layout>
      {todos.length ? (
        <ul className={styles.list}>
          {todos.map((todo) => (
            <ListItem
              key={todo.id}
              todo={todo}
              onToggleButtonClick={handleToggleButtonClick}
            />
          ))}
        </ul>
      ) : (
        <p className={styles['no-todo']}>完了済みのToDoはありません。</p>
      )}
    </Layout>
  )
}
