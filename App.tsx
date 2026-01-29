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
          {/* Left Column: Context/Info (Desktop only, hidden on result view if needed, but keeping for layout) */}
          <div className={`hidden lg:block lg:col-span-4 space-y-6 ${viewMode === ViewMode.RESULT ? 'lg:hidden' : ''} no-print`}>
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-slate-900">
              <h3 className="text-lg font-bold text-slate-900 serif-font mb-2">Executive Summary</h3>
              <p className="text-sm text-slate-600 mb-4">
                This tool assists Executive Directors in structuring high-net-worth wealth preservation proposals. 
                It generates print-ready PDF reports with high-fidelity formatting specifically using the "Kelly Project" visual style.
              </p>
              <div className="border-t border-slate-200 pt-4">
                <h4 className="text-xs font-bold uppercase text-slate-500 mb-2">Key Features</h4>
                <ul className="text-sm text-slate-700 space-y-2">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                    Vector Infographics (SVG)
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                    Dual Scenario Analysis (A/B)
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                    Instant PDF Generation
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="bg-slate-800 rounded-lg shadow p-6 text-white">
              <h3 className="text-lg font-bold serif-font mb-2 text-amber-500">System Status</h3>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-slate-300">Engine</span>
                <span className="font-mono bg-slate-700 px-2 py-1 rounded">Direct Render</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-300">Output</span>
                <span className="font-mono bg-slate-700 px-2 py-1 rounded">A4 PDF</span>
              </div>
            </div>
          </div>

          {/* Right/Main Column: Form or Result */}
          <div className={`${viewMode === ViewMode.RESULT ? 'col-span-12' : 'col-span-1 lg:col-span-8'}`}>
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