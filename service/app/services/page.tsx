"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import Loader from "@/components/Loader";
import { Book } from "lucide-react";

interface Service {
  id: number;
  name: string;
  duration: number;
  specialization: string;
  createdAt: string;
  updatedAt: string;
}

export default function ServicesPage() {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Состояние для формы
  const [newService, setNewService] = useState<{
    name: string;
    duration: number | "";
    specialization: string;
  }>({
    name: "",
    duration: "",
    specialization: "",
  });

  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Загрузка данных
  const [isLoading, setIsLoading] = useState(true);

  // API URL из окружения
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

  // Загрузка услуг
  const fetchServices = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${apiUrl}/services`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) throw new Error("Не удалось загрузить услуги");

      const data = await response.json();
      setServices(data);
      setFilteredServices(data);
    } catch (err) {
      setError("Ошибка загрузки данных");
      console.error("Ошибка загрузки услуг:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Фильтрация услуг
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredServices(services);
      return;
    }

    const query = searchQuery.toLowerCase();
    const result = services.filter(
      (service) =>
        service.name.toLowerCase().includes(query) ||
        service.duration.toString().includes(query),
    );

    setFilteredServices(result);
  }, [searchQuery, services]);

  // Загрузка при монтировании
  useEffect(() => {
    if (user) {
      fetchServices();
    }
  }, [user]);

  // Обработка изменения формы
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement |  HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (editingService) {
      setEditingService((prev) =>
        prev
          ? {
              ...prev,
              [name]:
                name === "duration" ? (value ? Number(value) : "") : value,
            }
          : null,
      );
    } else {
      setNewService((prev) => ({
        ...prev,
        [name]: name === "duration" ? (value ? Number(value) : "") : value,
      }));
    }
  };

  // Обработка отправки формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError("Пользователь не авторизован");
      return;
    }

    // Валидация данных
    if (!newService.name.trim()) {
      setError("Название услуги обязательно");
      return;
    }

    if (!newService.specialization.trim()) {
      setError("Специализация услуги обязательна");
      return;
    }

    if (
      newService.duration === "" ||
      newService.duration < 15 ||
      newService.duration > 480
    ) {
      setError("Длительность должна быть от 15 до 480 минут");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // Отправка запроса
      const response = await fetch(`${apiUrl}/services`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          name: newService.name,
          duration: newService.duration,
          specialization: newService.specialization,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Не удалось создать услугу");
      }

      const createdService = await response.json();

      // Обновление списка услуг
      setServices((prev) => [createdService, ...prev]);
      setFilteredServices((prev) => [createdService, ...prev]);

      // Сброс формы
      setNewService({
        name: "",
        duration: "",
        specialization: "",
      });

      setSuccess("Услуга успешно добавлена!");

      // Через 3 секунды убрать сообщение об успехе
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Обработка редактирования
  const handleEdit = (service: Service) => {
    setEditingService(service);
    setError(null);
  };

  // Обработка отмены редактирования
  const handleCancelEdit = () => {
    setEditingService(null);
    setError(null);
  };

  // Обработка сохранения изменений
  const handleSave = async () => {
    if (!editingService) return;

    if (!user) {
      setError("Пользователь не авторизован");
      return;
    }

    // Валидация данных
    if (!editingService.name.trim()) {
      setError("Название услуги обязательно");
      return;
    }

    if (!editingService.specialization.trim()) {
      setError("Специализация услуги обязательна");
      return;
    }

    if (editingService.duration < 15 || editingService.duration > 480) {
      setError("Длительность должна быть от 15 до 480 минут");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${apiUrl}/services/${editingService.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          name: editingService.name,
          duration: editingService.duration,
          specialization: editingService.specialization
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Не удалось обновить услугу");
      }

      const updatedService = await response.json();

      // Обновление списка услуг
      setServices((prev) =>
        prev.map((s) => (s.id === updatedService.id ? updatedService : s)),
      );
      setFilteredServices((prev) =>
        prev.map((s) => (s.id === updatedService.id ? updatedService : s)),
      );

      setEditingService(null);
      setSuccess("Услуга успешно обновлена!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Обработка удаления услуги
  const handleDelete = async (serviceId: number) => {
    if (!user) {
      setError("Пользователь не авторизован");
      return;
    }

    if (!confirm("Вы уверены, что хотите удалить эту услугу?")) return;

    try {
      const response = await fetch(`${apiUrl}/services/${serviceId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Не удалось удалить услугу");
      }

      // Обновление списка
      setServices((prev) => prev.filter((service) => service.id !== serviceId));
      setFilteredServices((prev) =>
        prev.filter((service) => service.id !== serviceId),
      );

      setSuccess("Услуга удалена");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Ошибка при удалении услуги");
      console.error(err);
    }
  };

  // Форматирование длительности
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}ч ${mins}мин` : `${mins}мин`;
  };

  const formatSpecialization = (specialization: string): string => {
    const map: Record<string, string> = {
        electric: 'Электрика',
        engine: 'Двигатель',
        transmission: 'Трансмиссия',
        body: 'Кузовной ремонт',
        tire: 'Шиномонтаж',
        mechanic: 'Слесарь',
        universal: 'Универсальный мастер',
    };

    return map[specialization] || specialization; // если нет в списке — вернёт исходное значение
  };

  // Обработка состояния загрузки
  if (!user) {
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

  if (user && user.role !== "admin") {
    return (
      <div className="min-h-screen bg-gray-100 p-5">
        <div className="flex flex-col md:flex-row md:items-center gap-4 bg-white/95 backdrop-blur-sm p-6 rounded-xl shadow mb-2">
            <Book className="w-8 h-8 text-yellow-500"/>
            <h1 className="text-2xl font-bold text-gray-600">Учёт услуг</h1>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 text-gray-600 px-4 py-3 rounded mt-4 mx-5">
          <p className="font-medium">Только для просмотра</p>
          <p className="text-sm">
            Для редактирования данных требуется права администратора
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center gap-4 bg-white/95 backdrop-blur-sm p-6 rounded-xl shadow mb-2">
        <Book className="w-8 h-8 text-yellow-500"/>
        <h1 className="text-2xl font-bold text-gray-600">Учёт услуг</h1>
      </div>

      {/* Форма добавления услуги */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-2 text-gray-600">
        <h2 className="text-xl font-semibold mb-4">
          {editingService ? "Редактирование услуги" : "Добавить новую услугу"}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md">
            {success}
          </div>
        )}

        <form
          onSubmit={
            editingService
              ? (e) => {
                  e.preventDefault();
                  handleSave();
                }
              : handleSubmit
          }
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Название <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={editingService ? editingService.name : newService.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-300 text-gray-600"
              placeholder="Например: ТО-1, диагностика двигателя"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Длительность (мин) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="duration"
              value={
                editingService ? editingService.duration : newService.duration
              }
              onChange={handleInputChange}
              min="15"
              max="480"
              step="15"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-300 text-gray-600"
              placeholder="15-480 минут"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Специализация <span className="text-red-500">*</span>
            </label>
            <select
                name="specialization"
                value={editingService ? editingService.specialization : newService.specialization}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-300 text-600"
            >
                <option value="" disabled hidden>
                Выберите специализацию
                </option>
                <option value="electric">Электрика</option>
                <option value="engine">Двигатель</option>
                <option value="transmission">Трансмиссия</option>
                <option value="body">Кузовной ремонт</option>
                <option value="tire">Шиномонтаж</option>
                <option value="mechanic">Слесарь</option>
                <option value="universal">Универсальный мастер</option>
            </select>
            </div>

          <div className="md:col-span-2 flex justify-end space-x-4">
            {editingService ? (
              <>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="mb-6 hover:bg-yellow-300 hover:text-gray-600 text-gray-100 px-4 py-2 rounded bg-gray-600 transition-all ease-in-out"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSubmitting}
                  className="mb-6 hover:bg-yellow-300 hover:text-gray-600 text-gray-100 px-4 py-2 rounded bg-gray-600 transition-all ease-in-out"
                >
                  {isSubmitting ? "Сохранение..." : "Сохранить изменения"}
                </button>
              </>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="mb-6 hover:bg-yellow-300 hover:text-gray-600 text-gray-100 px-4 py-2 rounded bg-gray-600 transition-all ease-in-out"
              >
                {isSubmitting ? "Добавление..." : "Добавить услугу"}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Список услуг */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden text-gray-600">
        <div className="flex justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Список услуг</h2>
          {/* Поиск */}
          <div className="w-1/2 relative">
            <input
              type="text"
              placeholder="Поиск по названию и длительности..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-300 text-gray-600"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Загрузка услуг...</p>
            </div>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchQuery ? "Услуги не найдены" : "Нет добавленных услуг"}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      {service.name}
                    </h3>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600 mt-2">
                      <div>
                        <span className="font-medium">Длительность:</span>{" "}
                        {formatDuration(service.duration)}
                      </div>
                      <div>
                        <span className="font-medium">Зарегистрирована:</span>{" "}
                        {new Date(service.createdAt).toLocaleDateString(
                          "ru-RU",
                        )}
                      </div>
                      <div>
                        <span className="font-medium">Специальность:</span>{" "}
                        {formatSpecialization(service.specialization)}
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(service)}
                      className="text-gray-600 hover:text-blue-800"
                      title="Редактировать"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(service.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Удалить"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
