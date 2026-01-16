import React, { useEffect, useState, useRef } from 'react';
import { Terminal, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { deployService } from '../../api/deployService';

const DeploymentStatus = ({ deploymentId, onClose }) => {
    const [logs, setLogs] = useState([]);
    const [status, setStatus] = useState('pending');
    const [deploymentData, setDeploymentData] = useState(null);
    const logEndRef = useRef(null);

    useEffect(() => {
        if (!deploymentId) return;

        const fetchStatus = async () => {
            try {
                const data = await deployService.getDeploymentStatus(deploymentId);
                setDeploymentData(data);
                setStatus(data.status);
                if (data.logs) {
                    setLogs(typeof data.logs === 'string' ? data.logs.split('\n') : data.logs);
                }
            } catch (error) {
                console.error("Failed to poll deployment status", error);

                if (error.message.includes('Network Error') || error.response?.status === 404) {
                    setStatus('CONNECTION_LOST');
                    setLogs(prev => [...prev, `\n[SYSTEM] Connection with backend lost. Polling stopped.`]);
                } else {
                    setLogs(prev => [...prev, `[System Error] Unable to fetch deployment status.`]);
                }
            }
        };

        // Initial fetch
        fetchStatus();

        // Polling interval
        const intervalId = setInterval(fetchStatus, 2000);

        // Stop polling if completed, failed, or connection lost
        if (['COMPLETED', 'FAILED', 'CONNECTION_LOST'].includes(status)) {
            clearInterval(intervalId);
        }

        return () => clearInterval(intervalId);
    }, [deploymentId, status]);

    // Auto-scroll to bottom
    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    const getStatusColor = () => {
        switch (status) {
            case 'COMPLETED': return 'text-emerald-500';
            case 'FAILED': return 'text-red-500';
            case 'CONNECTION_LOST': return 'text-zinc-500';
            default: return 'text-amber-500';
        }
    };

    const getStatusIcon = () => {
        switch (status) {
            case 'COMPLETED': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
            case 'FAILED': return <XCircle className="w-5 h-5 text-red-500" />;
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
                <div className="flex items-center gap-2">
                    {getStatusIcon()}
                    <span className={`text-sm font-bold uppercase tracking-wider ${getStatusColor()}`}>
                        {status}
                    </span>
                </div>
            </div>

            {/* Log Output */}
            <div className="flex-1 p-4 overflow-y-auto space-y-1 text-sm scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-900">
                {logs.length === 0 && (
                    <div className="text-zinc-600 italic">Initializing deployment sequence...</div>
                )}
                {logs.map((log, index) => (
                    <div key={index} className="break-all whitespace-pre-wrap font-mono">
                        {log}
                    </div>
                ))}
                <div ref={logEndRef} />
            </div>
        </div>
    );
};

export default DeploymentStatus;
