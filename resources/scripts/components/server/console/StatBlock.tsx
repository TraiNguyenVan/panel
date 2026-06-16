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
            <div className={classNames('col-span-3 md:col-span-2 lg:col-span-6 flex items-center p-3 bg-neutral-900/50 border border-neutral-700 transition-all hover:bg-neutral-800/60 cursor-pointer', className)}>
                <div className={'flex items-center text-neutral-500 mr-3 font-mono text-sm'}>
                    <Icon icon={icon} className="w-5 h-5" />
                </div>
                <div className={'flex flex-col justify-center overflow-hidden w-full'}>
                    <p className={'font-mono text-[10px] text-neutral-400 uppercase tracking-wider'}>{title}</p>
                    <div
                        ref={ref}
                        className={'font-mono text-sm text-neutral-200 truncate mt-0.5'}
                        style={{ fontSize }}
                    >
                        {children}
                    </div>
                </div>
            </div>
        </CopyOnClick>
    );
};
