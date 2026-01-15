import apiClient from './apiClient';

export const aiService = {
    /**
     * Sends a prompt to the AI agent to generate a deployment plan.
     * @param {string} prompt - The user's natural language request.
     * @returns {Promise<Object>} - The generated plan (DeploymentRequest).
     */
    generatePlan: async (prompt) => {
        const response = await apiClient.post('/ai/plan', { message: prompt });
        return response.data;
    },
};
