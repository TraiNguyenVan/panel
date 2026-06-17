import styled from 'styled-components/macro';
import tw, { theme } from 'twin.macro';

const SubNavigation = styled.div`
    ${tw`w-full bg-transparent border-b border-neutral-600 overflow-x-auto`};

    & > div {
        ${tw`flex items-center text-sm mx-auto px-2`};
        max-width: 1200px;

        & > a,
        & > div {
            ${tw`relative inline-block py-3 px-4 text-neutral-400 dark:text-neutral-400 no-underline whitespace-nowrap transition-colors duration-150`};

            &:not(:first-of-type) {
                ${tw`ml-2`};
            }

            &:hover {
                ${tw`text-neutral-900 dark:text-neutral-100`};
            }

            &::after {
                content: '';
                ${tw`absolute bottom-0 left-0 w-full h-[3px] bg-neutral-900 dark:bg-neutral-100 origin-center transition-transform duration-150 ease-out`};
                transform: scaleX(0);
            }

            &:active,
            &.active {
                ${tw`text-neutral-900 dark:text-neutral-100`};

                &::after {
                    transform: scaleX(1);
                }
            }
        }
    }
`;

export default SubNavigation;
