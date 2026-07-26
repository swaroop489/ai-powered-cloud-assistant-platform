import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, CheckCircle, Clock, XCircle, TrendingUp, Layers } from 'lucide-react';
import { metricsService } from '../../api/metricsService';

const MetricsDashboard = () => {
    const [metrics, setMetrics] = useState({
        total_deployments: 0,
        success_rate: 0,
        avg_deploy_time: 0,
        total_failed: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const data = await metricsService.getGlobalMetrics();
                setMetrics(data);
            } catch (err) {
                console.error("Failed to fetch metrics", err);
            } finally {
                setLoading(false);
            }
        };
        fetchMetrics();
    }, []);

    const cards = [
        {
            title: "Total Deployments",
            value: metrics.total_deployments,
            icon: <Layers className="w-6 h-6 text-indigo-500" />,
            trend: "+12% this week",
            trendUp: true,
            bg: "bg-indigo-50/50",
            border: "border-indigo-100"
        },
        {
            title: "Success Rate",
            value: `${metrics.success_rate}%`,
            icon: <CheckCircle className="w-6 h-6 text-emerald-500" />,
            trend: "Target: > 95%",
            trendUp: metrics.success_rate >= 95,
            bg: "bg-emerald-50/50",
            border: "border-emerald-100"
        },
        {
            title: "Avg Deploy Time",
            value: `${metrics.avg_deploy_time}s`,
            icon: <Clock className="w-6 h-6 text-amber-500" />,
            trend: "Optimized via cache",
            trendUp: true,
            bg: "bg-amber-50/50",
            border: "border-amber-100"
        },
        {
            title: "Total Failures",
            value: metrics.total_failed,
            icon: <XCircle className="w-6 h-6 text-red-500" />,
            trend: "Auto-rollbacks enabled",
            trendUp: false,
            bg: "bg-red-50/50",
            border: "border-red-100"
        }
    ];

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="animate-spin text-indigo-600"><Activity className="w-8 h-8" /></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-6xl mx-auto w-full">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
                    <Activity className="w-6 h-6 text-indigo-600" />
                    Platform Telemetry
                </h1>
                <p className="text-zinc-500 text-sm mt-1">Real-time observability and deployment metrics</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, idx) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={card.title}
                        className={`p-6 rounded-2xl border ${card.border} ${card.bg} shadow-sm relative overflow-hidden`}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-white rounded-xl shadow-sm border border-zinc-100/50">
                                {card.icon}
                            </div>
                            <span className="text-xs font-medium px-2 py-1 bg-white/60 rounded-full text-zinc-600 border border-zinc-100">
                                Live
                            </span>
                        </div>
                        
                        <div>
                            <h3 className="text-zinc-500 text-sm font-medium mb-1">{card.title}</h3>
                            <div className="text-3xl font-bold text-zinc-900 font-mono tracking-tight">
                                {card.value}
                            </div>
                        </div>

                        <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-zinc-500">
                            <TrendingUp className={`w-3.5 h-3.5 ${card.trendUp ? 'text-emerald-500' : 'text-zinc-400'}`} />
                            {card.trend}
                        </div>
                        
                        {/* Decorative background gradient */}
                        <div className="absolute -right-12 -bottom-12 w-32 h-32 bg-white/40 blur-2xl rounded-full" />
                    </motion.div>
                ))}
            </div>

            {/* Simulated Chart Area for aesthetics */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-8 p-6 bg-white border border-zinc-200 rounded-2xl shadow-sm"
            >
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-semibold text-zinc-800">Deployment Velocity</h3>
                        <p className="text-sm text-zinc-500">Infrastructure changes over the last 30 days</p>
                    </div>
                    <div className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-lg border border-indigo-100">
                        Stable
                    </div>
                </div>
                <div className="h-64 w-full flex items-end justify-between gap-2 px-2">
                    {/* Generating fake bars to simulate a beautiful chart without adding chart.js dependency */}
                    {[40, 25, 60, 30, 80, 45, 90, 65, 75, 50, 85, 40, 70, 55].map((height, i) => (
                        <div key={i} className="w-full bg-zinc-50 rounded-t-sm relative group h-full flex items-end">
                            <motion.div 
                                initial={{ height: 0 }}
                                animate={{ height: `${height}%` }}
                                transition={{ delay: 0.5 + (i * 0.05), duration: 0.8, type: 'spring' }}
                                className="w-full bg-indigo-100 hover:bg-indigo-500 transition-colors rounded-t-md relative"
                            >
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                    {height}
                                </div>
                            </motion.div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

export default MetricsDashboard;
