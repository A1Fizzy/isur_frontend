'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { EmployeeTable } from '@/components/employee/EmployeeTable';
import Loader from '@/components/Loader';

interface Employee {
  id: number;
  name: string;
  specialization: string;
}

export default function EmployeesPage() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const isAdmin = user?.role === 'admin';
  useEffect(() => {
    if (!user){
      setLoading(false);
      return;
    }

    const fetchEmployees = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/employees', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await res.json();
        if (res.ok) {
          setEmployees(data);
        } else {
          setError(data.error || 'Ошибка загрузки');
        }
      } catch (err) {
        setError('Не удалось подключиться к серверу');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [user]);

  const handleEdit = async (id: number, field: keyof Employee, value: string) => {
    if (!value.trim()) {
      setError('Поле не может быть пустым');
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/api/employees/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ [field]: value }),
      });

      const data = await res.json();

      if (res.ok) {
        setEmployees((prev) =>
          prev.map((emp) => (emp.id === id ? { ...emp, [field]: value } : emp))
        );
        setError('');
      } else {
        setError(data.error || 'Не удалось обновить');
      }
    } catch (err) {
      setError('Ошибка сети');
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-600">Учёт мастеров</h1>
        {isAdmin && (
          <div className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
            Режим администратора
          </div>
        )}
      </div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 mx-5">
          {error}
        </div>
      )}

      {loading ? (
        <Loader/>
      ) : (
        <EmployeeTable employees={employees} onEdit={handleEdit} isAdmin={isAdmin} />
      )}
      {!isAdmin && (
        <div className="bg-yellow-50 border border-yellow-200 text-gray-600 px-4 py-3 rounded mt-4">
          <p className="font-medium">Только для просмотра</p>
          <p className="text-sm">Для редактирования данных требуется права администратора</p>
        </div>
      )}
    </div>
  );
}
