import { useLanguage } from '@/contexts/LanguageContext';

const TestLanguage = () => {
  const { t, language } = useLanguage();
  
  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-2">Language Test</h3>
      <p>Current Language: {language}</p>
      <p>Translated Text: {t('home.title')}</p>
    </div>
  );
};

export default TestLanguage;