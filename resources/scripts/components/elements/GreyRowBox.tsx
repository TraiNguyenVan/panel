import styled from 'styled-components/macro';
import tw from 'twin.macro';

export default styled.div<{ $hoverable?: boolean }>`
    ${tw`flex no-underline text-neutral-200 items-center bg-transparent py-2 border-b border-neutral-600 transition-colors duration-150 overflow-hidden rounded-none`};

    ${(props) => props.$hoverable !== false && tw`hover:bg-neutral-800`};

    & .icon {
        ${tw`w-16 flex items-center justify-center p-3 font-mono text-xl`};
    }
`;
