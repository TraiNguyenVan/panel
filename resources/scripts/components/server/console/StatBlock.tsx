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
            <div
                className={classNames('col-span-3 md:col-span-2 lg:col-span-6 flex items-center p-3 border transition-all cursor-pointer', className)}
                style={{
                    background: 'var(--color-neutral-800)',
                    borderColor: 'var(--color-neutral-700)',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'var(--color-neutral-700)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'var(--color-neutral-800)'; }}
            >
                <div className={'flex items-center mr-3 font-mono text-sm'} style={{ color: 'var(--color-neutral-500)' }}>
                    <Icon icon={icon} className="w-5 h-5" />
                </div>
                <div className={'flex flex-col justify-center overflow-hidden w-full'}>
                    <p className={'font-mono text-[10px] uppercase tracking-wider'} style={{ color: 'var(--color-neutral-400)' }}>{title}</p>
                    <div
                        ref={ref}
                        className={'font-mono text-sm truncate mt-0.5'}
                        style={{ fontSize, color: 'var(--color-neutral-200)' }}
                    >
                        {children}
                    </div>
                </div>
            </div>
        </CopyOnClick>
    );
};
