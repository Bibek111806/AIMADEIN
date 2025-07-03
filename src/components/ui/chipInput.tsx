import { useState, KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { Input } from './input';

interface ChipInputProps {
  label?: string;
  values: string[];
  onChange: (updated: string[]) => void;
  placeholder?: string;
}

export default function ChipInput({
  label,
  values,
  onChange,
  placeholder = 'Type and press enter...',
}: ChipInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      const newValue = inputValue.trim();
      if (!values.includes(newValue)) {
        onChange([...values, newValue]);
        setInputValue('');
      }
    }
  };

  const removeChip = (index: number) => {
    const updated = [...values];
    updated.splice(index, 1);
    onChange(updated);
  };

  return (
    <div className="w-full space-y-1">
      {label && <label className="block text-sm font-medium mb-1">{label}</label>}

      <div
        className={`flex items-center flex-wrap gap-2 border border-input bg-background rounded-md px-3 ${
          values.length === 0 ? 'h-10' : 'py-1.5 min-h-[40px]'
        } focus-within:ring-2 focus-within:ring-ring`}
      >
        {values.map((val, idx) => (
          <span
            key={idx}
            className="flex items-center gap-1 bg-muted px-3 py-1 rounded-full text-sm"
          >
            {val}
            <X
              className="w-4 h-4 cursor-pointer hover:text-destructive"
              onClick={() => removeChip(idx)}
            />
          </span>
        ))}

        <input
          className="flex-1 bg-transparent text-sm outline-none h-6"
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  );
}
