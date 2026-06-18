import { ExclamationIcon, ShieldExclamationIcon } from '@heroicons/react/outline';
import React from 'react';
import classNames from 'classnames';

interface AlertProps {
    type: 'warning' | 'danger';
    className?: string;
    children: React.ReactNode;
}

export default ({ type, className, children }: AlertProps) => {
    return (
        <div
            className={classNames(
                'flex items-center border-l-4 text-neutral-200 rounded-md shadow px-4 py-3',
                {
                    ['border-red-500 bg-red-500/25']: type === 'danger',
                    ['border-yellow-500 bg-yellow-500/25']: type === 'warning',
                },
                className
            )}
        >
            {type === 'danger' ? (
                <span className="font-mono border border-transparent">[+]</span>
            ) : (
                <span className="font-mono border border-transparent">[+]</span>
            )}
            {children}
        </div>
    );
};
