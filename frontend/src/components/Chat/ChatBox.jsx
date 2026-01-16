import React, { useState } from 'react';
import { Send, Sparkles, Server, Check } from 'lucide-react';
import { aiService } from '../../api/aiService';
import PlanCard from './PlanCard';

const ChatBox = ({ onPlanApproved }) => {
    const [prompt, setPrompt] = useState('');
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!prompt.trim()) return;

        setLoading(true);
        setError(null);
        setPlan(null);

        try {
            const result = await aiService.generatePlan(prompt);
            setPlan(result);
        } catch (err) {
            setError("Failed to generate plan. Please try again.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = () => {
        if (plan && onPlanApproved) {
            onPlanApproved(plan);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="bg-zinc-50 px-4 py-3 border-b border-zinc-100 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold text-zinc-800">AI Infrastructure Architect</h3>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-4 overflow-y-auto bg-zinc-50/50">
                {!plan && !loading && (
                    <div className="text-center text-zinc-400 mt-10">
                        <Server className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>Describe your infrastructure needs...</p>
                    </div>
                )}

                {loading && (
                    <div className="space-y-3 animate-pulse">
                        <div className="h-4 bg-zinc-200 rounded w-3/4"></div>
                        <div className="h-4 bg-zinc-200 rounded w-1/2"></div>
                        <div className="h-20 bg-zinc-200 rounded w-full"></div>
                    </div>
                )}

                {error && (
                    <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
                        {error}
                    </div>
                )}

                {plan && (
                    <div className="flex justify-center animate-in fade-in slide-in-from-bottom-2">
                        <PlanCard
                            plan={plan}
                            onApprove={handleApprove}
                            onReject={() => setPlan(null)}
                        />
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white border-t border-zinc-100">
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <input
                        type="text"
                        className="flex-1 px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-zinc-400"
                        placeholder="E.g., Deploy an ECS cluster with 2 t3.micro instances..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={loading || !prompt.trim()}
                        className="px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatBox;
