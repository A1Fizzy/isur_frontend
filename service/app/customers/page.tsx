"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import Loader from "@/components/Loader";
import { Users } from "lucide-react";

interface Customer {
  id: number;
  name: string;
  phone: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
}

export default function CustomersPage() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Состояние для формы
  const [newCustomer, setNewCustomer] = useState<{
    name: string;
    phone: string;
    email: string;
  }>({
    name: "",
    phone: "",
    email: "",
  });

  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Загрузка данных
  const [isLoading, setIsLoading] = useState(true);

  // Загрузка клиентов
  const fetchCustomers = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/api/customers`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) throw new Error("Не удалось загрузить клиентов");

      const data = await response.json();
      setCustomers(data);
      setFilteredCustomers(data);
    } catch (err) {
      setError("Ошибка загрузки данных");
      console.error("Ошибка загрузки клиентов:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Фильтрация клиентов
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCustomers(customers);
      return;
    }

    const query = searchQuery.toLowerCase();
    const result = customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(query) ||
        customer.phone.includes(query) ||
        (customer.email && customer.email.toLowerCase().includes(query)),
    );

    setFilteredCustomers(result);
  }, [searchQuery, customers]);

  // Загрузка при монтировании
  useEffect(() => {
    if (user) {
      fetchCustomers();
    }
  }, [user]);

  // Обработка изменения формы
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (editingCustomer) {
      setEditingCustomer((prev) => (prev ? { ...prev, [name]: value } : null));
    } else {
      setNewCustomer((prev) => ({ ...prev, [name]: value }));
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
    if (!newCustomer.name.trim()) {
      setError("Имя клиента обязательно");
      return;
    }

    if (!/^\+?[0-9]{10,15}$/.test(newCustomer.phone)) {
      setError("Некорректный формат телефона");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // Отправка запроса
      const response = await fetch(`http://localhost:3000/api/customers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(newCustomer),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Не удалось создать клиента");
      }

      const createdCustomer = await response.json();

      // Обновление списка клиентов
      setCustomers((prev) => [createdCustomer, ...prev]);
      setFilteredCustomers((prev) => [createdCustomer, ...prev]);

      // Сброс формы
      setNewCustomer({
        name: "",
        phone: "",
        email: "",
      });

      setSuccess("Клиент успешно добавлен!");

      // Через 3 секунды убрать сообщение об успехе
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Обработка редактирования
  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setError(null);
  };

  // Обработка отмены редактирования
  const handleCancelEdit = () => {
    setEditingCustomer(null);
    setError(null);
  };

  // Обработка сохранения изменений
  const handleSave = async () => {
    if (!editingCustomer) return;

    if (!user) {
      setError("Пользователь не авторизован");
      return;
    }

    // Валидация данных
    if (!editingCustomer.name.trim()) {
      setError("Имя клиента обязательно");
      return;
    }

    if (!/^\+?[0-9]{10,15}$/.test(editingCustomer.phone)) {
      setError("Некорректный формат телефона");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(
        `http://localhost:3000/api/customers/${editingCustomer.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            name: editingCustomer.name,
            phone: editingCustomer.phone,
            email: editingCustomer.email,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Не удалось обновить клиента");
      }

      const updatedCustomer = await response.json();

      // Обновление списка клиентов
      setCustomers((prev) =>
        prev.map((c) => (c.id === updatedCustomer.id ? updatedCustomer : c)),
      );
      setFilteredCustomers((prev) =>
        prev.map((c) => (c.id === updatedCustomer.id ? updatedCustomer : c)),
      );

      setEditingCustomer(null);
      setSuccess("Клиент успешно обновлен!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Обработка удаления клиента
  const handleDelete = async (customerId: number) => {
    if (!user) {
      setError("Пользователь не авторизован");
      return;
    }

    if (!confirm("Вы уверены, что хотите удалить этого клиента?")) return;

    try {
      const response = await fetch(
        `http://localhost:3000/api/customers/${customerId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Не удалось удалить клиента");
      }

      // Обновление списка
      setCustomers((prev) =>
        prev.filter((customer) => customer.id !== customerId),
      );
      setFilteredCustomers((prev) =>
        prev.filter((customer) => customer.id !== customerId),
      );

      setSuccess("Клиент удален");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Ошибка при удалении клиента");
      console.error(err);
    }
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
            <Users className="w-8 h-8 text-yellow-500"/>
            <h1 className="text-2xl font-bold text-gray-600">Учёт клиентов</h1>
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
            <Users className="w-8 h-8 text-yellow-500"/>
            <h1 className="text-2xl font-bold text-gray-600">Учёт клиентов</h1>
        </div>

      {/* Форма добавления клиента */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-2 text-gray-600">
        <h2 className="text-xl font-semibold mb-4">
          {editingCustomer
            ? "Редактирование клиента"
            : "Добавить нового клиента"}
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
            editingCustomer
              ? (e) => {
                  e.preventDefault();
                  handleSave();
                }
              : handleSubmit
          }
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Имя <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={editingCustomer ? editingCustomer.name : newCustomer.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Иван Петров"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Телефон <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={
                editingCustomer ? editingCustomer.phone : newCustomer.phone
              }
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-300 text-gray-600"
              placeholder="+79123456789"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={
                editingCustomer
                  ? editingCustomer.email || ""
                  : newCustomer.email
              }
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-300 text-gray-600"
              placeholder="example@email.com"
            />
          </div>

          <div className="md:col-span-3 flex justify-end space-x-4">
            {editingCustomer ? (
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
                {isSubmitting ? "Добавление..." : "Добавить клиента"}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Список клиентов */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden text-gray-600">
        <div className="flex justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Список клиентов</h2>
          {/* Поиск */}
          <div className="w-1/2">
            <input
              type="text"
              placeholder="Поиск по имени, телефону или email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-300 text-gray-600"
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
              <p className="mt-4 text-gray-600">Загрузка клиентов...</p>
            </div>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchQuery ? "Клиенты не найдены" : "Нет добавленных клиентов"}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      {customer.name}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mt-2">
                      <div>
                        <span className="font-medium">Телефон:</span>{" "}
                        {customer.phone}
                      </div>
                      <div>
                        <span className="font-medium">Email:</span>{" "}
                        {customer.email || "Не указан"}
                      </div>
                      <div>
                        <span className="font-medium">Зарегистрирован:</span>{" "}
                        {new Date(customer.createdAt).toLocaleDateString(
                          "ru-RU",
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(customer)}
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
                      onClick={() => handleDelete(customer.id)}
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
