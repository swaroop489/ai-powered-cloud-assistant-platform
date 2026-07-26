import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import ChatBox from '../../components/Chat/ChatBox';
import DeploymentStatus from '../../components/Deployments/DeploymentStatus';
import DeploymentHistory from '../../components/Deployments/DeploymentHistory';
import { deployService } from '../../api/deployService';

const AgentConsole = () => {
    const [viewState, setViewState] = useState('chat'); // 'chat' | 'logs'
    const [deploymentId, setDeploymentId] = useState(null);
    const [deployError, setDeployError] = useState(null);

    const handlePlanApproved = async (plan) => {
        setDeployError(null);
        try {
            // 1. Start the deployment
            const response = await deployService.startDeployment(plan);

            setDeploymentId(response.deployment_id);

            setViewState('logs');
        } catch (error) {
            console.error("Deployment failed to start", error);
            const msg = error.response?.data?.detail || error.message || "Failed to start deployment.";
            setDeployError(msg);
        }
    };

    return (
        <div className="h-[calc(100vh-4rem)] p-6 bg-zinc-50/50">
            <div className="max-w-5xl mx-auto h-full grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Main Interface Area */}
                <div className="lg:col-span-2 h-full flex flex-col gap-4">
                    {deployError && (
                        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-3 shadow-sm animate-in fade-in slide-in-from-top-2">
                            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-sm">Deployment Blocked</h4>
                                <p className="text-sm mt-1">{deployError}</p>
                            </div>
                        </div>
                    )}
                    {viewState === 'chat' ? (
                        <ChatBox onPlanApproved={handlePlanApproved} />
                    ) : (
                        <DeploymentStatus
                            deploymentId={deploymentId}
                            onClose={() => setViewState('chat')}
                        />
                    )}
                </div>


                {/* Sidebar / Deployment History */}
                <div className="hidden lg:flex lg:flex-col h-full gap-4">
                    <div className="hidden lg:block bg-white border border-zinc-200 rounded-xl p-4 shadow-sm">
                        <h3 className="font-semibold text-zinc-900 mb-4">System Status</h3>
                        <div className="space-y-4">
                            <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-100">
                                <div className="text-xs text-zinc-500 uppercase font-medium">AWS Connection</div>
                                <div className="text-emerald-600 font-medium flex items-center gap-2">
                                    <span className="w-2 h-2 bg-emerald-500 rounded-full"></span> Active
                                </div>
                            </div>
                            <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-100">
                                <div className="text-xs text-zinc-500 uppercase font-medium">Terraform Version</div>
                                <div className="text-zinc-700 font-medium">v1.6.0</div>
                            </div>
                        </div>
                    </div>
                    <DeploymentHistory
                        selectedDeploymentId={deploymentId}
                        onSelectDeployment={(id) => {
                            setDeploymentId(id);
                            setViewState('logs');
                        }}
                    />
                </div>

            </div>
        </div>
    );
};

export default AgentConsole;
