import styled from 'styled-components/macro';
import tw from 'twin.macro';

export default styled.div<{ $hoverable?: boolean }>`
    ${tw`flex no-underline text-neutral-200 items-center bg-transparent py-4 px-4 transition-colors duration-150 overflow-hidden rounded-none`};

    ${(props) => props.$hoverable !== false && tw`hover:text-neutral-100 hover:bg-neutral-600`};

    & .icon {
        ${tw`w-12 flex items-center justify-center font-mono text-xl`};
    }
`;
