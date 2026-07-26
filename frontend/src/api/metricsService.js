import apiClient from './apiClient';

export const metricsService = {
    getGlobalMetrics: async () => {
        const response = await apiClient.get('/metrics');
        return response.data;
    }
};
