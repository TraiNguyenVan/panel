import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import SearchContainer from '@/components/dashboard/search/SearchContainer';
import tw from 'twin.macro';
import styled, { keyframes, css } from 'styled-components/macro';
import http from '@/api/http';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import { ServerContext } from '@/state/server';
import { SocketEvent } from '@/components/server/events';
import { bytesToString } from '@/lib/formatters';
import { slideDown, staggerRows } from '@/lib/animations';

const RightNavigation = styled.div`
    & > a,
    & > button,
    & > .navigation-link {
        ${tw`relative flex items-center h-full no-underline text-neutral-900 dark:text-neutral-300 px-3 mx-1 cursor-pointer transition-colors duration-250 whitespace-nowrap`};

        &:active,
        &:hover {
            ${tw`text-neutral-100 dark:text-neutral-50 bg-neutral-800 dark:bg-neutral-700`};
        }

        &::after {
            content: '';
            ${tw`absolute bottom-0 left-0 w-full h-[4px] bg-neutral-900 dark:bg-neutral-50 origin-center transition-transform duration-250 ease-out`};
            transform: scaleX(0);
        }

        &:active::after,
        &.active::after {
            transform: scaleX(1);
        }
    }
`;

const doubleFlashLight = keyframes`
  0%, 100% { 
    opacity: 1; 
    box-shadow: 0 0 16px 4px rgba(0, 0, 0, 0.8); 
    background-color: #000000; 
  }
  50% { 
    opacity: 0.1; 
    box-shadow: 0 0 2px 0px rgba(0, 0, 0, 0.1); 
    background-color: #a1a1aa; 
  }
`;

const doubleFlashDark = keyframes`
  0%, 100% { 
    opacity: 1; 
    box-shadow: 0 0 16px 4px rgba(255, 255, 255, 0.9); 
    background-color: #ffffff; 
  }
  50% { 
    opacity: 0.2; 
    box-shadow: 0 0 4px 0px rgba(255, 255, 255, 0.2); 
    background-color: #a1a1aa; 
  }
`;

const dimRetractLight = keyframes`
  0%, 100% { opacity: 1; }
  50% { 
    opacity: 0.1; 
    background-color: #e4e4e7; 
  }
`;

const dimRetractDark = keyframes`
  0%, 100% { opacity: 1; }
  50% { 
    opacity: 0.1; 
    background-color: #3f3f46; 
  }
`;

const RamLine = styled.div<{ $state: 'idle' | 'increasing' | 'decreasing' }>`
  ${tw`absolute bottom-0 left-0 h-[4px] bg-neutral-900 dark:bg-neutral-50 transition-all duration-1000 ease-out`}
  
  ${props => props.$state === 'increasing' && css`
    animation: ${doubleFlashLight} 0.6s ease-in-out 2;
    .dark & {
      animation: ${doubleFlashDark} 0.6s ease-in-out 2;
    }
  `}
  ${props => props.$state === 'decreasing' && css`
    animation: ${dimRetractLight} 0.6s ease-in-out 2;
    .dark & {
      animation: ${dimRetractDark} 0.6s ease-in-out 2;
    }
  `}
`;

const useAnimatedValue = (value: number, duration = 2500) => {
    const [current, setCurrent] = useState(value);
    
    useEffect(() => {
        let startTimestamp: number;
        const startValue = current;
        const diff = value - startValue;

        if (diff === 0) return;

        let frameId: number;

        const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            
            // Linear easing for continuous rolling
            const easeProgress = progress;

            setCurrent(startValue + diff * easeProgress);

            if (progress < 1) {
                frameId = window.requestAnimationFrame(step);
            } else {
                setCurrent(value);
            }
        };

        frameId = window.requestAnimationFrame(step);

        return () => window.cancelAnimationFrame(frameId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, duration]);

    return current;
};

const HostRamMonitor = () => {
    const [percentage, setPercentage] = useState(0);
    const [flashState, setFlashState] = useState<'idle' | 'increasing' | 'decreasing'>('idle');
    const [displayRam, setDisplayRam] = useState<{ used: number, total: number, top_processes?: { name: string, ram_bytes: number }[] }>({ used: 0, total: 0 });

    useEffect(() => {
        const fetchRam = async () => {
            try {
                const { data } = await http.get('/api/client/host-ram');
                if (data && data.total) {
                    setDisplayRam({ used: data.used, total: data.total, top_processes: data.top_processes });
                }
            } catch (err) {
                // Ignore
            }
        };

        const interval = setInterval(fetchRam, 2500);
        
        const initRam = (window as any).SiteConfiguration?.host_ram;
        if (initRam && initRam.total) {
            setDisplayRam({ used: initRam.used, total: initRam.total, top_processes: initRam.top_processes });
        }
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (displayRam.total > 0) {
            const targetPercentage = Math.min(100, Math.max(0, (displayRam.used / displayRam.total) * 100));
            const delta = targetPercentage - percentage;
            
            if (percentage > 0 && Math.abs(delta) >= 1.5) { 
                if (delta > 0) {
                    setFlashState('increasing');
                } else {
                    setFlashState('decreasing');
                }
                setTimeout(() => setFlashState('idle'), 1200);
            }
            
            if (percentage === 0) {
                setTimeout(() => setPercentage(targetPercentage), 100);
            } else {
                setPercentage(targetPercentage);
            }
        }
    }, [displayRam.used, displayRam.total]);

    const animatedUsed = useAnimatedValue(displayRam.used);

    if (!displayRam.total) {
        return <span className="text-neutral-200 ml-1">N/A</span>;
    }
    
    return (
        <div className="group h-full flex items-center cursor-default">
            <span className="text-neutral-200 ml-1 inline-block text-left relative z-10" style={{ width: '180px', fontVariantNumeric: 'tabular-nums' }}>
                {bytesToString(animatedUsed)} / {bytesToString(displayRam.total)}
            </span>
            <div className="absolute bottom-0 left-0 w-full h-[4px] bg-neutral-300 dark:bg-neutral-700" />
            <RamLine 
                $state={flashState}
                style={{ width: `${percentage}%` }}
            />
            {displayRam.top_processes && displayRam.top_processes.length > 0 && (
                <div className="absolute top-[calc(100%+0px)] right-0 w-72 bg-white dark:bg-neutral-700 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="px-4 py-3 bg-neutral-100 dark:bg-neutral-800 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                        Top Host Memory Processes
                    </div>
                    <div className="flex flex-col py-2">
                        {displayRam.top_processes.map((proc, i) => (
                            <div key={i} className="flex justify-between items-center px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-600 transition-colors">
                                <span className="font-mono text-sm text-neutral-800 dark:text-neutral-200 truncate pr-4">{proc.name}</span>
                                <span className="font-mono text-sm text-neutral-600 dark:text-neutral-300 whitespace-nowrap">{bytesToString(proc.ram_bytes)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
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
        setActiveAction('theme');
        setTimeout(() => {
            const isDark = document.body.classList.contains('dark');
            if (isDark) {
                document.body.classList.remove('dark');
                localStorage.setItem('theme', 'light');
            } else {
                document.body.classList.add('dark');
                localStorage.setItem('theme', 'dark');
            }
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
        <div className={'relative w-full bg-transparent border-b border-neutral-600'}>
            <SpinnerOverlay visible={isLoggingOut} />
            {/* Desktop nav */}
            <div css={tw`mx-auto w-full flex items-center h-[3.5rem] max-w-[1200px]`}>
                <div id={'logo'} className={'flex-1 min-w-0'}>
                    <Link
                        to={'/'}
                        className={
                            'text-2xl font-header font-medium px-4 no-underline text-neutral-800 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors duration-150 whitespace-nowrap overflow-hidden text-ellipsis block'
                        }
                    >
                        {name}
                    </Link>
                </div>
                {/* Hamburger — mobile only */}
                <button
                    className={'md:hidden flex items-center px-4 h-full text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors'}
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
                    <NavLink to={'/account'}>
                        [ Account ]
                    </NavLink>
                    <div className={'relative flex items-center h-full px-2 mx-1 text-neutral-500 dark:text-neutral-400 font-mono text-sm whitespace-nowrap'}>
                        [ RAM: <HostRamMonitor /> ]
                    </div>
                    {rootAdmin && (
                        <a href={'/admin'} rel={'noreferrer'} onClick={navigateToAdmin} className={activeAction === 'admin' ? 'active' : ''}>
                            [ Admin ]
                        </a>
                    )}
                    <button onClick={toggleTheme} className={activeAction === 'theme' ? 'active' : ''}>
                        [ Theme ]
                    </button>
                    <button onClick={onTriggerLogout} className={activeAction === 'logout' ? 'active' : ''}>
                        [ Logout ]
                    </button>
                </RightNavigation>
            </div>
            {/* Mobile dropdown menu */}
            {mobileOpen && (
                <div ref={mobileMenuRef} className={'md:hidden border-t w-full'} style={{ background: 'var(--color-neutral-900)', borderColor: 'var(--color-neutral-700)', willChange: 'transform, opacity' }}>
                    <div className={'flex flex-col px-4 py-2 space-y-1'}>
                        <SearchContainer />
                        <NavLink
                            exact
                            to={'/'}
                            className={'py-3 font-mono text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 border-b border-neutral-100 dark:border-neutral-800 transition-colors'}
                            activeClassName={'text-neutral-900 dark:text-neutral-100'}
                        >
                            [ Dashboard ]
                        </NavLink>
                        <NavLink
                            to={'/account'}
                            className={'py-3 font-mono text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 border-b border-neutral-100 dark:border-neutral-800 transition-colors'}
                            activeClassName={'text-neutral-900 dark:text-neutral-100'}
                        >
                            [ Account ]
                        </NavLink>
                        <div className={'py-3 font-mono text-sm text-neutral-500 dark:text-neutral-400 border-b border-neutral-100 dark:border-neutral-800'}>
                            [ RAM: <HostRamMonitor /> ]
                        </div>
                        {rootAdmin && (
                            <a
                                href={'/admin'}
                                rel={'noreferrer'}
                                onClick={navigateToAdmin}
                                className={'py-3 font-mono text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 border-b border-neutral-100 dark:border-neutral-800 transition-colors'}
                            >
                                [ Admin ]
                            </a>
                        )}
                        <button
                            onClick={toggleTheme}
                            className={'py-3 text-left font-mono text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 border-b border-neutral-100 dark:border-neutral-800 transition-colors'}
                        >
                            [ Theme ]
                        </button>
                        <button
                            onClick={onTriggerLogout}
                            className={'py-3 text-left font-mono text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors'}
                        >
                            [ Logout ]
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
