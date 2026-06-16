import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { Button } from '@/components/elements/button/index';
import Can from '@/components/elements/Can';
import { ServerContext } from '@/state/server';
import { PowerAction } from '@/components/server/console/ServerConsoleContainer';
import { Dialog } from '@/components/elements/dialog';

interface PowerButtonProps {
    className?: string;
}

export default ({ className }: PowerButtonProps) => {
    const [open, setOpen] = useState(false);
    const status = ServerContext.useStoreState((state) => state.status.value);
    const instance = ServerContext.useStoreState((state) => state.socket.instance);

    const killable = status === 'stopping';
    const onButtonClick = (
        action: PowerAction | 'kill-confirmed',
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ): void => {
        e.preventDefault();
        if (action === 'kill') {
            return setOpen(true);
        }

        if (instance) {
            setOpen(false);
            instance.send('set state', action === 'kill-confirmed' ? 'kill' : action);
        }
    };

    useEffect(() => {
        if (status === 'offline') {
            setOpen(false);
        }
    }, [status]);

    return (
        <div className={className}>
            <Dialog.Confirm
                open={open}
                hideCloseIcon
                onClose={() => setOpen(false)}
                title={'Forcibly Stop Process'}
                confirm={'Continue'}
                onConfirmed={onButtonClick.bind(this, 'kill-confirmed')}
            >
                Forcibly stopping a server can lead to data corruption.
            </Dialog.Confirm>
            <Can action={'control.start'}>
                <button
                    className={classNames('flex-1 px-3 py-2 bg-neutral-900 border border-neutral-700 bg-gradient-to-t from-transparent to-transparent text-neutral-300 transition-all font-mono text-xs uppercase text-center', {
                        'opacity-50 cursor-not-allowed': status !== 'offline',
                        'hover:from-green-900/40 hover:text-green-300 hover:border-green-600/50': status === 'offline'
                    })}
                    disabled={status !== 'offline'}
                    onClick={onButtonClick.bind(this, 'start')}
                >
                    Start
                </button>
            </Can>
            <Can action={'control.restart'}>
                <button 
                    className={classNames('flex-1 px-3 py-2 bg-neutral-900 border border-neutral-700 bg-gradient-to-t from-transparent to-transparent text-neutral-300 transition-all font-mono text-xs uppercase text-center', {
                        'opacity-50 cursor-not-allowed': !status,
                        'hover:from-blue-900/40 hover:text-blue-300 hover:border-blue-600/50': status
                    })}
                    disabled={!status} 
                    onClick={onButtonClick.bind(this, 'restart')}
                >
                    Restart
                </button>
            </Can>
            <Can action={'control.stop'}>
                <button
                    className={classNames('flex-1 px-3 py-2 bg-neutral-900 border border-neutral-700 bg-gradient-to-t from-transparent to-transparent text-neutral-300 transition-all font-mono text-xs uppercase text-center', {
                        'opacity-50 cursor-not-allowed': status === 'offline',
                        'hover:from-red-900/40 hover:text-red-300 hover:border-red-600/50': status !== 'offline'
                    })}
                    disabled={status === 'offline'}
                    onClick={onButtonClick.bind(this, killable ? 'kill' : 'stop')}
                >
                    {killable ? 'Kill' : 'Stop'}
                </button>
            </Can>
        </div>
    );
};
