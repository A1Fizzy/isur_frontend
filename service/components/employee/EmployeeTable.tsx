import { Employee } from '@/lib/schema';
import { EditableCell } from './EditableCell';

interface EmployeeTableProps {
  employees: Employee[];
  onEdit: (id: number, field: keyof Employee, value: string) => void;
  isAdmin: boolean; 
}

const SPECIALIZATIONS = [
  "Автоэлектрик",
  "Моторист",
  "Механик-диагност",
  "Шиномонтажник",
  "Автомаляр",
  "Автожестянщик",
  "Ходовик"
];

export function EmployeeTable({ employees, onEdit, isAdmin }: EmployeeTableProps) {
  if (!employees || employees.length === 0) {
    return <p className="text-center text-gray-600">Мастера не найдены</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full bg-white border border-gray-300 rounded-lg text-gray-600">
        <thead className="bg-gray-300">
          <tr>
            <th className="py-2 px-4 border-b">Имя</th>
            <th className="py-2 px-4 border-b">Специализация</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp: Employee) => (
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
                    value={emp.specialization}
                    onChange={(value) => onEdit(emp.id, 'specialization', value)}
                    type="dropdown"
                    options={SPECIALIZATIONS}
                  />
                  ) : (
                    <span>{emp.specialization}</span>
                  )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
