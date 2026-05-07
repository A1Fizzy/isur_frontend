import { useState, useEffect, useRef } from "react";

interface EditableCellProps {
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "dropdown";
  options?: string[];
}

export function EditableCell({
  value,
  onChange,
  type = "text",
}: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing) {
      if (type === "dropdown" && selectRef.current) {
        selectRef.current.focus();
      } else if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }
  }, [isEditing, type]);

  const handleDoubleClick = () => setIsEditing(true);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => setEditValue(e.target.value);

  const handleSave = () => {
    if (editValue.trim() && editValue !== value) {
      onChange(editValue);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") handleCancel();
  };

  if (isEditing) {
    if (type === "dropdown") {
      return (
        <select
          ref={selectRef}
          value={editValue}
          onChange={handleChange}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="w-full px-2 py-1 border border-yellow-400 rounded text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white"
        >
          <option value="" disabled hidden>
            Выберите специализацию
          </option>
          <option value="electric">Электрика</option>
          <option value="engine">Двигатель</option>
          <option value="transmission">Трансмиссия</option>
          <option value="body">Кузовной ремонт</option>
          <option value="tire">Шиномонтаж</option>
          <option value="mechanic">Слесарь</option>
          <option value="universal">Универсальный мастер</option>
        </select>
      );
    }

    return (
      <input
        ref={inputRef}
        type="text"
        value={editValue}
        onChange={handleChange}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className="w-full px-2 py-1 border border-yellow-400 rounded text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
      />
    );
  }

  return (
    <div
      onDoubleClick={handleDoubleClick}
      className="cursor-pointer px-2 py-1 hover:bg-yellow-50 rounded border border-transparent hover:border-yellow-200 transition-colors"
    >
      {value || <span className="text-gray-400">Не выбрано</span>}
    </div>
  );
}
