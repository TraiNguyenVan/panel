import Icon from '@/components/elements/Icon';
import React, { memo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import tw from 'twin.macro';
import isEqual from 'react-fast-compare';

interface Props {
    icon?: IconProp;
    title: string | React.ReactNode;
    className?: string;
    children: React.ReactNode;
}

const TitledGreyBox = ({ icon, title, children, className }: Props) => (
    <div css={tw`bg-transparent`} className={className}>
        <div css={tw`py-2 mb-2`}>
            {typeof title === 'string' ? (
                <p css={tw`text-sm font-mono uppercase`}>
                    {icon && <Icon icon={icon} css={tw`mr-2 text-neutral-300`} />}
                    {title}
                </p>
            ) : (
                title
            )}
        </div>
        <div css={tw`py-3`}>{children}</div>
    </div>
);

export default memo(TitledGreyBox, isEqual);
