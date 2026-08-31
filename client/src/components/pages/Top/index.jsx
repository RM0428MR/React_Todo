import { useState, useEffect, useCallback } from 'react' 
import { useRecoilValue, useSetRecoilState } from 'recoil'
import { axios } from '../../../utils/axiosConfig' 
import { todoState, incompleteTodoListState } from '../../../stores/todoState'
import { Layout } from '../../ui/Layout'
import { ListItem } from '../../ui/ListItem'
import { Button } from '../../ui/Button' 
import { Icon } from '../../ui/Icon' 
import { Form } from '../../ui/Form'
import { errorToast } from '../../../utils/errorToast'
import styles from './index.module.css'

export const Top = () => {
  const todos = useRecoilValue(incompleteTodoListState)
  const setTodos = useSetRecoilState(todoState)
  const [editTodoId, setEditTodoId] = useState('')
  const [isAddTaskFormOpen, setIsAddTaskFormOpen] = useState(false)
  const [inputValues, setInputValues] = useState({
    title: '',
    description: '',
  })

  const handleInputChange = useCallback((event) => {
    const { name, value } = event.target
    setInputValues((prev) => ({ ...prev, [name]: value }))
  }, [])

  // 新規タスク追加フォームを開き編集状態をリセットする。
  const hanleAddTaskButtonClick = useCallback(() => {
    setEditTodoId('')
    setIsAddTaskFormOpen(true)
  }, [])

  // フォームを閉じて入力値と編集対象をリセットする。
  const handleCancelButtonClick = useCallback(() => {
    setInputValues({ title: '', description: '' })
    setEditTodoId('')
    setIsAddTaskFormOpen(false)
  }, [])

  // 新しいTodoを作成してサーバーに保存し一覧に追加する。
  const handleCreateTodoSubmit = useCallback(
    (event) => {
      event.preventDefault()
      axios
        .post('http://localhost:3000/todo', inputValues)
        .then(({ data }) => {
          setTodos((prev) => [...prev, data])
          setIsAddTaskFormOpen(false)
          setInputValues({
            title: '',
            description: '',
          })
        })
        .catch((error) => {
          switch (error.statusCode) {
            case 404:
              errorToast(
                '新規作成先のToDoが見つかりませんでした。画面を更新して再度お試しください。'
              )
              break
            default:
              errorToast(error.message)
              break
          }
        })
    },
    [setTodos, inputValues]
  )

  // 編集中のTodoをサーバーで更新し一覧に反映する。
  const handleEditedTodoSubmit = useCallback(
    (event) => {
      event.preventDefault()
      axios
        .patch(`http://localhost:3000/todo/${editTodoId}`, inputValues)
        .then(({ data }) => {
          setTodos((prev) =>
            prev.map((todo) =>
              todo.id === editTodoId ? { ...todo, ...data } : todo
            )
          )
          setEditTodoId('')
          setInputValues({
            title: '',
            description: '',
          })
        })
        .catch((error) => {
          switch (error.statusCode) {
            case 404:
              errorToast(
                '更新するToDoが見つかりませんでした。画面を更新して再度お試しください。'
              )
              break
            default:
              errorToast(error.message)
              break
          }
        })
    },
    [setTodos, editTodoId, inputValues]
  )

  // 指定したTodoを削除して一覧から取り除く。
  const handleDeleteButtonClick = useCallback((id) => {
    axios
      .delete(`http://localhost:3000/todo/${id}`)
      .then(() => {
        setTodos((prev) => prev.filter((todo) => todo.id !== id))
      })
      .catch((error) => {
        switch (error.statusCode) {
          case 404:
            errorToast(
              '削除するToDoが見つかりませんでした。画面を更新して再度お試しください。'
            )
            break
          default:
            errorToast(error.message)
            break
        }
      })
  }, [setTodos])

  const handleToggleButtonClick = useCallback(
    (id) => {
      axios
        .patch(`http://localhost:3000/todo/${id}/completion-status`, {
          isCompleted: todos.find((todo) => todo.id === id).isCompleted,
        })
        .then(({ data }) => {
          setTodos((prev) => prev.map((todo) => (todo.id === id ? data : todo)))
        })
        .catch((error) => {
          switch (error.statusCode) {
            case 404:
              errorToast(
                '更新するToDoが見つかりませんでした。画面を更新して再度お試しください。'
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
  // 選択したTodoを編集モードにして入力欄に値をセットする。
  const handleEditButtonClick = useCallback(
    (id) => {
      setIsAddTaskFormOpen(false)
      setEditTodoId(id)

      const targetTodo = todos.find((todo) => todo.id === id)
      setInputValues({
        title: targetTodo.title,
        description: targetTodo.description,
      })
    },
    [todos]
  )

  // 初回レンダー時にサーバーからTodo一覧を取得する。
  useEffect(() => {
    axios
      .get('http://localhost:3000/todo')
      .then(({ data }) => {
        setTodos(data)
      })
      .catch((error) => {
        switch (error.statusCode) {
          case 404:
            errorToast('ToDo一覧が見つかりませんでした。画面を更新して再度お試しください。')
            break
          default:
            errorToast(error.message)
        }
      })
  }, [setTodos])

  return (
    <Layout>
      <h1 className={styles.heading}>ToDo一覧</h1>
      <ul className={styles.list}>
        {todos.map((todo) => {
          if (editTodoId === todo.id) {
            return (
              <li key={todo.id}>
                <Form
                  value={inputValues}
                  editTodoId={editTodoId}
                  onChange={handleInputChange}
                  onCancelClick={handleCancelButtonClick}
                  onSubmit={handleEditedTodoSubmit}
                />
              </li>
            )
          }
          return (
            <ListItem
              key={todo.id}
              todo={todo}
              onEditButtonClick={handleEditButtonClick}
              onDeleteButtonClick={handleDeleteButtonClick}
              onToggleButtonClick={handleToggleButtonClick}
            />
          )
        })}
        <li>
          {isAddTaskFormOpen ? (
            <Form
              value={inputValues}
              onCancelClick={handleCancelButtonClick}
              onChange={handleInputChange}
              onSubmit={handleCreateTodoSubmit}
            />
          ) : (
            <Button
              buttonStyle='indigo-blue'
              onClick={hanleAddTaskButtonClick}
              className={styles['add-task']}
            >
              <Icon
                iconName='plus'
                color='orange'
                size='medium'
                className={styles['plus-icon']}
              />
              タスクを追加
            </Button>
          )}
        </li>
      </ul>
    </Layout>
  )
}

