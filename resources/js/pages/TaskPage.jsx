import React, { useEffect, useState } from 'react';

function getXsrfToken() {
    return decodeURIComponent(
        document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] ?? ''
    );
}

async function apiFetch(path, options = {}) {
    return fetch(path, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-XSRF-TOKEN': getXsrfToken(),
            ...options.headers,
        },
        credentials: 'include',
    });
}

export default function TaskPage({ user, onLogout }) {
    const [tasks, setTasks] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        apiFetch('/api/tasks')
            .then((res) => res.json())
            .then(setTasks)
            .catch(() => setError('タスクの取得に失敗しました'));
    }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        setError(null);

        const res = await apiFetch('/api/tasks', {
            method: 'POST',
            body: JSON.stringify({ title, description }),
        });

        if (!res.ok) {
            setError('タスクの追加に失敗しました');
            return;
        }

        const newTask = await res.json();
        setTasks((prev) => [...prev, newTask]);
        setTitle('');
        setDescription('');
    };

    const handleToggle = async (task) => {
        const res = await apiFetch(`/api/tasks/${task.id}`, {
            method: 'PATCH',
            body: JSON.stringify({ is_completed: !task.is_completed }),
        });

        if (!res.ok) return;

        const updated = await res.json();
        setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    };

    const handleDelete = async (id) => {
        const res = await apiFetch(`/api/tasks/${id}`, { method: 'DELETE' });
        if (!res.ok) return;
        setTasks((prev) => prev.filter((t) => t.id !== id));
    };

    const handleLogout = async () => {
        await apiFetch('/api/logout', { method: 'POST' });
        onLogout();
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow-sm">
                <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gray-800">タスク一覧</h1>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600">{user.name} さん</span>
                        <button
                            onClick={handleLogout}
                            className="text-sm text-gray-500 hover:text-gray-800 border border-gray-300 rounded-lg px-3 py-1 transition-colors"
                        >
                            ログアウト
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
                {error && (
                    <p className="text-red-500 text-sm">{error}</p>
                )}

                <form onSubmit={handleAdd} className="bg-white rounded-2xl shadow-sm p-4 flex gap-2">
                    <input
                        type="text"
                        placeholder="タスク名"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="text"
                        placeholder="説明（任意）"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors"
                    >
                        追加
                    </button>
                </form>

                <ul className="space-y-2">
                    {tasks.map((task) => (
                        <li
                            key={task.id}
                            className="bg-white rounded-2xl shadow-sm px-4 py-3 flex items-center gap-3"
                        >
                            <input
                                type="checkbox"
                                checked={task.is_completed}
                                onChange={() => handleToggle(task)}
                                className="w-4 h-4 accent-blue-600 cursor-pointer"
                            />
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium truncate ${task.is_completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                                    {task.title}
                                </p>
                                {task.description && (
                                    <p className="text-xs text-gray-400 truncate">{task.description}</p>
                                )}
                            </div>
                            <button
                                onClick={() => handleDelete(task.id)}
                                className="text-xs text-red-400 hover:text-red-600 transition-colors shrink-0"
                            >
                                削除
                            </button>
                        </li>
                    ))}

                    {tasks.length === 0 && (
                        <p className="text-center text-sm text-gray-400 py-8">タスクがありません</p>
                    )}
                </ul>
            </main>
        </div>
    );
}
