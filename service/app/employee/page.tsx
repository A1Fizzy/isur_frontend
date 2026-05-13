"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { EmployeeTable } from "@/components/employee/EmployeeTable";
import Loader from "@/components/Loader";
import { Wrench } from "lucide-react";

interface Employee {
  id: number;
  name: string;
  specialization: string;
  userId: number;
}

export default function EmployeesPage() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "" });
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [userFormError, setUserFormError] = useState("");
  const isAdmin = user?.role === "admin";

  const fetchEmployees = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/employees", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setEmployees(data);
      } else {
        setError(data.error || "Ошибка загрузки");
      }
    } catch (err) {
      setError("Не удалось подключиться к серверу");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    fetchEmployees();
  }, [user]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserFormError("");

    const { name, email, password } = newUser;
    if (!name.trim() || !email) {
      return setUserFormError("Имя и email обязательны");
    }

    try {
      setIsCreatingUser(true);

      const res = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Не удалось создать пользователя");
      }

      setNewUser({ name: "", email: "", password: "" });
      fetchEmployees();
    } catch (err: any) {
      setUserFormError(err.message);
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleEdit = async (
    id: number,
    field: keyof Employee,
    value: string,
  ) => {
    if (!value.trim()) {
      setError("Поле не может быть пустым");
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/api/employees/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ [field]: value }),
      });

      const data = await res.json();

      if (res.ok) {
        setEmployees((prev) =>
          prev.map((emp) => (emp.id === id ? { ...emp, [field]: value } : emp)),
        );
        setError("");
      } else {
        setError(data.error || "Не удалось обновить");
      }
    } catch (err) {
      setError("Ошибка сети");
    }
  };

  const handleDelete = async (employeeId: number) => {
    try {
      // Найдём employee по id
      const employee = employees.find((emp) => emp.id === employeeId);
      if (!employee) return;

      // Получим userId из employee
      const userId = employee.userId;
      if (!userId) {
        alert("Мастер не привязан к пользователю — удаление невозможно");
        return;
      }

      // Удаляем через /users/:userId
      const res = await fetch(`http://localhost:3000/api/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Не удалось удалить пользователя");
      }

      // Обновляем список мастеров
      setEmployees((prev) => prev.filter((emp) => emp.id !== employeeId));
    } catch (err: any) {
      setError(err.message);
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-100 p-5">
      <div className="flex flex-col md:flex-row md:items-center gap-4 bg-white/95 backdrop-blur-sm p-6 rounded-xl shadow mb-2">
        <Wrench className="w-8 h-8 text-yellow-500"/>
        <h1 className="text-2xl font-bold text-gray-600">Учёт мастеров</h1>
        {isAdmin && (
          <div className="flex justify-end w-3/4 px-3 py-1 rounded-full">
            <div className="text-end text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full ">
              Режим администратора
            </div>
          </div>
        )}
      </div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 mx-5">
          {error}
        </div>
      )}

      {isAdmin && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-2 text-gray-600">
          <h2 className="text-xl font-semibold mb-4">Создать пользователя</h2>

          {userFormError && (
            <div className="mb-4 bg-red-50 text-red-700 px-4 py-3 rounded">
              {userFormError}
            </div>
          )}

          <form
            onSubmit={handleCreateUser}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Имя *
              </label>
              <input
                type="text"
                value={newUser.name}
                onChange={(e) =>
                  setNewUser((prev) => ({ ...prev, name: e.target.value }))
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser((prev) => ({ ...prev, email: e.target.value }))
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Пароль *
              </label>
              <input
                type="text"
                value={newUser.password}
                onChange={(e) =>
                  setNewUser((prev) => ({ ...prev, password: e.target.value }))
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-600"
              />
            </div>
            <button
              type="submit"
              disabled={isCreatingUser}
              className="px-3 py-2 mt-6 bg-gray-600 text-white rounded hover:bg-yellow-300 hover:text-gray-600 text-gray-100 disabled:opacity-50 transition-all ease-in-out w-full"
            >
              {isCreatingUser ? "Создание..." : "Создать пользователя"}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <Loader />
      ) : (
        <div className="gap-4 bg-white/95 backdrop-blur-sm p-6 rounded-xl shadow mb-2">
          <EmployeeTable
            employees={employees}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isAdmin={isAdmin}
          />
        </div>
      )}
      {!isAdmin && (
        <div className="bg-yellow-50 border border-yellow-200 text-gray-600 px-4 py-3 rounded mt-4">
          <p className="font-medium">Только для просмотра</p>
          <p className="text-sm">
            Для редактирования данных требуется права администратора
          </p>
        </div>
      )}
    </div>
  );
}
