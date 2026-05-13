// app/vehicles/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Vehicle, vehicleSchema } from '@/lib/schema';
import { vehicleApi } from '@/lib/apiClient';
import { VehicleForm } from '@/components/vehicles/VehicleForm';
import { VehicleTable } from '@/components/vehicles/VehicleTable';
import Loader from '@/components/Loader';
import { Car } from 'lucide-react';

export default function VehiclesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Проверка, является ли пользователь администратором
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (!user){
      setLoading(false);
      return;
    }

    const loadVehicles = async () => {
      try {
        setLoading(true);
        const data = await vehicleApi.getAll();
        setVehicles(data);
      } catch (err: any) {
        setError(err.message || 'Ошибка загрузки автомобилей');
      } finally {
        setLoading(false);
      }
    };

    loadVehicles();
  }, [user]);

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

  const handleCreate = async (data: { plateNumber: string; model: string; year: number }) => {
    if (!isAdmin) {
      setError('Недостаточно прав для добавления автомобилей');
      return;
    }

    try {
      const newVehicle = await vehicleApi.create(data);
      setVehicles((prev) => [...prev, newVehicle]);
      setShowForm(false);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Не удалось добавить автомобиль');
    }
  };

  const handleEdit = async (id: number, field: keyof Vehicle, value: string | number) => {
    if (!isAdmin) {
      setError('Недостаточно прав для редактирования автомобилей');
      return;
    }

    try {
      const updated = await vehicleApi.update(id, { [field]: value });
      setVehicles((prev) => prev.map((v) => (v.id === id ? updated : v)));
      setError('');
    } catch (err: any) {
      setError(err.message || 'Не удалось обновить данные');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-5">
      <div className="flex flex-col md:flex-row md:items-center gap-4 bg-white/95 backdrop-blur-sm p-6 rounded-xl shadow mb-2">
        <Car className="w-8 h-8 text-yellow-500"/>
        <h1 className="text-2xl font-bold text-gray-600">Учёт автомобилей</h1>
        {isAdmin && (
          <div className="flex justify-end w-3/4 px-3 py-1 rounded-full">
            <div className="text-end text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full ">
              Режим администратора
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="gap-4 bg-white/95 backdrop-blur-sm p-6 rounded-xl shadow mb-2">
      {isAdmin && (
        <button
          onClick={() => setShowForm(!showForm)}
          className="hover:bg-yellow-300 hover:text-gray-600 text-gray-100 px-4 py-2 rounded bg-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-300 transition-all ease-in-out"
        >
          {showForm ? 'Отмена' : 'Добавить автомобиль'}
        </button>
      )}

      {showForm && isAdmin && (
        <VehicleForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
      )}
      </div>

      {loading ? (
        <Loader/>
      ) : (
        <div className="gap-4 bg-white/95 backdrop-blur-sm p-6 rounded-xl shadow mb-2">
          <VehicleTable 
            vehicles={vehicles} 
            onEdit={handleEdit}
            isAdmin={isAdmin}
          />
        </div>
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