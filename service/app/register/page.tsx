// app/register/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth';
import { User, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { getErrorMessage } from '@/lib/utils';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // глазок

  const { register, user } = useAuth();
  const router = useRouter();

  // Если пользователь уже авторизован
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cover bg-center opacity-80" style={{
        backgroundImage: 'url(https://avatars.mds.yandex.net/i?id=1ec8ed3dbbb3f0568bff78b4b38e4345_l-7552730-images-thumbs&n=13)',
      }}>
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative z-10 bg-white/95 backdrop-blur-sm p-10 rounded-2xl shadow-2xl max-w-md text-center">
          <h2 className="text-2xl font-bold text-green-700 mb-4">Вы уже вошли в систему</h2>
          <p className="text-gray-600">Страница регистрации недоступна.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-4 w-full py-2 px-4 bg-yellow-300 text-gray-600 font-medium rounded-lg hover:bg-gray-600 hover:text-white transition"
          >
            Перейти в личный кабинет
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!name || !email || !password) {
      return setError('Все поля обязательны');
    }
    if (password.length < 6) {
      return setError('Пароль должен быть не менее 6 символов');
    }

    try {
      await register(name, email, password);
      setSuccess(true);
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };


  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage: 'url(https://avatars.mds.yandex.net/i?id=1ec8ed3dbbb3f0568bff78b4b38e4345_l-7552730-images-thumbs&n=13)',
      }}
    >
      {/* Оверлей */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Форма */}
      <div className="relative z-10 max-w-md w-full space-y-8 bg-white/95 backdrop-blur-sm p-10 rounded-2xl shadow-2xl">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-800">Регистрация</h2>
          <p className="mt-2 text-sm text-gray-600">Создайте аккаунт для управления сервисным центром</p>
        </div>

        {/* Ошибка */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Успех */}
        {success ? (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-center text-sm">
            ✅ Успешно зарегистрированы! Переходим...
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {/* Имя */}
            <div className="space-y-2">
              <label htmlFor="name" className="flex items-center text-sm font-medium text-gray-700">
                <User className="w-4 h-4 mr-2 text-gray-500" />
                Имя
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-transparent transition text-gray-700"
                placeholder="Иван Петров"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="flex items-center text-sm font-medium text-gray-700">
                <Mail className="w-4 h-4 mr-2 text-gray-500" />
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-transparent transition text-gray-700"
                placeholder="ivan@example.com"
              />
            </div>

            {/* Пароль с глазком */}
            <div className="space-y-2">
              <label htmlFor="password" className="flex items-center text-sm font-medium text-gray-700">
                <Lock className="w-4 h-4 mr-2 text-gray-500" />
                Пароль
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
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
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Кнопка */}
            <button
              type="submit"
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-gray-600 bg-yellow-300 hover:bg-gray-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-300 transition transform hover:scale-[1.02]"
            >
              Зарегистрироваться
            </button>
          </form>
        )}

        {/* Ссылка на вход */}
        <div className="text-center">
          <p className="text-gray-600 text-sm">
            Уже есть аккаунт?{' '}
            <a href="/login" className="font-bold text-gray-600 hover:underline transition">
              Войти
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
