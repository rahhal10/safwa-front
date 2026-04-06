import { LanguageProvider } from './i18n/LanguageContext';
import ZakatCalculator from './pages/ZakatCalculator';
import './App.css';

function App() {
  return (
    <LanguageProvider>
      <ZakatCalculator />
    </LanguageProvider>
  );
}

export default App;
