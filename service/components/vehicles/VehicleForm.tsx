// src/components/vehicles/VehicleForm.tsx
import { useState } from 'react';

interface VehicleFormProps {
  onSubmit: (data: { plateNumber: string; model: string; year: number }) => void;
  onCancel: () => void;
}

export function VehicleForm({ onSubmit, onCancel }: VehicleFormProps) {
  const [plateNumber, setPlateNumber] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!plateNumber || !model || !year) {
      return setError('Все поля обязательны');
    }

    const parsedYear = parseInt(year, 10);
    if (isNaN(parsedYear) || parsedYear < 1900 || parsedYear > new Date().getFullYear()) {
      return setError('Некорректный год');
    }

    onSubmit({ plateNumber, model, year: parsedYear });
    setPlateNumber('');
    setModel('');
    setYear('');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg mb-6 space-y-4 text-gray-600">
      <h3 className="font-semibold">Новый автомобиль</h3>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div>
        <label className="block text-sm font-medium">Госномер</label>
        <input
          type="text"
          value={plateNumber}
          onChange={(e) => setPlateNumber(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="АА123456"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Модель</label>
        <input
          type="text"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="Mercedes Sprinter"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Год выпуска</label>
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
          min="1900"
          max={new Date().getFullYear()}
        />
      </div>
      <div className="flex space-x-3 pt-2">
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          Сохранить
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
        >
          Отмена
        </button>
      </div>
    </form>
  );
}
