import React from 'react';
import {
    Box,
    Server,
    Database,
    HardDrive,
    Globe,
    Shield,
    Cloud,
    Cpu,
    CheckCircle2,
    XCircle,
    DollarSign
} from 'lucide-react';

// --- Resource Icon Mapping ---
const getResourceIcon = (type) => {
    if (type.includes('s3')) return <HardDrive className="w-4 h-4 text-blue-500" />;
    if (type.includes('instance') || type.includes('ec2')) return <Server className="w-4 h-4 text-orange-500" />;
    if (type.includes('db') || type.includes('rds')) return <Database className="w-4 h-4 text-indigo-500" />;
    if (type.includes('vpc') || type.includes('subnet')) return <Cloud className="w-4 h-4 text-purple-500" />;
    if (type.includes('security')) return <Shield className="w-4 h-4 text-emerald-500" />;
    if (type.includes('lambda')) return <Cpu className="w-4 h-4 text-yellow-500" />;
    return <Box className="w-4 h-4 text-zinc-400" />;
};

// --- Mock Cost Estimation Logic ---
const estimateCost = (resources) => {
    let total = 0;
    resources.forEach(r => {
        if (r.type.includes('instance')) total += 25.00; // Mock EC2 cost
        if (r.type.includes('rds')) total += 45.00;      // Mock RDS cost
        if (r.type.includes('s3')) total += 5.00;        // Mock S3 cost
    });
    return total.toFixed(2);
};

const PlanCard = ({ plan, onApprove, onReject }) => {
    if (!plan) return null;

    // State to toggle raw JSON view
    const [showJson, setShowJson] = React.useState(false);

    const cost = estimateCost(plan.resources || []);
    const resourceCount = plan.resources?.length || 0;

    return (
        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow max-w-md w-full my-2">

            {/* Header */}
            <div className="px-4 py-3 bg-zinc-50 border-b border-zinc-100 flex items-center justify-between">
                <div>
                    <h3 className="font-semibold text-zinc-800 text-sm flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5 text-zinc-500" />
                        {plan.project_name || 'New Project'}
                    </h3>
                    <div className="text-xs text-zinc-500 flex items-center gap-2 mt-0.5">
                        <span className="uppercase font-mono bg-zinc-200 px-1.5 rounded-[3px] text-[10px] text-zinc-600">
                            {plan.region}
                        </span>
                        <span>•</span>
                        <span className="capitalize">{plan.environment} Environment</span>
                    </div>
                </div>
                <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-1 rounded text-xs font-medium border border-emerald-100">
                    <DollarSign className="w-3 h-3" />
                    {cost}/mo
                </div>
            </div>

            {/* Resources List */}
            <div className="p-4 space-y-3">
                <div className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">
                    Proposed Resources ({resourceCount})
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                    {plan.resources && plan.resources.map((res, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-2 rounded-lg border border-zinc-100 bg-zinc-50/50">
                            <div className="mt-0.5 p-1 bg-white rounded border border-zinc-100 shadow-sm">
                                {getResourceIcon(res.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-zinc-700 truncate">
                                    {res.name}
                                </div>
                                <div className="text-xs text-zinc-400 font-mono mt-0.5 truncate">
                                    {res.type}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* JSON Toggle */}
                <div className="pt-2">
                    <button
                        onClick={() => setShowJson(!showJson)}
                        className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                    >
                        {showJson ? 'Hide Raw Configuration' : 'View Raw Configuration'}
                    </button>

                    {showJson && (
                        <div className="mt-2 bg-zinc-900 text-zinc-100 p-3 rounded-md text-xs font-mono overflow-x-auto max-h-60">
                            <pre>{JSON.stringify(plan, null, 2)}</pre>
                        </div>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="p-3 bg-zinc-50 border-t border-zinc-100 grid grid-cols-2 gap-3">
                <button
                    onClick={onReject}
                    className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-zinc-600 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 hover:text-zinc-800 transition-colors"
                >
                    <XCircle className="w-4 h-4" />
                    Cancel
                </button>
                <button
                    onClick={() => onApprove(plan)}
                    className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                >
                    <CheckCircle2 className="w-4 h-4" />
                    Deploy Now
                </button>
            </div>

        </div>
    );
};

export default PlanCard;
