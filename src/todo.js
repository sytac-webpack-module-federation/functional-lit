import { html, css } from "lit";
import { define, useState, useEffect, useMemo, useScope, useStyle, lazy } from "./functional-lit";

const Button = (
        { children, initialstate = 0 },
        {
            useState,
            useEffect,
            useMemo,
            useStyle,
            html,
            css,
        }
    ) => {
        const [count, setCount] = useState(parseInt(initialstate));

        useStyle(css`
            button {
                background-color: #4CAF50;
                border: none;
                border-radius: 10px;
                color: white;
                padding: 15px 32px;
                text-align: center;
                text-decoration: none;
                display: inline-block;
                font-size: 16px;
                margin: 4px 2px;
                cursor: pointer;
            }
        `);

        useEffect(() => {
            console.log("Button mounted");
            return () => {
                console.log("Button unmounted");
            };
        }, []);

        useEffect(() => {
            console.log("count effect triggered");
        }, [count]);

        const someCalculation = useMemo(() => {
            const result = count * 2;
            console.log("memo calculation triggered:", result);
            return result;
        }, [count]);

        return html`
        <button @click="${() => setCount(count + 1)}">
            ${children}
            ${count}
            ${someCalculation}
        </button>
    `;
    }

console.log({ Button: Button.toString() });
const NewButton = new Function(`return ${Button.toString()}`)();

// const LazyButton = lazy();

const Todo = () => {
    const [todos, setTodos] = useState([]);
    const [inputValue, setInputValue] = useState('');

    const scope = useScope({
        "some-button": Button,
        "new-button": NewButton
    })

    useEffect(() => {
        console.log("Todo mounted");
        return () => {
            console.log("Todo unmounted");
        };
    }, []);

    useEffect(() => {
        console.log("Todos changed");
    }, [todos]);

    const numberOfTodoItems = useMemo(() => {
        console.log("memo calculation triggered");
        return todos.length;
    }, [todos]);

    const addTodo = () => {
        setTodos([...todos, inputValue]);
        setInputValue('');
    }

    const removeTodo = (index) => {
        setTodos(todos.filter((_, i) => i !== index));
    }

    return html`
        <div>
            <h1>Todo App</h1>
            <input type="text" placeholder="Add todo" .value="${inputValue}" @input="${(e) => setInputValue(e.target.value)}" />
            <button @click="${addTodo}">
                Add
            </button>
            <scope-2-some-button initialState="${2}">some button</scope-2-some-button>
            <scope-2-new-button initialState="${2}">some button</scope-2-new-button>
            <p>
                Number of todo items: ${numberOfTodoItems}
            </p>
            <ul>
                ${todos.map((todo, index) => html`
                    <li key="${index}">
                        ${todo}
                        <button @click="${() => removeTodo(index)}">
                            Remove
                        </button>
                    </li>
                `)}
            </ul>
        </div>
    `;
}

define({ tag: "todo-app", component: Todo });