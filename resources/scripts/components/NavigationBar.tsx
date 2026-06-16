import * as React from 'react';
import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import SearchContainer from '@/components/dashboard/search/SearchContainer';
import tw from 'twin.macro';
import styled from 'styled-components/macro';
import http from '@/api/http';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import { ServerContext } from '@/state/server';
import { SocketEvent } from '@/components/server/events';
import { bytesToString } from '@/lib/formatters';

const RightNavigation = styled.div`
    & > a,
    & > button,
    & > .navigation-link {
        ${tw`relative flex items-center h-full no-underline text-neutral-300 px-6 cursor-pointer transition-colors duration-250 whitespace-nowrap`};

        &:active,
        &:hover {
            ${tw`text-neutral-50 bg-neutral-700`};
        }

        &::after {
            content: '';
            ${tw`absolute bottom-0 left-0 w-full h-[2px] bg-neutral-50 origin-center transition-transform duration-250 ease-out`};
            transform: scaleX(0);
        }

        &:hover::after,
        &:active::after,
        &.active::after {
            transform: scaleX(1);
        }
    }
`;

const HostRamMonitor = () => {
    const hostRam = (window as any).SiteConfiguration?.host_ram;
    if (!hostRam || !hostRam.total) {
        return <span className="text-neutral-200 ml-1">N/A</span>;
    }
    return (
        <span className="text-neutral-200 ml-1">
            {bytesToString(hostRam.used)} / {bytesToString(hostRam.total)}
        </span>
    );
};

export default () => {
    const name = useStoreState((state: ApplicationStore) => state.settings.data!.name);
    const rootAdmin = useStoreState((state: ApplicationStore) => state.user.data!.rootAdmin);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const onTriggerLogout = () => {
        setIsLoggingOut(true);
        http.post('/auth/logout').finally(() => {
            // @ts-expect-error this is valid
            window.location = '/';
        });
    };

    const toggleTheme = () => {
        const isDark = document.body.classList.contains('dark');
        if (isDark) {
            document.body.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        } else {
            document.body.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        }
    };

    return (
        <div className={'w-full bg-transparent border-b border-neutral-600 overflow-x-auto'}>
            <SpinnerOverlay visible={isLoggingOut} />
            <div css={tw`mx-auto w-full flex items-center h-[3.5rem] max-w-[1200px]`}>
                <div id={'logo'} className={'flex-1'}>
                    <Link
                        to={'/'}
                        className={
                            'text-2xl font-header font-medium px-4 no-underline text-neutral-200 hover:text-neutral-100 transition-colors duration-150 whitespace-nowrap overflow-hidden text-ellipsis block'
                        }
                    >
                        {name}
                    </Link>
                </div>
                <RightNavigation className={'flex h-full items-center justify-center'}>
                    <SearchContainer />
                    <NavLink to={'/'} exact>
                        [ Dashboard ]
                    </NavLink>
                    {rootAdmin && (
                        <a href={'/admin'} rel={'noreferrer'}>
                            [ Admin ]
                        </a>
                    )}
                    <NavLink to={'/account'}>
                        [ Account ]
                    </NavLink>
                    <div className={'flex items-center px-6 text-neutral-400 font-mono text-sm whitespace-nowrap'}>
                        [ RAM: <HostRamMonitor /> ]
                    </div>
                    <button onClick={toggleTheme}>
                        [ Theme ]
                    </button>
                    <button onClick={onTriggerLogout}>
                        [ Logout ]
                    </button>
                </RightNavigation>
            </div>
        </div>
    );
};
