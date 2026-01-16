import React, { useEffect, useState, useRef } from 'react';
import { Terminal, CheckCircle, XCircle, Loader2 } from 'lucide-react';

const DeploymentStatus = ({ deploymentId, onClose }) => {
    const [logs, setLogs] = useState([]);
    const [status, setStatus] = useState('pending');
    const logEndRef = useRef(null);

    useEffect(() => {
        if (!deploymentId) return;

        let isMounted = true;
        const controller = new AbortController();

        const streamLogs = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:8000/api/deploy/${deploymentId}/stream`, {
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
                                        // Optional: Close stream if backend doesn't
                                        // controller.abort(); 
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
                    // Auto-reconnect logic could go here (e.g., setTimeout(streamLogs, 3000))
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
                    <div className="text-zinc-600 italic">Connecting to live log stream...</div>
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
