import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import SearchContainer from '@/components/dashboard/search/SearchContainer';
import tw from 'twin.macro';
import styled, { css } from 'styled-components/macro';
import http from '@/api/http';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import { ServerContext } from '@/state/server';
import { SocketEvent } from '@/components/server/events';
import { slideDown, staggerRows } from '@/lib/animations';
import { applyTheme } from '@/lib/theme';
import { HostRamMonitor } from '@/features/host-monitor/components/HostRamMonitor';

const RightNavigation = styled.div`
    & > a,
    & > button,
    & > .navigation-link {
        ${tw`relative flex items-center h-full no-underline text-neutral-300 px-3 mx-1 cursor-pointer transition-colors duration-250 whitespace-nowrap`};

        &:active,
        &:hover {
            ${tw`text-neutral-100 bg-neutral-800`};
        }

        &::after {
            content: '';
            ${tw`absolute bottom-0 left-0 w-full h-[4px] bg-neutral-50 origin-center transition-transform duration-250 ease-out`};
            transform: scaleX(0);
        }

        &:active::after,
        &.active::after,
        &:hover::after {
            transform: scaleX(1);
        }
    }
`;

const parseInlineElements = (str: string): React.ReactNode[] => {
    if (!str) return [];

    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts: any[] = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(str)) !== null) {
        if (match.index > lastIndex) {
            parts.push({ type: 'text', content: str.substring(lastIndex, match.index) });
        }
        parts.push({ type: 'link', content: match[1], url: match[2] });
        lastIndex = linkRegex.lastIndex;
    }
    if (lastIndex < str.length) {
        parts.push({ type: 'text', content: str.substring(lastIndex) });
    }
    if (parts.length === 0) {
        parts.push({ type: 'text', content: str });
    }

    const parseInline = (s: string): React.ReactNode[] => {
        const codeRegex = /`([^`]+)`/g;
        const subParts: any[] = [];
        let index = 0;
        let subMatch;

        while ((subMatch = codeRegex.exec(s)) !== null) {
            if (subMatch.index > index) {
                subParts.push({ type: 'plain', content: s.substring(index, subMatch.index) });
            }
            subParts.push({ type: 'code', content: subMatch[1] });
            index = codeRegex.lastIndex;
        }
        if (index < s.length) {
            subParts.push({ type: 'plain', content: s.substring(index) });
        }
        if (subParts.length === 0) {
            subParts.push({ type: 'plain', content: s });
        }

        const boldParts: any[] = [];
        for (const part of subParts) {
            if (part.type === 'code') {
                boldParts.push(part);
                continue;
            }

            const boldRegex = /\*\*([^*]+)\*\*|__([^_]+)__/g;
            let boldIndex = 0;
            let boldMatch;
            while ((boldMatch = boldRegex.exec(part.content)) !== null) {
                if (boldMatch.index > boldIndex) {
                    boldParts.push({ type: 'plain', content: part.content.substring(boldIndex, boldMatch.index) });
                }
                const content = boldMatch[1] || boldMatch[2];
                boldParts.push({ type: 'bold', content });
                boldIndex = boldRegex.lastIndex;
            }
            if (boldIndex < part.content.length) {
                boldParts.push({ type: 'plain', content: part.content.substring(boldIndex) });
            }
        }

        const finalParts: any[] = [];
        for (const part of boldParts) {
            if (part.type === 'code' || part.type === 'bold') {
                finalParts.push(part);
                continue;
            }

            const italicRegex = /\*([^*]+)\*|_([^_]+)_/g;
            let italicIndex = 0;
            let italicMatch;
            while ((italicMatch = italicRegex.exec(part.content)) !== null) {
                if (italicMatch.index > italicIndex) {
                    finalParts.push({ type: 'plain', content: part.content.substring(italicIndex, italicMatch.index) });
                }
                const content = italicMatch[1] || italicMatch[2];
                finalParts.push({ type: 'italic', content });
                italicIndex = italicRegex.lastIndex;
            }
            if (italicIndex < part.content.length) {
                finalParts.push({ type: 'plain', content: part.content.substring(italicIndex) });
            }
        }

        return finalParts.map((part, i) => {
            switch (part.type) {
                case 'code':
                    return (
                        <code
                            key={i}
                            className='bg-neutral-800 text-yellow-500 px-1 py-0.5 rounded-sm text-xs font-mono border border-neutral-600'
                        >
                            {part.content}
                        </code>
                    );
                case 'bold':
                    return (
                        <strong key={i} className='font-bold text-neutral-100'>
                            {part.content}
                        </strong>
                    );
                case 'italic':
                    return (
                        <em key={i} className='italic text-neutral-300'>
                            {part.content}
                        </em>
                    );
                default:
                    return part.content;
            }
        });
    };

    return parts.map((part, i) => {
        if (part.type === 'link') {
            return (
                <a
                    key={i}
                    href={part.url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='underline text-neutral-100 hover:text-neutral-50 transition-colors font-bold'
                >
                    {part.content}
                </a>
            );
        }
        return <React.Fragment key={i}>{parseInline(part.content)}</React.Fragment>;
    });
};

const renderMarkdown = (text: string): React.ReactNode[] => {
    if (!text) return [];

    const lines = text.split('\n');

    return lines.map((line, lineIdx) => {
        const trimmed = line.trim();

        if (trimmed.startsWith('# ')) {
            return (
                <h1 key={lineIdx} className='text-lg font-bold text-neutral-100 mt-2 mb-1 block'>
                    {parseInlineElements(trimmed.substring(2))}
                </h1>
            );
        }
        if (trimmed.startsWith('## ')) {
            return (
                <h2 key={lineIdx} className='text-base font-bold text-neutral-100 mt-2 mb-1 block'>
                    {parseInlineElements(trimmed.substring(3))}
                </h2>
            );
        }
        if (trimmed.startsWith('### ')) {
            return (
                <h3 key={lineIdx} className='text-sm font-bold text-neutral-100 mt-1 mb-0.5 block'>
                    {parseInlineElements(trimmed.substring(4))}
                </h3>
            );
        }
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            return (
                <div key={lineIdx} className='pl-4 py-0.5 flex items-start space-x-2'>
                    <span className='text-neutral-400 mr-1.5'>•</span>
                    <span className='text-neutral-200'>{parseInlineElements(trimmed.substring(2))}</span>
                </div>
            );
        }

        return (
            <p key={lineIdx} className='min-h-[1rem] text-neutral-200 py-0.5'>
                {parseInlineElements(line)}
            </p>
        );
    });
};

const AnnouncementBanner = () => {
    const announcement = useStoreState((state: ApplicationStore) => state.settings.data?.announcement);
    const [visible, setVisible] = useState(true);

    if (!visible || !announcement) {
        return null;
    }

    return (
        <div className='w-full bg-neutral-700 border-b border-neutral-600 font-mono text-sm py-3 px-4'>
            <div className='mx-auto w-full max-w-[1200px] flex items-start justify-between'>
                <div className='flex items-start space-x-3 flex-1'>
                    <span className='text-yellow-500 font-bold mt-1.5'>[!]</span>
                    <div className='text-neutral-200 flex-1 whitespace-pre-wrap leading-relaxed'>
                        {renderMarkdown(announcement)}
                    </div>
                </div>
                <button
                    onClick={() => setVisible(false)}
                    className='text-neutral-400 hover:text-neutral-200 transition-colors ml-4 mt-1 cursor-pointer focus:outline-none'
                    aria-label='Dismiss announcement'
                >
                    [ x ]
                </button>
            </div>
        </div>
    );
};

export default () => {
    const name = useStoreState((state: ApplicationStore) => state.settings.data!.name);
    const rootAdmin = useStoreState((state: ApplicationStore) => state.user.data!.rootAdmin);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [activeAction, setActiveAction] = useState<string | null>(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();
    const mobileMenuRef = useRef<HTMLDivElement>(null);

    // Close mobile menu on navigation
    useEffect(() => {
        setMobileOpen(false);
    }, [location.pathname]);

    // Animate mobile menu open
    useEffect(() => {
        if (mobileOpen && mobileMenuRef.current) {
            slideDown(mobileMenuRef.current);
        }
    }, [mobileOpen]);

    const onTriggerLogout = () => {
        setActiveAction('logout');
        setIsLoggingOut(true);
        setTimeout(() => {
            http.post('/auth/logout').finally(() => {
                // @ts-expect-error this is valid
                window.location = '/';
            });
        }, 250);
    };

    const toggleTheme = () => {
        const isDark = document.body.classList.contains('dark');
        setActiveAction('theme');
        setTimeout(() => {
            localStorage.setItem('theme', !isDark ? 'dark' : 'light');
            applyTheme(!isDark, true);
            setActiveAction(null);
        }, 250);
    };

    const navigateToAdmin = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        setActiveAction('admin');
        setTimeout(() => {
            window.location.href = '/admin';
        }, 250);
    };

    return (
        <div className={'relative w-full bg-transparent'}>
            <AnnouncementBanner />
            <div className={'w-full border-b border-neutral-600 bg-transparent'}>
                <SpinnerOverlay visible={isLoggingOut} />
                {/* Desktop nav */}
                <div css={tw`mx-auto w-full flex items-center h-[3.5rem] max-w-[1200px]`}>
                    <div id={'logo'} className={'flex-1 min-w-0'}>
                        <Link
                            to={'/'}
                            className={
                                'text-2xl font-header font-medium px-4 no-underline text-neutral-200 hover:text-neutral-100 transition-colors duration-150 whitespace-nowrap overflow-hidden text-ellipsis block'
                            }
                        >
                            {name}
                        </Link>
                    </div>
                    {/* Hamburger — mobile only */}
                    <button
                        className={
                            'md:hidden flex items-center px-4 h-full text-neutral-400 hover:text-neutral-200 transition-colors'
                        }
                        onClick={() => setMobileOpen((o) => !o)}
                        aria-label={'Toggle menu'}
                    >
                        <span className={'font-mono text-sm'}>{mobileOpen ? '[ x ]' : '[ ≡ ]'}</span>
                    </button>
                    {/* Desktop links */}
                    <RightNavigation className={'hidden md:flex h-full items-center justify-center'}>
                        <SearchContainer />
                        <NavLink to={'/'} exact>
                            [ Dashboard ]
                        </NavLink>
                        <NavLink to={'/account'}>[ Account ]</NavLink>
                        <div
                            className={
                                'relative flex items-center h-full px-2 mx-1 text-neutral-300 font-mono text-sm whitespace-nowrap'
                            }
                        >
                            [ RAM: <HostRamMonitor /> ]
                        </div>
                        {rootAdmin && (
                            <a
                                href={'/admin'}
                                rel={'noreferrer'}
                                onClick={navigateToAdmin}
                                className={activeAction === 'admin' ? 'active' : ''}
                            >
                                [ Admin ]
                            </a>
                        )}
                        <button
                            onClick={toggleTheme}
                            className={`theme-toggle-btn ${activeAction === 'theme' ? 'active' : ''}`}
                        >
                            [ Theme ]
                        </button>
                        <button onClick={onTriggerLogout} className={activeAction === 'logout' ? 'active' : ''}>
                            [ Logout ]
                        </button>
                    </RightNavigation>
                </div>
                {/* Mobile dropdown menu */}
                {mobileOpen && (
                    <div
                        ref={mobileMenuRef}
                        className={'md:hidden border-t w-full'}
                        style={{
                            background: 'var(--color-neutral-900)',
                            borderColor: 'var(--color-neutral-700)',
                            willChange: 'transform, opacity',
                        }}
                    >
                        <div className={'flex flex-col px-4 py-2 space-y-1'}>
                            <SearchContainer />
                            <NavLink
                                exact
                                to={'/'}
                                className={
                                    'py-3 font-mono text-sm text-neutral-400 hover:text-neutral-100 border-b border-neutral-700 transition-colors'
                                }
                                activeClassName={'text-neutral-100'}
                            >
                                [ Dashboard ]
                            </NavLink>
                            <NavLink
                                to={'/account'}
                                className={
                                    'py-3 font-mono text-sm text-neutral-400 hover:text-neutral-100 border-b border-neutral-700 transition-colors'
                                }
                                activeClassName={'text-neutral-100'}
                            >
                                [ Account ]
                            </NavLink>
                            <div className={'py-3 font-mono text-sm text-neutral-300 border-b border-neutral-700'}>
                                [ RAM: <HostRamMonitor /> ]
                            </div>
                            {rootAdmin && (
                                <a
                                    href={'/admin'}
                                    rel={'noreferrer'}
                                    onClick={navigateToAdmin}
                                    className={
                                        'py-3 font-mono text-sm text-neutral-400 hover:text-neutral-100 border-b border-neutral-700 transition-colors'
                                    }
                                >
                                    [ Admin ]
                                </a>
                            )}
                            <button
                                onClick={toggleTheme}
                                className={
                                    'theme-toggle-btn py-3 text-left font-mono text-sm text-neutral-400 hover:text-neutral-100 border-b border-neutral-700 transition-colors'
                                }
                            >
                                [ Theme ]
                            </button>
                            <button
                                onClick={onTriggerLogout}
                                className={
                                    'py-3 text-left font-mono text-sm text-neutral-400 hover:text-neutral-100 transition-colors'
                                }
                            >
                                [ Logout ]
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
