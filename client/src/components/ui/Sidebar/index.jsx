import { memo } from 'react'
import { NavLink } from 'react-router-dom'
import styles from './index.module.css'

import { Icon } from '../Icon' 

const NaviList = [
  {
    id: 1,
    lineName: 'すべて',
    path: '/',
    iconName: 'todoList',
  },
  {
    id: 2,
    lineName: '完了済み',
    path: '/completed',
    iconName: 'completeList',
  },
]

export const Sidebar = memo(() => {
    return (
    <ul className={styles.sidebar}>
      <li className={['sidebar-list']}>
        <p className={styles.category}>ToDo</p>
        <ul className={styles.list}>
          {NaviList.map((list) => {
            return (
              <li className={styles['list-item']} key={list.id}>
                <NavLink
                  to={list.path}
                  end
                  className={({ isActive }) => {
                    return isActive
                      ? `${styles['navi-item']} ${styles.active}`
                      : [styles['navi-item']]
                  }}
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        iconName={list.iconName}
                        color={isActive ? 'dark-blue' : 'indigo-blue'}
                        size='medium'
                        className={styles.icon}
                      />
                      <span className={styles.text}>{list.lineName}</span>
                    </>
                  )}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </li>
    </ul>
  )
})

Sidebar.displayName = 'Sidebar'
