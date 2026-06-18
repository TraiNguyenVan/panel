import React, { useState, useEffect, useRef } from 'react';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import { getChatMessages, sendChatMessage, ChatMessage } from '../api/chat';

const formatTimestamp = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear();

    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (isToday) {
        return timeStr;
    }
    
    const dateStrFormatted = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    return `${dateStrFormatted}, ${timeStr}`;
};

export default () => {
    const currentUser = useStoreState((state: ApplicationStore) => state.user.data);
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [hasNewMessage, setHasNewMessage] = useState(false);
    const lastSeenIdRef = useRef<number | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const fetchMessages = async () => {
        try {
            const data = await getChatMessages();
            if (Array.isArray(data)) {
                setMessages(data);

                // Track notifications for new messages
                if (data.length > 0) {
                    const latestMsg = data[data.length - 1];
                    if (lastSeenIdRef.current !== null && latestMsg.id > lastSeenIdRef.current) {
                        // Only trigger the notification if the chat widget is closed
                        if (!isOpen) {
                            setHasNewMessage(true);
                        } else {
                            lastSeenIdRef.current = latestMsg.id;
                        }
                    } else if (lastSeenIdRef.current === null) {
                        lastSeenIdRef.current = latestMsg.id;
                    }
                }
            }
        } catch (err) {
            console.error('Failed to fetch chat messages:', err);
        }
    };

    // Poll messages dynamically every 3 seconds
    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);
    }, [isOpen]);

    // Auto scroll to latest message
    useEffect(() => {
        if (isOpen && containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = input.trim();
        if (!trimmed) return;

        setInput('');
        try {
            const data = await sendChatMessage(trimmed);
            setMessages((prev) => [...prev, data]);
            lastSeenIdRef.current = data.id;
        } catch (err) {
            console.error('Failed to send message:', err);
        }
    };

    const toggleChat = () => {
        setIsOpen((prev) => {
            const next = !prev;
            if (next && messages.length > 0) {
                lastSeenIdRef.current = messages[messages.length - 1].id;
                setHasNewMessage(false);
            }
            return next;
        });
    };

    if (!currentUser) return null;

    return (
        <div className='fixed bottom-4 right-4 z-[999] font-mono'>
            {/* Floating Chat Button */}
            <button
                onClick={toggleChat}
                className='relative flex items-center justify-center h-12 px-4 rounded-sm border border-neutral-600 bg-neutral-800 text-neutral-100 hover:bg-neutral-700 hover:text-neutral-50 transition-colors shadow-lg font-bold focus:outline-none cursor-pointer'
            >
                [ {isOpen ? 'Close' : 'Chat'} ]{/* Notification dot */}
                {hasNewMessage && !isOpen && (
                    <span className='absolute top-1 right-1 flex h-2 w-2'>
                        <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75'></span>
                        <span className='relative inline-flex rounded-full h-2 w-2 bg-red-500'></span>
                    </span>
                )}
            </button>

            {/* Chat Panel */}
            {isOpen && (
                <div className='absolute bottom-16 right-0 w-80 h-[26rem] border border-neutral-600 bg-neutral-800 rounded-sm shadow-2xl flex flex-col overflow-hidden'>
                    {/* Header */}
                    <div className='bg-neutral-700 border-b border-neutral-600 px-3 py-2 flex items-center justify-between font-bold text-neutral-200 text-sm'>
                        <span>[ Group Chat ]</span>
                        <button
                            onClick={toggleChat}
                            className='text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer focus:outline-none'
                        >
                            [ x ]
                        </button>
                    </div>

                    {/* Message list */}
                    <div ref={containerRef} className='flex-1 overflow-y-auto p-3 space-y-2 bg-neutral-900'>
                        {messages.length === 0 ? (
                            <p className='text-neutral-500 text-xs text-center pt-8'>No messages yet. Say hello!</p>
                        ) : (
                            messages.map((msg) => (
                                <div key={msg.id} className='text-xs break-all'>
                                    <div className='flex justify-between items-baseline mb-0.5'>
                                        <span className='font-bold text-neutral-200'>{msg.user.username}</span>
                                        <span className='text-[10px] text-neutral-400'>
                                            {formatTimestamp(msg.created_at)}
                                        </span>
                                    </div>
                                    <p className='text-neutral-300 leading-snug font-sans pl-1 border-l border-neutral-600'>
                                        {msg.message}
                                    </p>
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input box */}
                    <form
                        onSubmit={handleSend}
                        className='p-2 border-t border-neutral-600 bg-neutral-700 flex items-center space-x-1'
                    >
                        <input
                            type='text'
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder='Type a message...'
                            maxLength={1000}
                            className='flex-1 min-w-0 text-sm bg-neutral-800 border border-neutral-600 text-neutral-200 px-2 py-1 focus:outline-none focus:border-neutral-400 rounded-sm'
                        />
                        <button
                            type='submit'
                            className='text-neutral-200 bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 px-3 py-1 text-sm rounded-sm font-bold transition-colors cursor-pointer'
                        >
                            Send
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};
