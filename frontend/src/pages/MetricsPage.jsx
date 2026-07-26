import React from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import MetricsDashboard from '../components/Dashboard/MetricsDashboard';
import ProtectedRoute from '../components/Auth/ProtectedRoute';

const MetricsPage = () => {
    return (
        <ProtectedRoute>
            <DashboardLayout>
                <div className="h-full flex flex-col w-full overflow-y-auto bg-zinc-50/50">
                    <MetricsDashboard />
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
};

export default MetricsPage;
