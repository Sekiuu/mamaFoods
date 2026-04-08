// Colors for order status tags
export const useStatusColor = () => {
    const statusColors: Record<string, string> = {
        "pending": 'bg-orange-500',
        "preparing": 'bg-yellow-500',
        "delivering": 'bg-blue-500',
        "completed": 'bg-green-500',
        "cancelled": 'bg-red-500',
        "confirmed": 'bg-purple-500',
    };
    return statusColors;
}