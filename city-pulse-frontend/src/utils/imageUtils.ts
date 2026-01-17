const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const getImageUrl = (imagePath: string): string => {
    if (!imagePath) return '';

    // If it's already a full URL, return as is
    if (imagePath.startsWith('http')) {
        return imagePath;
    }

    // Otherwise, construct full URL
    return `${API_BASE_URL}${imagePath}`;
};