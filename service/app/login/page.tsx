// app/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth';
import { Mail, Lock, Loader2, EyeOff, Eye } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center opacity-80"
      style={{
        backgroundImage:
          'url(https://avatars.mds.yandex.net/i?id=1ec8ed3dbbb3f0568bff78b4b38e4345_l-7552730-images-thumbs&n=13)',
      }}
    >
      {/* Полупрозрачный оверлей */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Форма */}
      <div className="relative z-10 max-w-md w-full space-y-8 bg-white/95 backdrop-blur-sm p-10 rounded-2xl shadow-2xl">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-800">
            Вход в систему
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Введите данные для входа в панель управления сервисом
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Поле Email */}
          <div className="space-y-2">
            <label htmlFor="email" className="flex items-center text-sm font-medium text-gray-700">
              <Mail className="w-4 h-4 mr-2 text-gray-500" />
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-transparent transition text-gray-700"
              placeholder="you@example.com"
            />
          </div>

          {/* Поле Пароль с глазком */}
          <div className="space-y-2">
            <label htmlFor="password" className="flex items-center text-sm font-medium text-gray-700">
              <Lock className="w-4 h-4 mr-2 text-gray-500" />
              Пароль
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'} // ← переключение типа
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-transparent transition text-gray-700 pr-12"
                placeholder="••••••••"
              />
              <button
                type="button"
                aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Кнопка Войти */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-gray-600 bg-yellow-300 hover:bg-gray-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-300 transition transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5 mr-2" />
                  Входим...
                </>
              ) : (
                'Войти'
              )}
            </button>
          </div>
        </form>

        {/* Ссылка на регистрацию */}
        <div className="text-center">
          <p className="text-gray-600 text-sm">
            Нет аккаунта?{' '}
            <a href="/register" className="font-bold text-gray-600 hover:text-gray-600 hover:underline transition">
              Зарегистрироваться
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
