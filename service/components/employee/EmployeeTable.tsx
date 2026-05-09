import { Employee } from '@/lib/schema';
import { EditableCell } from './EditableCell';
import { useState } from 'react';

interface EmployeeTableProps {
  employees: Employee[];
  onEdit: (id: number, field: keyof Employee, value: string) => void;
  onDelete: (id: number) => void;
  isAdmin: boolean; 
}

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

    return map[specialization] || specialization;
  };

export function EmployeeTable({ employees, onEdit, onDelete, isAdmin }: EmployeeTableProps) {
  const [searchName, setSearchName] = useState('');
  const [filterSpecialization, setFilterSpecialization] = useState<string>('all');

  const specializations = [
    { value: 'all', label: 'Все специализации' },
    { value: 'electric', label: 'Электрика' },
    { value: 'engine', label: 'Двигатель' },
    { value: 'transmission', label: 'Трансмиссия' },
    { value: 'body', label: 'Кузовной ремонт' },
    { value: 'tire', label: 'Шиномонтаж' },
    { value: 'mechanic', label: 'Слесарь' },
    { value: 'universal', label: 'Универсальный мастер' },
  ];

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch = searchName === '' || emp.name.toLowerCase().includes(searchName.toLowerCase());
    const matchesSpecialization =
      filterSpecialization === 'all' || emp.specialization === filterSpecialization;
    return matchesSearch && matchesSpecialization;
  });

  if (!employees || employees.length === 0) {
    return <p className="text-center text-gray-600">Мастера не найдены</p>;
  }

  return (
    <div className="overflow-x-auto">

      {/* Панель фильтров */}
      <div className="mb-4 mx-2 flex flex-col md:flex-row gap-4">
        {/* Поиск по имени */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Поиск по имени</label>
          <input
            type="text"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            placeholder="Введите имя мастера..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-600"
          />
        </div>

        {/* Фильтр по специализации */}
        <div className="md:w-64">
          <label className="block text-sm font-medium text-gray-700 mb-1">Специализация</label>
          <select
            value={filterSpecialization}
            onChange={(e) => setFilterSpecialization(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white text-gray-600"
          >
            {specializations.map((spec) => (
              <option key={spec.value} value={spec.value}>
                {spec.label}
              </option>
            ))}
          </select>
        </div>
        {/* Кнопка сброса */}
        {(searchName || filterSpecialization !== 'all') && (
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchName('');
                setFilterSpecialization('all');
              }}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 underline"
            >
              Сбросить
            </button>
          </div>
        )}
      </div>
      <table className="w-full bg-white border border-gray-300 rounded-lg text-gray-600">
        <thead className="bg-gray-300">
          <tr>
            <th className="py-2 px-4 border-b">Имя</th>
            <th className="py-2 px-4 border-b">Специализация</th>
            {isAdmin && <th className="py-2 px-4 border-b">Действия</th>}
          </tr>
        </thead>
        <tbody>
          {filteredEmployees.map((emp: Employee) => (
            <tr key={emp.id} className="hover:bg-gray-50">
              <td className="py-2 px-4 border-b">
                {isAdmin ? (
                  <EditableCell
                    value={emp.name}
                    onChange={(value) => onEdit(emp.id, 'name', value)}
                  />
                  ) : (
                    <span>{emp.name}</span>
                  )}
              </td>
              <td className="py-2 px-4 border-b">
                {isAdmin ? (
                  <EditableCell
                    value={formatSpecialization(emp.specialization)}
                    onChange={(value) => onEdit(emp.id, 'specialization', value)}
                    type="dropdown"
                  />
                  ) : (
                    <span>{formatSpecialization(emp.specialization)}</span>
                  )}
              </td>
              {isAdmin && (
                <td className="py-2 px-4 border-b text-center">
                  <button
                    onClick={() => {
                      if (confirm(`Вы уверены, что хотите удалить мастера "${emp.name}"?`)) {
                        onDelete(emp.id);
                      }
                    }}
                    className="text-red-600 hover:text-red-800"
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
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
