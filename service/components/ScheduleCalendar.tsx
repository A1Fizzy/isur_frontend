'use client';

import { Calendar, View, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, parse, startOfWeek, getDay, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useState, useCallback, useEffect } from 'react';

// Типы
interface ScheduleEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  serviceName: string;
  customerName: string;
  masterId?: number;
  duration: number;
  masterName?: string;
}

interface ScheduleCalendarProps {
  role: string;
  apiUrl: string;
  token: string | null;
  currentMasterId?: number; // ID текущего мастера (для роли master)
}

interface Master {
  id: number;
  name: string;
  specialization: string;
}

type CalendarEvent = {
  id: number;
  title: string;
  start: Date;
  end: Date;
};

const locales = {
  'ru': ru,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { weekStartsOn: 1 }),
  getDay,
  locales,
});

// Кастомный компонент для отображения события
const CustomEvent = ({ event }: { event: ScheduleEvent }) => {
  return (
    <div className="p-1 text-xs leading-tight h-full overflow-hidden">
      <div className="font-semibold truncate mb-0.5">
        {event.serviceName}
      </div>
      <div className="flex flex-col gap-0.5">
        <div className="text-white/90 text-[10px] leading-none truncate">
          {event.customerName}
        </div>
        {event.masterName && (
          <div className="text-white/90 text-[10px] leading-none truncate flex items-center gap-1">
            <span className="text-[8px]">🛠️</span>
            {event.masterName}
          </div>
        )}
      </div>
    </div>
  );
};

// Компонент для отображения события в месячном виде
const CustomMonthEvent = ({ event }: { event: ScheduleEvent }) => {
  return (
    <div className="text-xs leading-tight truncate px-0.5">
      <div className="truncate font-medium">
        {format(event.start, 'HH:mm')} {event.serviceName}
      </div>
    </div>
  );
};

export default function ScheduleCalendar({ role, apiUrl, token, currentMasterId }: ScheduleCalendarProps) {
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [masters, setMasters] = useState<Master[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<View>('week');
  const [date, setDate] = useState(new Date());
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState('');

  // Состояния для формы редактирования
  const [editForm, setEditForm] = useState({
    startTime: '',
    duration: 60,
    masterId: ''
  });

  const eventPropGetter = (event: ScheduleEvent) => {
    const baseStyle = {
      backgroundColor: '#f59e0b',
      borderRadius: '4px',
      border: 'none',
      color: 'white',
      fontWeight: '500',
      cursor: role === 'admin' ? 'pointer' : 'default',
      overflow: 'hidden',
    };

    // Разные стили для разных видов
    if (currentView === 'month') {
      return {
        style: {
          ...baseStyle,
          fontSize: '10px',
          padding: '1px 2px',
          minHeight: '18px',
          marginBottom: '1px',
        }
      };
    } else {
      return {
        style: {
          ...baseStyle,
          fontSize: '12px',
          padding: '2px',
        }
      };
    }
  };

  // Получение имени мастера по ID
  const getMasterName = (masterId?: number): string => {
    if (!masterId) return '';
    const master = masters.find(m => m.id === masterId);
    return master ? master.name : '';
  };

  // Загрузка мастеров
  const fetchMasters = useCallback(async () => {
    if (!token) return;
    
    try {
      const res = await fetch(`${apiUrl}/employees`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (res.ok) {
        const data = await res.json();
        setMasters(data);
      }
    } catch (err) {
      console.error('Ошибка загрузки мастеров:', err);
    }
  }, [apiUrl, token]);

  // Загрузка расписания
  const fetchSchedule = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    try {
      let start: Date;
      let end: Date;

      if (currentView === 'day') {
        start = new Date(date);
        end = new Date(date);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
      } else if (currentView === 'week') {
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1);
        start = new Date(date);
        start.setDate(diff);
        start.setHours(0, 0, 0, 0);
        end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
      } else if (currentView === 'month') {
        start = startOfMonth(date);
        end = endOfMonth(date);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
      } else {
        start = new Date(date);
        end = new Date(date);
        start.setDate(start.getDate() - 7);
        end.setDate(end.getDate() + 30);
      }

      // Формируем URL в зависимости от роли
      let url = `${apiUrl}/schedule?from=${start.toISOString()}&to=${end.toISOString()}`;
      
      if (role === 'master' && currentMasterId) {
        // Для мастера загружаем только его записи
        url += `&masterId=${currentMasterId}`;
      }

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) throw new Error('Не удалось загрузить расписание');

      const data = await res.json();

      const formatted: ScheduleEvent[] = data.map((item: any) => ({
        id: item.id,
        title: `${item.serviceName} (${item.customerName})`,
        start: new Date(item.startTime),
        end: new Date(item.endTime),
        serviceName: item.serviceName,
        customerName: item.customerName,
        masterId: item.masterId,
        duration: item.duration,
        masterName: getMasterName(item.masterId),
      }));

      setEvents(formatted);
    } catch (err) {
      console.error('Ошибка загрузки расписания:', err);
    } finally {
      setLoading(false);
    }
  }, [apiUrl, token, role, date, currentView, currentMasterId]);

  useEffect(() => {
    if (token) {
      fetchSchedule();
      if (role === 'admin') {
        fetchMasters();
      }
    }
  }, [role, token, date, currentView, fetchSchedule, fetchMasters]);

  // Обработчик клика на событие
  const handleEventClick = (event: ScheduleEvent) => {
    if (role === 'admin') {
      setEditingEvent(event);
      setEditForm({
        startTime: format(event.start, "yyyy-MM-dd'T'HH:mm"),
        duration: Math.ceil((event.end.getTime() - event.start.getTime()) / (1000 * 60)),
        masterId: event.masterId?.toString() || ''
      });
      setIsModalOpen(true);
      setFormError(''); // Сбрасываем ошибку при открытии
    }
    // Для мастера клик не делает ничего (или можно сделать просмотр деталей)
  };

  // Валидация формы
  const validateForm = (): boolean => {
    if (!editForm.startTime.trim()) {
      setFormError('Укажите дату и время начала');
      return false;
    }

    if (!editForm.duration || editForm.duration <= 0) {
      setFormError('Длительность должна быть больше 0 минут');
      return false;
    }

    if (editForm.duration < 15) {
      setFormError('Минимальная длительность - 15 минут');
      return false;
    }

    setFormError('');
    return true;
  };

  // Сохранение изменений события
  const handleSaveEvent = async () => {
    if (!editingEvent || !token) return;

    // Валидация формы
    if (!validateForm()) {
      return;
    }

    try {
      const startTime = new Date(editForm.startTime);
      const endTime = new Date(startTime.getTime() + editForm.duration * 60000);

      const res = await fetch(`${apiUrl}/orders/${editingEvent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          preferredTime: startTime.toISOString(),
          duration: editForm.duration,
          masterId: editForm.masterId ? parseInt(editForm.masterId) : null,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Не удалось обновить событие');
      }

      // Обновляем событие в локальном состоянии
      const masterName = getMasterName(editForm.masterId ? parseInt(editForm.masterId) : undefined);
      const updatedEvent = {
        ...editingEvent,
        start: startTime,
        end: endTime,
        masterId: editForm.masterId ? parseInt(editForm.masterId) : undefined,
        masterName: masterName,
        duration: editForm.duration,
      };

      setEvents(prev => prev.map(event => 
        event.id === editingEvent.id ? updatedEvent : event
      ));

      setIsModalOpen(false);
      setEditingEvent(null);
    } catch (err: any) {
      console.error('Ошибка при сохранении события:', err);
      setFormError(err.message || 'Не удалось сохранить изменения');
    }
  };

  // Компоненты для календаря
  const components = {
    event: CustomEvent,
    month: {
      event: CustomMonthEvent
    }
  };

  // Получение заголовка в зависимости от роли
  const getCalendarTitle = () => {
    if (role === 'admin') {
      return 'Расписание мастеров';
    } else if (role === 'master') {
      const currentMaster = masters.find(m => m.id === currentMasterId);
      return `Моё расписание${currentMaster ? ` (${currentMaster.name})` : ''}`;
    }
    return 'Расписание';
  };

  if (loading) {
    return (
      <div className="mt-8 p-6 bg-white rounded-lg shadow">
        <p className="text-center">Загрузка расписания...</p>
      </div>
    );
  }

  return (
    <div className="mt-8 bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">{getCalendarTitle()}</h2>
      
      {/* Модальное окно редактирования (только для админа) */}
      {isModalOpen && editingEvent && role === 'admin' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Редактирование события</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Услуга
                </label>
                <input
                  type="text"
                  value={editingEvent.serviceName}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Клиент
                </label>
                <input
                  type="text"
                  value={editingEvent.customerName}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Дата и время начала *
                </label>
                <input
                  type="datetime-local"
                  value={editForm.startTime}
                  onChange={(e) => {
                    setEditForm(prev => ({ ...prev, startTime: e.target.value }));
                    setFormError(''); // Сбрасываем ошибку при изменении
                  }}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Длительность (минуты) *
                </label>
                <input
                  type="number"
                  value={editForm.duration}
                  onChange={(e) => {
                    const value = e.target.value === '' ? 0 : parseInt(e.target.value);
                    setEditForm(prev => ({ ...prev, duration: value }));
                    setFormError(''); // Сбрасываем ошибку при изменении
                  }}
                  min="15"
                  step="15"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Исполнитель
                </label>
                <select
                  value={editForm.masterId}
                  onChange={(e) => setEditForm(prev => ({ ...prev, masterId: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="">Не назначен</option>
                  {masters.map(master => (
                    <option key={master.id} value={master.id}>
                      {master.name} ({master.specialization})
                    </option>
                  ))}
                </select>
              </div>

              {/* Отображение ошибок */}
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {formError}
                </div>
              )}
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleSaveEvent}
                className="flex-1 bg-yellow-600 text-white py-2 rounded hover:bg-yellow-700 transition-colors disabled:bg-yellow-300 disabled:cursor-not-allowed"
                disabled={!editForm.startTime || !editForm.duration}
              >
                Сохранить
              </button>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingEvent(null);
                  setFormError('');
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400 transition-colors"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ height: 600 }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          selectable={role === 'admin'}
          onView={setCurrentView}
          onNavigate={setDate}
          view={currentView}
          date={date}
          eventPropGetter={eventPropGetter}
          onDoubleClickEvent={handleEventClick}
          components={components}
          messages={{
            next: 'Вперёд',
            previous: 'Назад',
            today: 'Сегодня',
            month: 'Месяц',
            week: 'Неделя',
            day: 'День',
            agenda: 'Повестка',
            date: 'Дата',
            time: 'Время',
            event: 'Событие',
          }}
          culture="ru"
          // Дополнительные настройки для лучшего отображения
          step={15}
          timeslots={currentView === 'week' ? 4 : 1}
          showMultiDayTimes={currentView === 'month'}
        />
      </div>

      {/* Статистика для мастера */}
      {role === 'master' && events.length > 0 && (
  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
    <h3 className="font-semibold mb-2">Статистика за период:</h3>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
      <div className="text-center">
        <div className="font-bold text-lg text-yellow-600">{events.length}</div>
        <div className="text-gray-600">Всего записей</div>
      </div>
      <div className="text-center">
        <div className="font-bold text-lg text-green-600">
          {events.filter(e => e.start > new Date()).length}
        </div>
        <div className="text-gray-600">Предстоящие</div>
      </div>
      <div className="text-center">
        <div className="font-bold text-lg text-blue-600">
          {(() => {
            const totalMinutes = events.reduce((acc, e) => {
              return acc + (Math.ceil((e.end.getTime() - e.start.getTime()) / (1000 * 60)) || 0);
            }, 0);
            const hours = (totalMinutes / 60).toFixed(1);
            return hours;
          })()}
        </div>
        <div className="text-gray-600">Часов работы</div>
      </div>
      <div className="text-center">
        <div className="font-bold text-lg text-purple-600">
          {new Set(events.map(e => e.serviceName)).size}
        </div>
        <div className="text-gray-600">Видов услуг</div>
      </div>
    </div>
  </div>
)}
    </div>
  );
}