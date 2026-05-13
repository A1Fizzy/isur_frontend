'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { 
  Loader2, User, Wrench, Car, Clock, X, 
  ChevronDown, FileText, Search, Check,
  Album
} from 'lucide-react';

// Типы данных

interface Service {
  id: number;
  name: string;
  duration: number;
}

interface Order {
  id: number;
  customerName: string;
  vehiclePlate: string;
  vehicleModel?: string;
  serviceName: string;
  service: Service;
  employeeName: string | null;
  preferredTime: string;
  duration: number;
  status: string;
  notes?: string; 
}

interface Vehicle {
  id: number;
  plateNumber: string;
  model: string;
}

export default function ReportsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'completed' | 'vehicle'>('completed');
  
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  const [vehicleOrders, setVehicleOrders] = useState<Order[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // Загрузка выполненных заказов и списка авто
  useEffect(() => {
    if (!user || !token) return;
    const init = async () => {
      setLoading(true);
      try {
        const [ordersRes, vehiclesRes] = await Promise.all([
          fetch(`${apiUrl}/reports/completed`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${apiUrl}/vehicles`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        if (!ordersRes.ok || !vehiclesRes.ok) throw new Error('Ошибка загрузки данных отчётов');

        setCompletedOrders(await ordersRes.json());
        setVehicles(await vehiclesRes.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [user, token]);

  // Загрузка истории выбранного авто
  useEffect(() => {
    if (!selectedVehicleId || !token) {
      setVehicleOrders([]);
      return;
    }
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiUrl}/reports/vehicle/${selectedVehicleId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Не удалось загрузить историю авто');
        setVehicleOrders(await res.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки истории');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [selectedVehicleId, token]);

  const formatDate = (iso: string) => 
    new Date(iso).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  if (!user) return <div className="p-10 text-center text-gray-500">Требуется авторизация</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Заголовок и переключатель вкладок */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/95 backdrop-blur-sm p-6 rounded-xl shadow">
          <div className="flex items-center gap-3">
            <Album className="w-8 h-8 text-yellow-500" />
            <h1 className="text-2xl font-bold text-gray-600">Отчёты и история</h1>
          </div>
          
          <div className="flex bg-gray-100 p-1 rounded-lg w-fit">
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'completed' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Выполненные заказы
            </button>
            <button
              onClick={() => setActiveTab('vehicle')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'vehicle' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              История по авто
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Контент вкладок */}
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow overflow-hidden min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Loader2 className="w-8 h-8 animate-spin text-yellow-500 mb-3" />
              <span>Загрузка данных...</span>
            </div>
          ) : activeTab === 'completed' ? (
            completedOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <FileText className="w-12 h-12 text-gray-300 mb-3" />
                <p>Нет выполненных заказов за выбранный период</p>
              </div>
            ) : (
              <OrderTable orders={completedOrders} onView={setSelectedOrder} />
            )
          ) : (
            <div className="p-6 space-y-5">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Search className="w-4 h-4" /> Автомобиль:
                </label>
                <div className="relative flex-1 w-full sm:w-72">
                  <select
                    value={selectedVehicleId || ''}
                    onChange={(e) => setSelectedVehicleId(e.target.value ? Number(e.target.value) : null)}
                    className="w-full pl-10 pr-8 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-300 focus:border-transparent appearance-none bg-white text-gray-700"
                  >
                    <option value="">Выберите автомобиль...</option>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>{v.plateNumber} — {v.model}</option>
                    ))}
                  </select>
                  <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {vehicleOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                  <Car className="w-12 h-12 text-gray-300 mb-3" />
                  <p>{selectedVehicleId ? 'У этого авто нет заказов в системе' : 'Выберите автомобиль для просмотра истории'}</p>
                </div>
              ) : (
                <OrderTable orders={vehicleOrders} onView={setSelectedOrder} />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Модальное окно деталей заказа */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 relative animate-fade-in" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedOrder(null)} 
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FileText className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Заказ #{selectedOrder.id}</h2>
                <p className="text-sm text-gray-500">{formatDate(selectedOrder.preferredTime)}</p>
              </div>
            </div>

            <div className="space-y-3">
              <DetailRow icon={<Car className="w-4 h-4" />} label="Автомобиль" value={`${selectedOrder.vehiclePlate} ${selectedOrder.vehicleModel ? `(${selectedOrder.vehicleModel})` : ''}`} />
              <DetailRow icon={<User className="w-4 h-4" />} label="Клиент" value={selectedOrder.customerName} />
              <DetailRow icon={<Wrench className="w-4 h-4" />} label="Услуга" value={selectedOrder.service.name} />
              <DetailRow icon={<User className="w-4 h-4" />} label="Мастер" value={selectedOrder.employeeName || 'Не назначен'} />
              <DetailRow icon={<Clock className="w-4 h-4" />} label="Длительность" value={`${selectedOrder.service.duration} мин`} />
              <DetailRow icon={<Wrench className="w-4 h-4" />} label="Статус" value={getStatusLabel(selectedOrder.status)} />
            </div>

            <button 
              onClick={() => setSelectedOrder(null)} 
              className="mt-6 w-full py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function OrderTable({ orders, onView }: { orders: Order[], onView: (o: Order) => void }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse text-gray-600">
        <thead className="bg-gray-50 text-gray-600 text-sm">
          <tr>
            <th className="p-4 font-medium border-b">ID</th>
            <th className="p-4 font-medium border-b">Автомобиль</th>
            <th className="p-4 font-medium border-b">Услуга</th>
            <th className="p-4 font-medium border-b">Клиент</th>
            <th className="p-4 font-medium border-b">Мастер</th>
            <th className="p-4 font-medium border-b">Дата</th>
            <th className="p-4 font-medium border-b text-right">Действие</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {orders.map(order => (
            <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
              <td className="p-4 font-mono text-xs text-gray-500">#{order.id}</td>
              <td className="p-4 font-medium text-gray-800">{order.vehiclePlate}</td>
              <td className="p-4 text-gray-600">{order.serviceName}</td>
              <td className="p-4 text-gray-600">{order.customerName}</td>
              <td className="p-4 text-gray-600">{order.employeeName || '—'}</td>
              <td className="p-4 text-gray-500 text-sm">{new Date(order.preferredTime).toLocaleDateString('ru-RU')}</td>
              <td className="p-4 text-right">
                <button 
                  onClick={() => onView(order)} 
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-yellow-50 text-yellow-700 text-xs font-medium rounded-md hover:bg-yellow-100 transition"
                >
                  Подробнее
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | React.ReactNode}) {
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
      <span className="text-gray-500">{icon}</span>
      <span className="text-gray-500 w-24 shrink-0 text-sm">{label}:</span>
      <span className="text-gray-800 font-medium text-sm">{value}</span>
    </div>
  );
}

function getStatusLabel(status: string) {
  const map: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
    completed: { 
      icon: <Check className="w-4 h-4 text-green-500" />, 
      label: 'Выполнен', 
      color: 'text-green-700 bg-green-50' 
    },
    cancelled: { 
      icon: <X className="w-4 h-4 text-red-500" />, 
      label: 'Отменён', 
      color: 'text-red-700 bg-red-50' 
    },
    in_progress: { 
      icon: <Wrench className="w-4 h-4 text-blue-500" />, 
      label: 'В работе', 
      color: 'text-blue-700 bg-blue-50' 
    },
    pending: { 
      icon: <Clock className="w-4 h-4 text-yellow-500" />, 
      label: 'Ожидание', 
      color: 'text-yellow-700 bg-yellow-50' 
    },
  };

  const config = map[status] || { 
    icon: null, 
    label: status, 
    color: 'text-gray-700 bg-gray-50' 
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.icon}
      {config.label}
    </span>
  );
}