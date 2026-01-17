import React, { useEffect, useState } from 'react';
import { History, Server, Clock, AlertCircle, CheckCircle, Trash2, Loader2, ChevronRight } from 'lucide-react';
import { deployService } from '../../api/deployService';
import ConfirmationModal from '../Common/ConfirmationModal';

const DeploymentHistory = ({ onSelectDeployment, selectedDeploymentId }) => {
    const [deployments, setDeployments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalConfig, setModalConfig] = useState({ isOpen: false });

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
            setError("Could not load history");
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        if (!status) return <Loader2 className="w-3 h-3 text-amber-500" />;
        const s = status.toUpperCase();
        if (s === 'COMPLETED') return <CheckCircle className="w-3 h-3 text-emerald-500" />;
        if (s === 'FAILED') return <XCircle className="w-3 h-3 text-red-500" />;
        if (s === 'DESTROYING') return <Loader2 className="w-3 h-3 text-orange-500 animate-spin" />;
        if (s === 'DESTROYED') return <Trash2 className="w-3 h-3 text-zinc-400" />;
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
                    deployments.map((deploy) => (
                        <div
                            key={deploy.deployment_id}
                            onClick={() => onSelectDeployment(deploy.deployment_id)}
                            className={`
                                group px-3 py-3 rounded-lg border transition-all cursor-pointer hover:shadow-md
                                ${selectedDeploymentId === deploy.deployment_id
                                    ? 'bg-indigo-50 border-indigo-200 shadow-sm'
                                    : 'bg-white border-zinc-100 hover:border-zinc-200'
                                }
                            `}
                        >
                            <div className="flex items-center gap-1">
                                <div className="flex-1 min-w-0" onClick={() => onSelectDeployment(deploy.deployment_id)}>
                                    <div className="flex items-center justify-between mb-1">
                                        <h4 className="font-medium text-zinc-900 truncate pr-2">{deploy.project_name}</h4>
                                        {getStatusIcon(deploy.status)}
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-zinc-500">
                                        <span className="flex items-center gap-1 font-mono">
                                            #{deploy.deployment_id.substring(0, 6)}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {new Date(deploy.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                {deploy.status !== 'DESTROYED' && deploy.status !== 'DESTROYING' && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setModalConfig({
                                                isOpen: true,
                                                title: "Destroy Deployment?",
                                                message: "WARNING: This will permanently DESTROY all cloud resources associated with this deployment. This action cannot be undone.",
                                                isDangerous: true,
                                                confirmText: "Destroy Resources",
                                                onConfirm: () => {
                                                    deployService.destroyDeployment(deploy.deployment_id)
                                                        .then(() => {
                                                            fetchHistory(); // Refresh status icon
                                                            onSelectDeployment(deploy.deployment_id);
                                                        })
                                                        .catch(err => {
                                                            console.error(err);
                                                            alert("Failed to destroy deployment. Check console for details.");
                                                        });
                                                }
                                            });
                                        }}
                                        className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                        title="Destroy Resources"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            <div className="flex items-center justify-between text-xs mt-2">
                                <span className="text-zinc-400 capitalize">{deploy.region}</span>
                                <ChevronRight className={`w-3 h-3 text-zinc-300 transition-transform ${selectedDeploymentId === deploy.deployment_id ? 'text-indigo-400 translate-x-1' : 'group-hover:translate-x-1'}`} />
                            </div>
                        </div>
                    ))
                )}
            </div>

            <ConfirmationModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                title={modalConfig.title}
                message={modalConfig.message}
                onConfirm={modalConfig.onConfirm}
                confirmText={modalConfig.confirmText}
                isDangerous={modalConfig.isDangerous}
            />
        </div>
    );
};

export default DeploymentHistory;
