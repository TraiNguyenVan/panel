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
                    className={classNames('text-neutral-300 transition-all font-mono text-sm whitespace-nowrap', {
                        'opacity-50 cursor-not-allowed': status !== 'offline',
                        'hover:text-neutral-100': status === 'offline'
                    })}
                    disabled={status !== 'offline'}
                    onClick={onButtonClick.bind(this, 'start')}
                >
                    [ Start ]
                </button>
            </Can>
            <Can action={'control.restart'}>
                <button 
                    className={classNames('text-neutral-300 transition-all font-mono text-sm whitespace-nowrap', {
                        'opacity-50 cursor-not-allowed': !status,
                        'hover:text-neutral-100': status
                    })}
                    disabled={!status} 
                    onClick={onButtonClick.bind(this, 'restart')}
                >
                    [ Restart ]
                </button>
            </Can>
            <Can action={'control.stop'}>
                <button
                    className={classNames('text-neutral-300 transition-all font-mono text-sm whitespace-nowrap', {
                        'opacity-50 cursor-not-allowed': status === 'offline',
                        'hover:text-neutral-100': status !== 'offline'
                    })}
                    disabled={status === 'offline'}
                    onClick={onButtonClick.bind(this, killable ? 'kill' : 'stop')}
                >
                    [ {killable ? 'Kill' : 'Stop'} ]
                </button>
            </Can>
        </div>
    );
};
