// src/components/ui/CountrySelect.tsx - Componente reutilizable para selección de país - Dark Tech
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { COUNTRIES } from '@/lib/countries';

interface CountrySelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const CountrySelect: React.FC<CountrySelectProps> = ({
  value,
  onValueChange,
  placeholder = "Selecciona un país",
  disabled = false,
  className = ""
}) => {
  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <SelectTrigger className={`bg-darkbg border-gold/30 text-white ${className}`}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="bg-darkbg-light border-gold/30">
        {COUNTRIES.map((country) => (
          <SelectItem 
            key={country.code} 
            value={country.code}
            className="text-white hover:bg-darkbg hover:text-gold focus:bg-darkbg focus:text-gold"
          >
            {country.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};