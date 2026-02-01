import React, { useState } from 'react';
import { INITIAL_DATA } from './constants';
import { ProposalData, ViewMode, Language } from './types';
import { InputForm } from './components/InputForm';
import { OutputDisplay } from './components/OutputDisplay';

const App: React.FC = () => {
  const [formData, setFormData] = useState<ProposalData>(INITIAL_DATA);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.FORM);
  const [language, setLanguage] = useState<Language>('zh-CN');

  const handleGenerate = () => {
    // Simply switch view to result mode, passing data directly
    setViewMode(ViewMode.RESULT);
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'zh-CN' ? 'zh-HK' : 'zh-CN');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Header */}
      <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-50 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-amber-600 rounded-sm flex items-center justify-center font-serif font-bold text-slate-900">
              PB
            </div>
            <h1 className="text-lg font-semibold tracking-wide serif-font text-slate-100">
              Private Bank <span className="text-amber-500">Proposal Generator</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleLanguage}
              className="px-3 py-1 rounded-full border border-slate-600 bg-slate-800 text-xs font-bold text-slate-200 hover:bg-slate-700 hover:border-amber-500 transition-all flex items-center gap-2"
            >
              <span className={language === 'zh-CN' ? 'text-amber-500' : 'text-slate-500'}>简</span>
              <span className="w-[1px] h-3 bg-slate-600"></span>
              <span className={language === 'zh-HK' ? 'text-amber-500' : 'text-slate-500'}>繁</span>
            </button>
            <div className="text-xs text-slate-400">
              v2.1
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
          {/* Main Column: Form or Result */}
          <div className="col-span-1 lg:col-span-12">
            {viewMode === ViewMode.FORM ? (
              <InputForm
                data={formData}
                onChange={setFormData}
                onSubmit={handleGenerate}
                lang={language}
              />
            ) : (
              <div className="h-[800px] lg:h-[calc(100vh-8rem)]">
                <OutputDisplay
                  data={formData}
                  onBack={() => setViewMode(ViewMode.FORM)}
                  lang={language}
                  onToggleLanguage={toggleLanguage}
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;