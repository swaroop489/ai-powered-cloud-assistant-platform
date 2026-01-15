import React, { useEffect, useState } from 'react';
import { History, Server, Calendar, ChevronRight, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { deployService } from '../../api/deployService';

const DeploymentHistory = ({ onSelectDeployment, selectedDeploymentId }) => {
    const [deployments, setDeployments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const data = await deployService.getHistory();
            setDeployments(data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch history", err);
            // If 401, it might mean not logged in, but we handle that globally or via UI state
            setError("Could not load history");
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        if (!status) return <Loader2 className="w-3 h-3 text-amber-500" />;
        const s = status.toUpperCase();
        if (s === 'COMPLETED') return <CheckCircle className="w-3 h-3 text-emerald-500" />;
        if (s === 'FAILED') return <XCircle className="w-3 h-3 text-red-500" />;
        return <Loader2 className="w-3 h-3 text-amber-500 animate-spin" />;
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center text-zinc-400">
                <Loader2 className="w-5 h-5 animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex-1 min-h-0 flex flex-col bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
            <div className="px-4 py-3 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
                <div className="flex items-center gap-2 font-semibold text-zinc-700">
                    <History className="w-4 h-4" />
                    <h3>Deployment History</h3>
                </div>
                <button
                    onClick={fetchHistory}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                >
                    Refresh
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {deployments.length === 0 ? (
                    <div className="text-center py-8 text-zinc-400 text-sm">
                        <Server className="w-8 h-8 mx-auto mb-2 opacity-20" />
                        No deployments found.
                    </div>
                ) : (
                    deployments.map((dep) => (
                        <div
                            key={dep.deployment_id}
                            onClick={() => onSelectDeployment(dep.deployment_id)}
                            className={`
                                group px-3 py-3 rounded-lg border transition-all cursor-pointer hover:shadow-md
                                ${selectedDeploymentId === dep.deployment_id
                                    ? 'bg-indigo-50 border-indigo-200 shadow-sm'
                                    : 'bg-white border-zinc-100 hover:border-zinc-200'
                                }
                            `}
                        >
                            <div className="flex items-start justify-between mb-1">
                                <span className="font-medium text-sm text-zinc-800 truncate">
                                    {dep.project_name}
                                </span>
                                {getStatusIcon(dep.status)}
                            </div>

                            <div className="flex items-center gap-2 text-xs text-zinc-500 mb-2">
                                <span className="bg-zinc-100 px-1.5 py-0.5 rounded text-[10px] uppercase font-mono border border-zinc-200">
                                    {dep.deployment_id}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(dep.created_at).toLocaleDateString()}
                                </span>
                            </div>

                            <div className="flex items-center justify-between text-xs">
                                <span className="text-zinc-400 capitalize">{dep.region}</span>
                                <ChevronRight className={`w-3 h-3 text-zinc-300 transition-transform ${selectedDeploymentId === dep.deployment_id ? 'text-indigo-400 translate-x-1' : 'group-hover:translate-x-1'}`} />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default DeploymentHistory;
