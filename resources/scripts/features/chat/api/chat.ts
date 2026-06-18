import http from '@/api/http';

export interface ChatMessage {
    id: number;
    user_id: number;
    message: string;
    created_at: string;
    user: {
        id: number;
        username: string;
    };
}

export const getChatMessages = async (): Promise<ChatMessage[]> => {
    const { data } = await http.get('/api/client/chat');
    return data;
};

export const sendChatMessage = async (message: string): Promise<ChatMessage> => {
    const { data } = await http.post('/api/client/chat', { message });
    return data;
};
