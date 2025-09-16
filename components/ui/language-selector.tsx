'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface LanguageSelectorProps {
  value?: string;
  onValueChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
}

const languages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' }
];

export function LanguageSelector({ 
  value, 
  onValueChange, 
  required = false, 
  disabled = false 
}: LanguageSelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="language">Language {required && '*'}</Label>
      <Select 
        value={value} 
        onValueChange={onValueChange}
        disabled={disabled}
        required={required}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a language" />
        </SelectTrigger>
        <SelectContent>
          {languages.map((language) => (
            <SelectItem key={language.code} value={language.code}>
              <span className="flex items-center gap-2">
                <span>{language.name}</span>
                <span className="text-sm text-muted-foreground">({language.nativeName})</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}