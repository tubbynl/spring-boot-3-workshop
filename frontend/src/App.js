import {
    PrimaryButton,
    Text,
    Stack,
    ActionButton,
    TextField, Checkbox, DefaultButton, MessageBar, MessageBarType
} from '@fluentui/react'
import {useEffect, useRef, useState} from "react";
import './App.css';

export function App() {
    const [todos, setTodos] = useState([])
    useEffect(() => {
        fetch('/api/todos')
            .then(response => response.json())
            .then(data => setTodos(data))
    }, [])
    /**
     * @type {React.MutableRefObject<import('@fluentui/react').ITextField>}
     */
    const addTodoRef = useRef()
    const [succesMessage, setSuccesMessage] = useState('')
    const [errorMessage, setErrorMessage] = useState('')

    useEffect(() => {
        if(succesMessage) {
            const taskId = setTimeout(() => setSuccesMessage(''), 5000)
            return () => clearTimeout(taskId)
        }
    }, [succesMessage])
    useEffect(() => {
        if(errorMessage) {
            const taskId = setTimeout(() => setErrorMessage(''), 5000)
            return () => clearTimeout(taskId)
        }
    })

    async function onChecked(todo, checked) {
        const newTodo = {...todo, done: checked}
        setTodos(todos.map(t => t.id === todo.id ? newTodo : t))
        const response = await fetch(`/api/todos/${todo.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newTodo),
        })
        if(!response.ok) {
            setErrorMessage('Error: ' + (await response.json()).detail)
        }
    }

    async function onAdded() {
        const title = addTodoRef.current.value
        const newTodo = {title, done: false}
        let response = await fetch('/api/todos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newTodo),
        })
        if(!response.ok) {
            setErrorMessage('Error: ' + (await response.json()).detail)
            return
        }
        response = await fetch('/api/todos')
        const data = await response.json()
        if(response.ok) {
            setTodos(data)
        }
    }

    async function addDefaults() {
        let response = await fetch('/api/todos/add-defaults', {
            method: 'POST',
        })
        if(!response.ok) {
            setErrorMessage('Error: ' + (await response.json()).detail)
            return
        }
        response = await fetch('/api/todos')
        const data = await response.json()
        if(response.ok) {
            setSuccesMessage('Added default todos')
            setTodos(data)
        } else {
            setErrorMessage('Error: ' + data.detail)
        }
    }

    function clearCompleted() {
        Promise.all(todos.filter(todo => todo.done).map(todo => {
            return fetch(`/api/todos/${todo.id}`, {
                method: 'DELETE',
            })
        })).then(async () => {
            const response = await fetch('/api/todos')
            const data = await response.json()
            if(response.ok) {
                setSuccesMessage('Cleared completed todos')
                setTodos(data)
            } else {
                setErrorMessage('Error: ' + data.detail)
            }
        }).catch(() => {
            setErrorMessage('Failed to clear completed todos')
        })
    }

    return (
        <Stack verticalFill={true} horizontalAlign='center' verticalAlign='center' tokens={{childrenGap: 'm', padding: 'm'}} style={{height: '100vh'}}>
            <Text variant="mega" style={{ marginBottom: 20 }}>Todo App!</Text>
            <div style={{ position: 'relative', height: 0 }}>
                <div style={{ postion: 'absolute', height: 26, transform: 'translateY(-30px)' }}>
                    <Stack tokens={{ maxWidth: 400 }}>
                        {succesMessage && (
                            <MessageBar messageBarType={MessageBarType.success} isMultiline={false} dismissButtonAriaLabel="Close" onDismiss={() => setSuccesMessage('')}>
                                {succesMessage}
                            </MessageBar>
                        )}
                        {errorMessage && (
                            <MessageBar messageBarType={MessageBarType.error} isMultiline={false} dismissButtonAriaLabel="Close" onDismiss={() => setErrorMessage('')}>
                                {errorMessage}
                            </MessageBar>
                        )}
                    </Stack>
                </div>
            </div>
            <Stack tokens={{ childrenGap: 's2' }}>
                {todos.map(todo => (
                    <Stack horizontal tokens={{ childrenGap: 's2' }} verticalAlign='center' key={todo.id}>
                        <Checkbox defaultChecked={todo.done} onChange={(e, checked) => onChecked(todo, checked)} />
                        <Text style={{ textDecoration: todo.done ? 'line-through' : 'none' }} variant='xLarge'>{todo.title}</Text>
                    </Stack>
                ))}
                <Stack horizontal tokens={{ childrenGap: 's2' }} verticalAlign='center' key={'new-' + todos.length}>
                    <Checkbox disabled />
                    <TextField placeholder='Add todo' underlined className='new-todo-input' componentRef={addTodoRef} />
                    <ActionButton iconProps={{ iconName: 'CheckMark' }} text="Add" style={{ height: '100%' }} onClick={() => onAdded()} />
                </Stack>
            </Stack>
            <Stack horizontal tokens={{ childrenGap: 's2' }} verticalAlign='center'>
                <PrimaryButton text="Add defaults" onClick={() => addDefaults()} />
                <DefaultButton text="Clear completed" onClick={() => clearCompleted()} />
            </Stack>
        </Stack>
    )
}