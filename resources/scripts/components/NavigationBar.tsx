import * as React from 'react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import SearchContainer from '@/components/dashboard/search/SearchContainer';
import tw, { theme } from 'twin.macro';
import styled from 'styled-components/macro';
import http from '@/api/http';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import Tooltip from '@/components/elements/tooltip/Tooltip';

const RightNavigation = styled.div`
    & > a,
    & > button,
    & > .navigation-link {
        ${tw`relative flex items-center h-full no-underline text-neutral-300 px-6 cursor-pointer transition-colors duration-250`};

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
                            'text-2xl font-header font-medium px-4 no-underline text-neutral-200 hover:text-neutral-100 transition-colors duration-150'
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
