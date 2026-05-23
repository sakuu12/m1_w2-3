import React, { useState } from 'react';

export default function LoginPage({ onLogin, onSwitchToRegister }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await fetch('/sanctum/csrf-cookie', { credentials: 'include' });

            const xsrfToken = decodeURIComponent(
                document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] ?? ''
            );

            const res = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-XSRF-TOKEN': xsrfToken,
                },
                credentials: 'include',
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || 'ログインに失敗しました');
                return;
            }

            onLogin(data.user);
        } catch {
            setError('通信エラーが発生しました');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-sm">
                <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">ログイン</h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            メールアドレス
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            パスワード
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {error && (
                        <p className="text-red-500 text-sm">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium rounded-lg py-2 text-sm transition-colors"
                    >
                        {loading ? 'ログイン中...' : 'ログイン'}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-4">
                    アカウントをお持ちでない方は
                    <button
                        onClick={onSwitchToRegister}
                        className="text-blue-600 hover:underline ml-1"
                    >
                        新規登録
                    </button>
                </p>
            </div>
        </div>
    );
}
