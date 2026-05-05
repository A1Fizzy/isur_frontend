'use client';

import { useAuth } from '@/lib/auth';
import { useState, useEffect } from 'react';
import { Album, Car, CircleUser, ListOrdered, LogOut, LucideIcon, PanelRightClose, PanelRightOpen, Users, Wrench, Book } from 'lucide-react';

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  // Восстановление состояния
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved) {
      setCollapsed(JSON.parse(saved));
    }
  }, []);

  const toggleCollapse = () => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    localStorage.setItem('sidebar-collapsed', JSON.stringify(newCollapsed));
  };

  if (!user) return <>{children}</>;

  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />

      {/* Основной контент */}
      <div className="drawer-content">
        {/* Кнопка drawer только на мобильных */}
        <label htmlFor="my-drawer-2" className="btn btn-square btn-ghost lg:hidden m-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </label>
        <main>{children}</main>
      </div>

      {/* Сайдбар */}
      <div className="drawer-side z-50">
        <label htmlFor="my-drawer-2" className="drawer-overlay"></label>

        <aside
          className={`flex flex-col bg-neutral text-neutral-content transition-all duration-300 ease-in-out ${
            collapsed ? 'w-20' : 'w-60'
          } h-screen`}
        >
          {/* Верхняя часть: кнопка сворачивания и заголовок */}
          <div className="p-4 border-b border-neutral-content/20 flex-shrink-0 bg-gray-500">
            <button
              onClick={toggleCollapse}
              className="btn btn-ghost justify-between hover:bg-yellow-300 hover:text-gray-600 flex items-center gap-3 px-2 py-2 rounded font-semibold"
            >
              <span className="flex items-center gap-3">
                <span className="text-lg">{collapsed ? <PanelRightClose /> : <PanelRightOpen />}</span>
              </span>
            </button>

            {/* Заголовок меню — только если не свёрнуто */}
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
              collapsed ? 'max-h-0 opacity-0' : 'max-h-12 opacity-100'
            }`}>
              <h2 className="text-lg font-semibold text-left ml-4 mt-4 text-gray-100">
                Меню
              </h2>
            </div>
          </div>

          {/* Основное меню — прокручивается */}
          <div className="flex-1 overflow-y-auto bg-gray-500 text-gray-100">
            <ul className="menu p-4 space-y-1 w-full ">
              <SidebarItem href="/dashboard" icon={CircleUser} label="Личный кабинет" collapsed={collapsed} index={0}/>
              <SidebarItem href="/vehicles" icon={Car} label="Автомобили" collapsed={collapsed} index={1}/>
              <SidebarItem href="/employee" icon={Wrench} label="Мастера" collapsed={collapsed} index={2}/>
              <SidebarItem href="/reports" icon={Album} label="Отчёты" collapsed={collapsed} index={3}/>
              <SidebarItem href="/orders" icon={ListOrdered} label="Заказы" collapsed={collapsed} index={4}/>
              <SidebarItem href="/customers" icon={Users} label="Клиенты" collapsed={collapsed} index={5}/>
              <SidebarItem href="/services" icon={Book} label="Виды работ" collapsed={collapsed} index={6}/>
            </ul>
          </div>
          {/* Кнопка выхода — внизу */}
          <div className="flex flex-row border-t border-neutral-content/20 p-4 bg-gray-500 w-full justify-between relative">
            <div className={`absolute left-4 transition-all duration-300 ease-in-out whitespace-nowrap py-2 ${
              collapsed 
                ? 'opacity-0 -translate-x-2 pointer-events-none' 
                : 'opacity-100 translate-x-12'
            }`}>
              <span className='py-2' 
                style={{
                  transitionDelay: collapsed ? '0ms' : `50ms`
                }}>{user.name}
              </span>
            </div>
            <button
              onClick={logout}
              className="text-gray-100 hover:bg-red-500 transition flex items-center gap-3 px-2 py-2 rounded text-left"
            >
              <LogOut />
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

interface SidebarItemProps {
  href: string;
  icon: LucideIcon;
  label: string;
  collapsed: boolean;
  index: number;
}

export function SidebarItem({ href, icon: Icon, label, collapsed, index = 0 }: SidebarItemProps) {
  const delay = index * 50;
  return (
    <li>
      <a
        href={href}
      className={`flex items-center p-2 rounded hover:bg-yellow-300 hover:text-gray-600 transition-all ease-in-out relative ${
        collapsed
          ? 'max-w-9'
          : 'max-w-full'
      }`}
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        <span 
          className={`absolute left-8 transition-all duration-300 ease-in-out whitespace-nowrap ${
            collapsed 
              ? 'opacity-0 -translate-x-2 pointer-events-none' 
              : 'opacity-100 translate-x-0'
          }`}
          style={{
            transitionDelay: collapsed ? '0ms' : `${delay}ms`
          }}
        >
          {label}
        </span>
      </a>
    </li>
  );
}