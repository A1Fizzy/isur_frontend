"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import Loader from "@/components/Loader";
import { Vehicle } from "@/lib/schema";

interface Order {
  id: number;
  customerId: number;
  serviceId: number;
  vehicleId: number;
  preferredTime: string;
  duration: number;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  employeeId?: number | null;
  customerName?: string;
  serviceName?: string;
  vehicleName?: string;
  employeeName?: string;
}

interface Customer {
  id: number;
  name: string;
  phone: string;
}

interface Service {
  id: number;
  name: string;
  duration: number;
}

interface Employee {
  id: number;
  name: string;
  specialization: string;
}

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Справочные данные
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  // Состояние для формы
  const [newOrder, setNewOrder] = useState<{
    customerId: number | null;
    serviceId: number | null;
    preferredTime: string;
    duration: number | null;
    employeeId: number | null;
    vehicleId: number | null;
    status: "pending" | "in_progress" | "completed" | "cancelled";
    priority: string;
  }>({
    customerId: null,
    serviceId: null,
    preferredTime: "",
    duration: null,
    employeeId: null,
    vehicleId: null,
    status: "pending",
    priority: "NORMAL"
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Загрузка данных
  const [isLoading, setIsLoading] = useState(true);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // API URL из окружения
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

  // Загрузка заказов
  const fetchOrders = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${apiUrl}/orders`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) throw new Error("Не удалось загрузить заказы");

      const data = await response.json();
      setOrders(data);
      setFilteredOrders(data);
    } catch (err) {
      setError("Ошибка загрузки данных");
      console.error("Ошибка загрузки заказов:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Загрузка справочных данных
  const fetchData = async () => {
    if (!user) return;

    setIsDataLoading(true);
    try {
      const [customersRes, servicesRes, employeesRes, vehiclesRes] = await Promise.all([
        fetch(`${apiUrl}/customers`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }),
        fetch(`${apiUrl}/services`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }),
        fetch(`${apiUrl}/employees`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }),
        fetch(`${apiUrl}/vehicles`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }),
      ]);

      const [customersData, servicesData, employeesData, vehiclesData] = await Promise.all([
        customersRes.json(),
        servicesRes.json(),
        employeesRes.json(),
        vehiclesRes.json(),
      ]);

      setCustomers(customersData);
      setServices(servicesData);
      setEmployees(employeesData);
      setVehicles(vehiclesData);
    } catch (err) {
      console.error("Ошибка загрузки справочных данных:", err);
      setError("Не удалось загрузить справочные данные");
    } finally {
      setIsDataLoading(false);
    }
  };

  // Фильтрация заказов
  useEffect(() => {
    let result = [...orders];

    // Фильтрация по статусу
    if (statusFilter !== "all") {
      result = result.filter((order) => order.status === statusFilter);
    }

    setFilteredOrders(result);
  }, [statusFilter, orders]);

  const fetchCustomers = async () => {
    if (!user) return;

    try {
      const response = await fetch(`${apiUrl}/customers`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      }
    } catch (err) {
      console.error("Ошибка загрузки клиентов:", err);
    }
  };

  // Загрузка при монтировании
  useEffect(() => {
    if (user) {
      fetchCustomers();
      fetchOrders();
      fetchData();
    }
  }, [user]);

  // Обработка изменения формы
  const handleInputChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>,
  ) => {
    const { name, value } = e.target;

    // Для числовых полей
    if (
      name === "customerId" ||
      name === "serviceId" ||
      name === "employeeId" ||
      name === "duration"
    ) {
      setNewOrder((prev) => ({
        ...prev,
        [name]: value === "" ? null : Number(value),
      }));
    } else {
      setNewOrder((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Обработка изменения мастера (может быть null)
  const handleEmployeeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setNewOrder((prev) => ({
      ...prev,
      employeeId: value === "none" ? null : Number(value),
    }));
  };

  // Обработка отправки формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError("Пользователь не авторизован");
      return;
    }

    // Валидация обязательных полей
    if (newOrder.customerId === null) {
      setError("Выберите клиента");
      return;
    }

    if (newOrder.serviceId === null) {
      setError("Выберите услугу");
      return;
    }

    if (newOrder.vehicleId === null) {
        setError("Выберите автомобиль");
        return;
    }

    if (!newOrder.preferredTime) {
      setError("Укажите время начала");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // Подготовка данных для отправки
      const orderData = {
        customerId: newOrder.customerId!,
        serviceId: newOrder.serviceId!,
        vehicleId: newOrder.vehicleId!,
        preferredTime: newOrder.preferredTime,
        duration: newOrder.duration,
        employeeId: newOrder.employeeId,
        status: newOrder.status,
        priority: newOrder.priority
      };

      // Отправка запроса
      const response = await fetch(`${apiUrl}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Не удалось создать заказ");
      }

      const createdOrder = await response.json();

      // Обновление списка заказов
      setOrders((prev) => [createdOrder, ...prev]);
      setFilteredOrders((prev) => [createdOrder, ...prev]);

      // Сброс формы
      setNewOrder({
        customerId: null,
        serviceId: null,
        preferredTime: "",
        duration: null,
        employeeId: null,
        vehicleId: null,
        status: "pending",
        priority: "NORMAL"
      });

      setSuccess("Заказ успешно добавлен!");

      // Через 3 секунды убрать сообщение об успехе
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Обработка удаления заказа
  const handleDelete = async (orderId: number) => {
    if (!user) {
      setError("Пользователь не авторизован");
      return;
    }

    if (!confirm("Вы уверены, что хотите удалить этот заказ?")) return;

    try {
      const response = await fetch(`${apiUrl}/orders/${orderId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) throw new Error("Не удалось удалить заказ");

      // Обновление списка
      setOrders((prev) => prev.filter((order) => order.id !== orderId));
      setFilteredOrders((prev) => prev.filter((order) => order.id !== orderId));

      setSuccess("Заказ удален");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Ошибка при удалении заказа");
      console.error(err);
    }
  };

  // Рендер статуса
  const renderStatusBadge = (status: Order["status"]) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      in_progress: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-gray-100 text-gray-800",
    };

    const labels = {
      pending: "Ожидание",
      in_progress: "В работе",
      completed: "Выполнен",
      cancelled: "Отменен",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}
      >
        {labels[status]}
      </span>
    );
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-600">
            Управление заказами
          </h1>
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Управление заказами
        </h1>
      </div>

      {/* Форма добавления заказа */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Добавить новый заказ</h2>

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

        {isDataLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-300"></div>
            <span className="ml-2">Загрузка справочных данных...</span>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Клиент <span className="text-red-500">*</span>
              </label>
              <select
                name="customerId"
                value={newOrder.customerId ?? ""}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-300 text-600"
                required
              >
                <option value="">Выберите клиента</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} ({customer.phone})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Услуга <span className="text-red-500">*</span>
              </label>
              <select
                name="serviceId"
                value={newOrder.serviceId ?? ""}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-300 text-600"
                required
              >
                <option value="">Выберите услугу</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} ({service.duration} мин)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Время начала <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                name="preferredTime"
                value={newOrder.preferredTime}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-300 text-600"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Статус
              </label>
              <select
                name="status"
                value={newOrder.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-300 text-600"
              >
                <option value="pending">Ожидание</option>
                <option value="in_progress">В работе</option>
                <option value="completed">Выполнен</option>
                <option value="cancelled">Отменен</option>
              </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Приоритет
                </label>
                <select
                    name="priority"
                    value={newOrder.priority}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-300 text-600"
                >
                    <option value="NORMAL">Стандартный</option>
                    <option value="URGENT">Срочный</option>
                </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Автомобиль <span className="text-red-500">*</span>
              </label>
              <select
                name="vehicleId"
                value={newOrder.vehicleId ?? ""}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-300 text-600"
                required
              >
                <option value="">Выберите автомобиль</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.plateNumber} ({vehicle.model})
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={isSubmitting || isDataLoading}
                className="mb-6 hover:bg-yellow-300 hover:text-gray-600 text-gray-100 px-4 py-2 rounded bg-gray-600 transition-all ease-in-out"
              >
                {isSubmitting ? "Добавление..." : "Добавить заказ"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Список заказов */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Список заказов</h2>
          {/* Фильтры */}
            <div className="flex space-x-4">
            <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-300 text-gray-600"
            >
                <option value="all">Все статусы</option>
                <option value="pending">Ожидание</option>
                <option value="in_progress">В работе</option>
                <option value="completed">Выполнен</option>
                <option value="cancelled">Отменен</option>
            </select>
            </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Загрузка заказов...</p>
            </div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {statusFilter !== "all"
              ? "Нет заказов, соответствующих выбранному статусу"
              : "Нет созданных заказов"}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredOrders.map((order) => {
              // Найти соответствующие данные для отображения
              const vehicle = vehicles.find((v) => v.id === order.vehicleId);
              const customer = customers.find((c) => c.id === order.customerId);
              const service = services.find((s) => s.id === order.serviceId);
              const employee = order.employeeId
                ? employees.find((e) => e.id === order.employeeId)
                : null;

              return (
                <div
                  key={order.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">
                        {service?.name || "Услуга не указана"}
                      </h3>

                      <div className="flex flex-wrap gap-2 mb-2">
                        {renderStatusBadge(order.status)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Клиент:</span>{" "}
                          {customer?.name || "Не указан"}
                        </div>
                        <div>
                          <span className="font-medium">Время:</span>{" "}
                          {new Date(order.preferredTime).toLocaleString(
                            "ru-RU",
                            {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </div>
                        <div>
                          <span className="font-medium">Мастер:</span>{" "}
                          {employee?.name || "Не назначен"}
                        </div>
                        <div>
                          <span className="font-medium">Автомобиль:</span>{" "}
                          {vehicle?.plateNumber || "Не назначен"}
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => alert("Редактирование заказа")}
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
                        onClick={() => handleDelete(order.id)}
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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
