import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Languages } from 'lucide-react';

const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'hi', label: 'हिंदी' },
    { value: 'mr', label: 'मराठी' }
  ];

  return (
    <div className="flex items-center space-x-2">
      <Languages className="h-4 w-4 text-muted-foreground" />
      <Select value={language} onValueChange={setLanguage}>
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Language" />
        </SelectTrigger>
        <SelectContent>
          {languageOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSelector;