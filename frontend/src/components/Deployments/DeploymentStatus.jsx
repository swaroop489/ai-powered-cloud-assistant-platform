import React, { useEffect, useState, useRef } from 'react';
import { Terminal, CheckCircle, XCircle, Loader2, Trash2, AlertTriangle, ExternalLink } from 'lucide-react';
import { deployService } from '../../api/deployService';

const DeploymentStatus = ({ deploymentId, onClose }) => {
    const [logs, setLogs] = useState([]);
    const [status, setStatus] = useState('pending');
    const [activeTab, setActiveTab] = useState('logs');
    const [outputs, setOutputs] = useState(null);
    const logEndRef = useRef(null);

    useEffect(() => {
        if (['COMPLETED', 'DRIFT_DETECTED'].includes(status) && deploymentId) {
            deployService.getDeploymentStatus(deploymentId).then(data => {
                if (data.terraform_outputs && Object.keys(data.terraform_outputs).length > 0) {
                    setOutputs(data.terraform_outputs);
                }
            }).catch(err => console.error("Failed to fetch outputs", err));
        }
    }, [status, deploymentId]);

    useEffect(() => {
        if (!deploymentId) return;

        let isMounted = true;
        const controller = new AbortController();

        const streamLogs = async () => {
            try {
                const token = localStorage.getItem('token');
                const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
                const response = await fetch(`${backendUrl}/api/deploy/${deploymentId}/stream`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'text/event-stream',
                    },
                    signal: controller.signal,
                });

                if (!response.ok) {
                    throw new Error(`Connection failed: ${response.status}`);
                }

                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let buffer = '';

                while (isMounted) {
                    const { value, done } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    buffer += chunk;

                    // Process complete blocks (SSE events end with \n\n)
                    const parts = buffer.split('\n\n');
                    buffer = parts.pop(); // Keep incomplete part in buffer

                    for (const part of parts) {
                        if (part.startsWith('data: ')) {
                            const jsonStr = part.replace('data: ', '').trim();
                            if (!jsonStr) continue;

                            try {
                                const data = JSON.parse(jsonStr);
                                if (data.log) {
                                    setLogs(prev => [...prev, data.log]);
                                } else if (data.status) {
                                    setStatus(data.status);
                                    if (['COMPLETED', 'FAILED'].includes(data.status)) {
                                    }
                                }
                            } catch (e) {
                                console.warn("Failed to parse SSE data", e);
                            }
                        }
                    }
                }

            } catch (error) {
                if (error.name !== 'AbortError' && isMounted) {
                    console.error("Stream error", error);
                    setStatus('CONNECTION_LOST');
                    setLogs(prev => [...prev, `\n[SYSTEM] Connection lost. Reconnecting...`]);
                }
            }
        };

        streamLogs();

        return () => {
            isMounted = false;
            controller.abort();
        };
    }, [deploymentId]);

    // Auto-scroll to bottom
    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    const handleDestroy = async () => {
        try {
            const token = localStorage.getItem('token');
            const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
            await fetch(`${backendUrl}/api/deploy/${deploymentId}/destroy`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        } catch (e) {
            console.error("Manual rollback failed", e);
        }
    };

    const handleReconcile = async () => {
        try {
            const token = localStorage.getItem('token');
            const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
            setLogs(prev => [...prev, `\n[SYSTEM] Initiating Drift Reconciliation...`]);
            setStatus('RECONCILING');
            await fetch(`${backendUrl}/api/deploy/${deploymentId}/reconcile`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        } catch (e) {
            console.error("Reconcile failed", e);
            setLogs(prev => [...prev, `\n[SYSTEM] Reconciliation Failed: ${e.message}`]);
        }
    };

    const getStatusColor = () => {
        switch (status) {
            case 'COMPLETED': return 'text-emerald-500';
            case 'FAILED': return 'text-red-500';
            case 'DRIFT_DETECTED': return 'text-red-600 animate-pulse font-bold';
            case 'DESTROYING': return 'text-orange-500';
            case 'DESTROYED': return 'text-zinc-400 line-through';
            case 'ROLLING_BACK': return 'text-orange-500';
            case 'RECONCILING': return 'text-blue-500';
            case 'ROLLBACK_COMPLETE': return 'text-zinc-400 line-through';
            case 'ROLLBACK_FAILED': return 'text-red-500';
            case 'CONNECTION_LOST': return 'text-zinc-500';
            default: return 'text-amber-500';
        }
    };

    const getStatusIcon = () => {
        switch (status) {
            case 'COMPLETED': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
            case 'FAILED': return <XCircle className="w-5 h-5 text-red-500" />;
            case 'DRIFT_DETECTED': return <AlertTriangle className="w-5 h-5 text-red-600 animate-pulse" />;
            case 'DESTROYING': return <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />;
            case 'DESTROYED': return <Trash2 className="w-5 h-5 text-zinc-400" />;
            case 'ROLLING_BACK': return <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />;
            case 'RECONCILING': return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
            case 'ROLLBACK_COMPLETE': return <Trash2 className="w-5 h-5 text-zinc-400" />;
            case 'ROLLBACK_FAILED': return <XCircle className="w-5 h-5 text-red-500" />;
            case 'CONNECTION_LOST': return <XCircle className="w-5 h-5 text-zinc-500" />;
            default: return <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />;
        }
    };

    return (
        <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 rounded-xl overflow-hidden shadow-xl border border-zinc-800 font-mono">
            {/* Header */}
            <div className="bg-zinc-900/50 px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-zinc-800 rounded-md transition-colors text-zinc-400 hover:text-white mr-2"
                        title="Back to Chat (Stop Monitoring)"
                    >
                        <XCircle className="w-4 h-4" />
                    </button>
                    <Terminal className="w-4 h-4 text-zinc-400" />
                    <span className="text-sm font-medium text-zinc-300">Deployment Console</span>
                    <span className="text-xs text-zinc-500">ID: {deploymentId}</span>
                </div>
                <div className="flex items-center gap-4">
                    {status === 'DRIFT_DETECTED' && (
                        <button
                            onClick={handleReconcile}
                            className="text-xs px-3 py-1.5 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20 rounded transition-colors flex items-center gap-1 font-sans"
                        >
                            <AlertTriangle className="w-3 h-3" />
                            Reconcile Drift
                        </button>
                    )}
                    {['FAILED', 'ROLLBACK_FAILED', 'COMPLETED', 'DRIFT_DETECTED'].includes(status) && (
                        <button
                            onClick={handleDestroy}
                            className="text-xs px-3 py-1.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 rounded transition-colors flex items-center gap-1 font-sans"
                        >
                            <Trash2 className="w-3 h-3" />
                            {['COMPLETED', 'DRIFT_DETECTED'].includes(status) ? 'Tear Down' : 'Manual Rollback'}
                        </button>
                    )}
                    <div className="flex items-center gap-2">
                        {getStatusIcon()}
                        <span className={`text-sm font-bold uppercase tracking-wider ${getStatusColor()}`}>
                            {status}
                        </span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-zinc-900 border-b border-zinc-800 flex items-center px-4">
                <button
                    onClick={() => setActiveTab('logs')}
                    className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'logs' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
                >
                    Terminal Logs
                </button>
                {outputs && (
                    <button
                        onClick={() => setActiveTab('outputs')}
                        className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'outputs' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-zinc-500 hover:text-zinc-300 flex items-center gap-2'}`}
                    >
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Live Outputs
                    </button>
                )}
            </div>

            {/* Body */}
            {activeTab === 'logs' ? (
                <div className="flex-1 p-4 overflow-y-auto space-y-1 text-sm scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-900">
                    {logs.length === 0 && (
                        <div className="text-zinc-600 italic">Connecting to live log stream...</div>
                    )}
                    {logs.map((log, index) => (
                        <div key={index} className="break-all whitespace-pre-wrap font-mono">
                            {log}
                        </div>
                    ))}
                    <div ref={logEndRef} />
                </div>
            ) : (
                <div className="flex-1 p-6 overflow-y-auto bg-zinc-950">
                    <h3 className="text-zinc-300 font-medium mb-4 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        Provisioned Resources
                    </h3>
                    <div className="space-y-4">
                        {Object.entries(outputs || {}).map(([key, val]) => (
                            <div key={key} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 transition-all hover:border-zinc-700">
                                <p className="text-zinc-500 text-xs uppercase font-bold tracking-wider mb-2">{key.replace(/_/g, ' ')}</p>
                                <div className="flex items-center justify-between">
                                    <code className="text-emerald-400 font-mono text-sm break-all">{val.value}</code>
                                    {val.value && val.value.toString().startsWith('http') && (
                                        <a 
                                            href={val.value} 
                                            target="_blank" 
                                            rel="noreferrer" 
                                            className="ml-4 text-indigo-400 hover:text-indigo-300 p-2 bg-indigo-500/10 rounded-md transition-colors flex-shrink-0"
                                            title="Open Link"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeploymentStatus;
