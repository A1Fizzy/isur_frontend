import { useState, useEffect } from 'react';

type ValueType = string | number;
type InputType = 'text' | 'number';

interface EditableCellProps {
  value: ValueType;
  onChange: (value: ValueType) => void;
  type?: InputType;
}

export function EditableCell({ value, onChange, type = 'text' }: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value.toString());

  // Синхронизация при изменении внешнего value
  useEffect(() => {
    setEditValue(value.toString());
  }, [value]);

  const handleDoubleClick = () => setIsEditing(true);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setEditValue(e.target.value);

  const save = () => {
    if (type === 'number') {
      const num = parseFloat(editValue);
      if (!isNaN(num)) onChange(num);
    } else {
      onChange(editValue);
    }
    setIsEditing(false);
  };

  const handleBlur = () => save();
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') save();
    if (e.key === 'Escape') {
      setEditValue(value.toString());
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <input
        autoFocus
        type={type}
        value={editValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        min={type === 'number' ? 1900 : undefined}
        max={type === 'number' ? new Date().getFullYear() : undefined}
        className="w-full px-2 py-1 border border-yellow-400 rounded text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
        onClick={(e) => e.stopPropagation()}
      />
    );
  }

  return (
    <div
      onDoubleClick={handleDoubleClick}
      className="cursor-pointer px-2 py-1 hover:bg-yellow-50 rounded border border-transparent hover:border-yellow-200 transition-colors"
    >
      {value}
    </div>
  );
}
