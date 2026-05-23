import React, { useState } from 'react';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TaskPage from './pages/TaskPage';

export default function App() {
    const [user, setUser] = useState(null);
    const [page, setPage] = useState('login');

    if (!user) {
        if (page === 'register') {
            return (
                <RegisterPage
                    onRegister={setUser}
                    onSwitchToLogin={() => setPage('login')}
                />
            );
        }
        return (
            <LoginPage
                onLogin={setUser}
                onSwitchToRegister={() => setPage('register')}
            />
        );
    }

    return <TaskPage user={user} onLogout={() => setUser(null)} />;
}
