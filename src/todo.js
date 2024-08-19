import { html } from "lit";
import { define, useState, useEffect, useMemo } from "./functional-lit";

const Todo = () => {
    const [todos, setTodos] = useState([]);
    const [inputValue, setInputValue] = useState('');

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