import React from 'react';
import Icon from '@/components/elements/Icon';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames';
import styles from './style.module.css';
import useFitText from 'use-fit-text';
import CopyOnClick from '@/components/elements/CopyOnClick';

interface StatBlockProps {
    title: string;
    copyOnClick?: string;
    color?: string | undefined;
    icon: IconDefinition;
    children: React.ReactNode;
    className?: string;
}

export default ({ title, copyOnClick, icon, color, className, children }: StatBlockProps) => {
    const { fontSize, ref } = useFitText({ minFontSize: 8, maxFontSize: 500 });

    return (
        <CopyOnClick text={copyOnClick}>
            <div className={classNames('flex items-center py-2 bg-gradient-to-r from-transparent to-transparent border-b border-neutral-600 transition-all hover:from-neutral-800/60 cursor-pointer', className)}>
                <div className={'flex items-center text-neutral-400 mr-3 font-mono text-sm'}>
                    [ <Icon icon={icon} className="w-4 h-4 mx-2" /> ]
                </div>
                <div className={'flex flex-col justify-center overflow-hidden w-full'}>
                    <p className={'font-mono text-xs text-neutral-400 uppercase'}>{title}</p>
                    <div
                        ref={ref}
                        className={'font-mono text-sm text-neutral-200 truncate'}
                        style={{ fontSize }}
                    >
                        {children}
                    </div>
                </div>
            </div>
        </CopyOnClick>
    );
};
