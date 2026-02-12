"use client";

import { useAuth } from "../../lib/auth";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import Loader from "@/components/Loader";
import ScheduleCalendar from '@/components/ScheduleCalendar';

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [masterId, setMasterId] = useState<number | undefined>(undefined);
  const { updateUser } = useAuth();

  // Загрузка данных мастера
  useEffect(() => {
    const loadMasterData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setNameInput(user.name || "");
      setEmailInput(user.email || "");

      // Если пользователь - мастер, загружаем его masterId
      if (user.role === "master") {
        try {
          // Приводим user.id к числу
          const userId = Number(user.id);
          if (isNaN(userId)) {
            console.error("Некорректный user ID");
            return;
          }

          const res = await fetch(`http://localhost:3000/api/employees/userId/${userId}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });

          if (res.ok) {
            const masterData = await res.json();
            setMasterId(masterData.id);
          } else if (res.status === 404) {
            console.warn("Мастер не найден для данного пользователя");
          } else {
            console.error("Не удалось загрузить данные мастера");
          }
        } catch (err) {
          console.error("Ошибка при загрузке данных мастера:", err);
        }
      }

      setLoading(false);
    };

    loadMasterData();
  }, [user]);

  // Проверка на пустое имя
  const isNameValid = nameInput.trim().length > 0;
  // Проверка на валидный email
  const isEmailValid = emailInput.trim().length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput);

  if (loading) {
    return <Loader />;
  }

  if (!user && !loading) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center text-gray-600">
        <img 
          src="https://img.icons8.com/?size=1000&id=zDPRrduGt4mR&format=png&color=000000" 
          alt="Требуется авторизация" 
          className="w-96 h-96 mb-4 opacity-60"
        />
        <p className="text-center text-lg">Требуется авторизация</p>
      </div>
    );
  }

  const safeUser = user!;

  const updateMasterName = async (masterId: number, newName: string) => {
    try {
      const res = await fetch(`http://localhost:3000/api/employees/${masterId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ name: newName }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Ошибка при обновлении имени мастера");
      }

      return true;
    } catch (err) {
      console.error("Ошибка при обновлении имени мастера:", err);
      return false;
    }
  };

  const handleUpdate = async (field: "name" | "email", value: string) => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // Основной запрос на обновление пользователя
      const res = await fetch("http://localhost:3000/api/dashboard", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ [field]: value }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Ошибка при обновлении");
      }

      // Обновляем пользователя в контексте
      updateUser({ [field]: value });

      // Если меняем имя и пользователь - мастер, обновляем имя мастера
      if (field === "name" && safeUser.role === "master" && masterId) {
        const masterUpdated = await updateMasterName(masterId, value);
        if (!masterUpdated) {
          console.warn("Не удалось обновить имя мастера, но пользователь обновлен");
        }
      }

      setSuccess(
        `Поле "${field === "name" ? "Имя" : "Email"}" успешно обновлено`
      );
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }

    if (field === "name") setIsNameModalOpen(false);
    if (field === "email") setIsEmailModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 mx-5">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-700 pt-5">
        Личный кабинет
      </h1>

      {loading && <Loader />}

      <div className="bg-white p-6 rounded-lg shadow text-gray-700 w-full">
        {/* Информация о роли */}
        <div className="mb-6 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Роль:</strong>{" "}
            {safeUser.role === "admin" ? "Администратор" : 
             safeUser.role === "master" ? "Мастер" : "Пользователь"}
          </p>
          {safeUser.role === "master" && (
            <p className="text-xs text-gray-500 mt-1">
              При изменении имени оно также обновится в списке мастеров
            </p>
          )}
        </div>

        {/* Поле Имя */}
        <div className="flex items-center justify-between mb-4">
          <p>
            <strong>Имя:</strong> {safeUser.name}
          </p>
          <button
            onClick={() => setIsNameModalOpen(true)}
            className="text-yellow-600 hover:text-yellow-800 text-sm font-medium"
            disabled={loading}
          >
            Изменить
          </button>
        </div>
        

        {/* Поле Email */}
        <div className="flex items-center justify-between mb-6">
          <p>
            <strong>Email:</strong> {safeUser.email}
          </p>
          <button
            onClick={() => setIsEmailModalOpen(true)}
            className="text-yellow-600 hover:text-yellow-800 text-sm font-medium"
            disabled={loading}
          >
            Изменить
          </button>
        </div>
      </div>

      <ScheduleCalendar
        role={user!.role}
        apiUrl="http://localhost:3000/api"
        token={typeof window !== 'undefined' ? localStorage.getItem('token') : null}
        currentMasterId={user!.role === "master" ? masterId : undefined}
      />

      {/* Модальное окно для изменения имени */}
      {isNameModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 text-gray-700">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Изменить имя</h3>
            {safeUser.role === "master" && (
              <p className="text-sm text-gray-600 mb-3 bg-yellow-50 p-2 rounded">
                💡 Имя также изменится в списке мастеров
              </p>
            )}
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4 text-gray-700"
              placeholder="Введите новое имя"
              disabled={loading}
            />
            {!isNameValid && (
              <p className="text-red-500 text-sm mb-2">Имя не может быть пустым</p>
            )}
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            {success && (
              <p className="text-green-500 text-sm mb-4">{success}</p>
            )}
            <div className="flex space-x-3">
              <button
                onClick={() => handleUpdate("name", nameInput)}
                disabled={loading || !isNameValid}
                className="flex-1 bg-yellow-600 text-white py-2 rounded hover:bg-yellow-700 disabled:bg-yellow-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Сохранение..." : "Сохранить"}
              </button>
              <button
                onClick={() => setIsNameModalOpen(false)}
                disabled={loading}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed transition-colors"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно для изменения email */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Изменить email</h3>
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
              placeholder="Введите новый email"
              disabled={loading}
            />
            {!isEmailValid && (
              <p className="text-red-500 text-sm mb-2">Введите корректный email</p>
            )}
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            {success && (
              <p className="text-green-500 text-sm mb-4">{success}</p>
            )}
            <div className="flex space-x-3">
              <button
                onClick={() => handleUpdate("email", emailInput)}
                disabled={loading || !isEmailValid}
                className="flex-1 bg-yellow-600 text-white py-2 rounded hover:bg-yellow-700 disabled:bg-yellow-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Сохранение..." : "Сохранить"}
              </button>
              <button
                onClick={() => setIsEmailModalOpen(false)}
                disabled={loading}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed transition-colors"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}