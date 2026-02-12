import { Vehicle, vehicleSchema, vehiclesSchema } from './schema';

const API_BASE = 'http://localhost:3000/api';

// Получение токена (временно из localStorage — в продакшене заменить на HttpOnly cookie + бэкенд прокси)
function getAuthToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
}

async function request<T>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${input}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(getAuthToken() ? { 'Authorization': `Bearer ${getAuthToken()}` } : {}),
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Неизвестная ошибка');
  }

  const data = await res.json();
  return data;
}

export const vehicleApi = {
  async getAll(): Promise<Vehicle[]> {
    const data = await request('/vehicles');
    return vehiclesSchema.parse(data); // валидация
  },
  async create(vehicle: Omit<Vehicle, 'id' | 'status'>): Promise<Vehicle> {
    const data = await request('/vehicles', {
      method: 'POST',
      body: JSON.stringify(vehicle),
    });
    return vehicleSchema.parse(data);
  },
  async update(id: number, field: Partial<Vehicle>): Promise<Vehicle> {
    const data = await request(`/vehicles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(field),
    });
    return vehicleSchema.parse(data);
  },
};
