'use client';
import { useState, useEffect } from 'react';

type Todo = {
  id: number;
  title: string;
};

export default function Home() {
  const [title, setTitle] = useState('');
  const [todos, setTodos] = useState<Todo[]>([]);
  useEffect(() => {
    // ページが読み込まれた時にToDoを取得
    handleGetTodos();
  }, []);
  const handleGetTodos = async () => {
    // ToDoを取得する関数
    const res = await fetch('http://localhost:8000/todo');
    if (!res.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await res.json();
    setTodos(data);
  };
  const handlePostTodo = async () => {
    try {
      const res = await fetch('http://localhost:8000/todo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await res.json();
      console.log(data);
      setTitle('');
      handleGetTodos();
      return data;
    } catch (error) {
      console.error('Error:', error);
    }
  };
  const handleDeleteTodo = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:8000/todo/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        throw new Error('Network response was not ok');
      }
      // 削除成功後にTodoリストを再取得
      handleGetTodos();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <h1>ToDoアプリ</h1>
      <input
        className="text-black"
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <button onClick={handlePostTodo}>ToDoを作成</button>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            {todo.title}
            <button
              className="ml-4 text-red-500"
              onClick={() => handleDeleteTodo(todo.id)}
            >
              削除
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
