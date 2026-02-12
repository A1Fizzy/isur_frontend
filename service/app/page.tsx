// app/page.tsx
'use client';

import { useAuth } from '../lib/auth';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <div className="min-h-screen relative flex flex-col">
      {/* Фоновое изображение */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-80"
        style={{
          backgroundImage:
            'url(https://avatars.mds.yandex.net/i?id=1ec8ed3dbbb3f0568bff78b4b38e4345_l-7552730-images-thumbs&n=13)',
        }}
      >
        {/* Полупрозрачный оверлей для улучшения читаемости текста */}
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      {/* Контент */}
      <main className="relative flex-1 flex items-center justify-center px-4 py-16">
        <div className="text-center text-white max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
            Добро пожаловать в{' '}
            <span className="text-yellow-300 drop-shadow-lg">ИСУР <br /> сервисного центра</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-10 leading-relaxed">
            Умное управление заказами и ресурсами сервисного центра 
            <br />
            для автотранспортного предприятия.
          </p>

          {!user ? (
            <div className="space-y-4 md:space-y-0 md:space-x-6 flex flex-col md:flex-row items-center justify-center">
              <button
                onClick={() => router.push('/login')}
                className="bg-gray-100 hover:bg-yellow-300 text-gray-600 text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-medium"
              >
                Войти
              </button>
              <button
                onClick={() => router.push('/register')}
                className="bg-yellow-300 hover:bg-gray-100 text-gray-600 text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-medium"
              >
                Зарегистрироваться
              </button>
            </div>
          ) : (
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-yellow-300 hover:bg-gray-100 text-gray-600 text-lg px-10 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-medium"
            >
              Перейти в личный кабинет
            </button>
          )}
        </div>
      </main>

      {/* Футер (опционально) */}
      <footer className="relative text-center text-white/70 text-sm pb-6">
        &copy; {new Date().getFullYear()} ИСУР сервисного центра АП. Все права защищены.
      </footer>
    </div>
  );
}
