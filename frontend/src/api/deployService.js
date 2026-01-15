import apiClient from './apiClient';

export const deployService = {
    /**
     * Triggers the deployment of a specific plan.
     * @param {string} planId - The ID of the approved plan.
     * @returns {Promise<Object>} - The initial deployment status/ID.
     */
    startDeployment: async (plan) => {
        const response = await apiClient.post('/deploy/apply', plan);
        return response.data;
    },

    /**
     * Fetches the current status and logs of a deployment.
     * @param {string} id - The deployment ID.
     * @returns {Promise<Object>} - Status, logs, and metadata.
     */
    getDeploymentStatus: async (id) => {
        const response = await apiClient.get(`/deploy/${id}`);
        return response.data;
    }
};
