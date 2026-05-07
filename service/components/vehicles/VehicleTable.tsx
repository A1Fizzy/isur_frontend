// components/vehicles/VehicleTable.tsx
import { Vehicle } from "@/lib/schema";
import { EditableCell } from "./EditableCell";
import { useState } from "react";

interface VehicleTableProps {
  vehicles: Vehicle[];
  onEdit: (id: number, field: keyof Vehicle, value: string | number) => void;
  isAdmin: boolean;
}

export function VehicleTable({ vehicles, onEdit, isAdmin }: VehicleTableProps) {
  const [plateSearch, setPlateSearch] = useState("");
  const [modelSearch, setModelSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Фильтрация автомобилей
  const filteredVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.plateNumber.toLowerCase().includes(plateSearch.toLowerCase()) &&
      vehicle.model.toLowerCase().includes(modelSearch.toLowerCase()) &&
      (statusFilter === "all" || vehicle.status === statusFilter),
  );

  if (vehicles.length === 0) {
    return <p>Автомобили не найдены</p>;
  }

  return (
    <div className="overflow-x-auto">
      {/* Поля поиска */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <input
            type="text"
            placeholder="Поиск по госномеру..."
            value={plateSearch}
            onChange={(e) => setPlateSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-1 focus:ring-yellow-300 text-gray-600"
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="Поиск по модели..."
            value={modelSearch}
            onChange={(e) => setModelSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-1 focus:ring-yellow-300 text-gray-600"
          />
        </div>
      </div>

      {(plateSearch || modelSearch || statusFilter !== "all") && (
        <div className="mb-4 text-sm text-gray-500">
          Найдено: {filteredVehicles.length} автомобилей
          {(plateSearch || modelSearch || statusFilter !== "all") && (
            <button
              onClick={() => {
                setPlateSearch("");
                setModelSearch("");
                setStatusFilter("all");
              }}
              className="ml-4 text-gray-600 hover:text-yellow-600 font-bold"
            >
              Сбросить фильтры
            </button>
          )}
        </div>
      )}

      <table className="w-full bg-white border border-gray-300 rounded-lg text-gray-600">
        <thead className="bg-gray-300">
          <tr className="grid grid-cols-4">
            <th className="py-2 px-4 border-b flex items-center justify-center">
              Госномер
            </th>
            <th className="py-2 px-4 border-b flex items-center justify-center">
              Модель
            </th>
            <th className="py-2 px-4 border-b flex items-center justify-center">
              Год
            </th>
            <th className="py-2 px-4 border-b flex items-center justify-center">
              <div className="flex flex-row items-center">
                <span className="mr-2">Статус</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2 py-1 border border-gray-400 rounded text-xs focus:outline-none focus:ring-1 focus:ring-yellow-300"
                >
                  <option value="all">Все</option>
                  <option value="in_service">Экспл.</option>
                  <option value="in_repair">Ремонт</option>
                  <option value="out_of_order">Сломан</option>
                </select>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredVehicles.length === 0 ? (
            <tr className="grid grid-cols-4">
              <td
                colSpan={4}
                className="py-4 px-4 text-center text-gray-500 col-span-4"
              >
                {plateSearch || modelSearch || statusFilter !== "all"
                  ? "Автомобили по вашему запросу не найдены"
                  : "Автомобили не найдены"}
              </td>
            </tr>
          ) : (
            filteredVehicles.map((v) => (
              <tr key={v.id} className="grid grid-cols-4 hover:bg-gray-50">
                <td className="py-2 px-4 border-b flex items-center justify-center">
                  {isAdmin ? (
                    <EditableCell
                      value={v.plateNumber}
                      onChange={(value) => onEdit(v.id, "plateNumber", value)}
                    />
                  ) : (
                    <span className="font-bold">{v.plateNumber}</span>
                  )}
                </td>
                <td className="py-2 px-4 border-b flex items-center justify-center">
                  {isAdmin ? (
                    <EditableCell
                      value={v.model}
                      onChange={(value) => onEdit(v.id, "model", value)}
                    />
                  ) : (
                    <span>{v.model}</span>
                  )}
                </td>
                <td className="py-2 px-4 border-b flex items-center justify-center">
                  {isAdmin ? (
                    <EditableCell
                      value={v.year}
                      type="number"
                      onChange={(value) => onEdit(v.id, "year", value)}
                    />
                  ) : (
                    <span>{v.year}</span>
                  )}
                </td>
                <td className="py-2 px-4 border-b flex items-center justify-center">
                  {isAdmin ? (
                    <select
                      value={v.status}
                      onChange={(e) => onEdit(v.id, "status", e.target.value)}
                      className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="in_service">В эксплуатации</option>
                      <option value="in_repair">В ремонте</option>
                      <option value="out_of_order">Вышел из строя</option>
                    </select>
                  ) : (
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        v.status === "in_service"
                          ? "bg-green-100 text-green-800"
                          : v.status === "in_repair"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {v.status === "in_service" && "В эксплуатации"}
                      {v.status === "in_repair" && "В ремонте"}
                      {v.status === "out_of_order" && "Вышел из строя"}
                    </span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
