'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/auth';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <nav className="bg-blue-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 
          className="text-xl font-bold cursor-pointer"
          onClick={() => router.push('/')}
        >
          АвтоСервис
        </h1>
        <div className="space-x-4">
          {!user ? (
            <>
              <button 
                onClick={() => router.push('/login')}
                className="hover:underline"
              >
                Войти
              </button>
              <button 
                onClick={() => router.push('/register')}
                className="hover:underline"
              >
                Регистрация
              </button>
            </>
          ) : (
            <div className="flex items-center space-x-4">
              <span>Привет, {user.name}!</span>
              <button 
                onClick={() => router.push('/dashboard')}
                className="hover:underline"
              >
                Личный кабинет
              </button>
              <button 
                onClick={logout}
                className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
              >
                Выход
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}