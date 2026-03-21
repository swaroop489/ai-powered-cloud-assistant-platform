import apiClient from './apiClient';

export const aiService = {
    /**
     * Sends a prompt to the AI agent to generate a deployment plan.
     * @param {string} prompt - The user's natural language request.
     * @param {string} githubRepoUrl - Optional GitHub URL to clone.
     * @returns {Promise<Object>} - The generated plan (DeploymentRequest).
     */
    generatePlan: async (prompt, githubRepoUrl = "") => {
        const response = await apiClient.post('/ai/plan', { 
            message: prompt,
            github_repo_url: githubRepoUrl
        });
        return response.data;
    },
};
