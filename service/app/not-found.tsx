'use client';

import { useRouter } from 'next/navigation';
import { AlertTriangle, ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage: 'url(https://avatars.mds.yandex.net/i?id=1ec8ed3dbbb3f0568bff78b4b38e4345_l-7552730-images-thumbs&n=13)',
      }}
    >
      {/* Затемняющий оверлей */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Карточка 404 */}
      <div className="relative z-10 max-w-md w-full bg-white/95 backdrop-blur-sm p-10 rounded-2xl shadow-2xl text-center space-y-6">
        {/* Крупная цифра */}
        <div className="text-9xl font-extrabold text-yellow-400 bg-clip-text drop-shadow-sm select-none">
          404
        </div>

        <h1 className="text-2xl font-bold text-gray-800">Страница не найдена</h1>
        <p className="text-gray-600 leading-relaxed">
          Возможно, она была удалена, перемещена или вы ошиблись в адресе.
        </p>

        {/* Кнопки навигации */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Назад
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-yellow-300 text-gray-700 font-medium rounded-lg hover:bg-yellow-400 transition"
          >
            <Home className="w-4 h-4" /> В личный кабинет
          </button>
        </div>
      </div>
    </div>
  );
}