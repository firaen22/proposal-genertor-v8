import React, { useState, useEffect } from 'react';
import { getAvailableModels } from '../services/geminiService';

// 1. Modify Interface
export interface ProposalGeneratorProps {
    onBack: () => void;
    initialValues?: {          // New Prop
        riskLevel: string;
        budget: number;
        description?: string;
    } | null;
    onGenerate: (proposal: any) => void; // Assuming we need this to pass data back
}

export const ProposalGenerator: React.FC<ProposalGeneratorProps> = ({ onBack, initialValues, onGenerate }) => {

    // 2. Modify State Initialization Logic
    // If initialValues exists, use it; otherwise use default
    const [riskLevel, setRiskLevel] = useState<string>(initialValues?.riskLevel || 'Medium');
    const [investmentAmount, setInvestmentAmount] = useState<number>(initialValues?.budget || 1000000);
    const [description, setDescription] = useState<string>(initialValues?.description || '');

    // (Optional) Listen for initialValues changes
    useEffect(() => {
        if (initialValues) {
            setRiskLevel(initialValues.riskLevel);
            setInvestmentAmount(initialValues.budget);
            if (initialValues.description) setDescription(initialValues.description);
        }
    }, [initialValues]);

    // ... (Rest of code - implemented as basic form)
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        setIsLoading(true);
        // Simulation of generation
        setTimeout(() => {
            setIsLoading(false);
            onGenerate({ riskLevel, investmentAmount, description });
        }, 1000);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800">AI Proposal Generator</h2>
                <button onClick={onBack} className="text-sm text-slate-500 hover:text-slate-700">Close</button>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700">Risk Level</label>
                    <select
                        value={riskLevel}
                        onChange={(e) => setRiskLevel(e.target.value)}
                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                    >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700">Investment Budget ($)</label>
                    <input
                        type="number"
                        value={investmentAmount}
                        onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700">Description / Goals</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                        placeholder="Describe the client's goals..."
                    />
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={onBack}
                        className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50"
                    >
                        {isLoading ? 'Generating...' : 'Generate Proposal'}
                    </button>
                </div>
            </div>
        </div>
    );
};
