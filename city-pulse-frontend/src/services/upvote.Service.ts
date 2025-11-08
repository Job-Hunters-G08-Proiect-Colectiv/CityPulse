import API_BASE_URL from '../config/api.ts';

export const upvoteService = {
    async toggleUpvote(reportId: number, token: string) {
        const response = await fetch(`${API_BASE_URL}/api/reports/${reportId}/upvote`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Please login to upvote.');
            }
            throw new Error('Failed to toggle upvote.');
        }

        return response.json();
    },

    async checkUpvoteStatus(reportId: number, token: string) {
        const response = await fetch(`${API_BASE_URL}/api/reports/${reportId}/upvote-status`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to check upvote status.');
        }

        return response.json();
    }
}