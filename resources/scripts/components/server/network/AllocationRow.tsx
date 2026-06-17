import Icon from '@/components/elements/Icon';
import React, { memo, useCallback, useState } from 'react';
import isEqual from 'react-fast-compare';
import tw from 'twin.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faNetworkWired } from '@fortawesome/free-solid-svg-icons';
import InputSpinner from '@/components/elements/InputSpinner';
import { Textarea } from '@/components/elements/Input';
import Can from '@/components/elements/Can';
import { Button } from '@/components/elements/button/index';
import GreyRowBox from '@/components/elements/GreyRowBox';
import { Allocation } from '@/api/server/getServer';
import styled from 'styled-components/macro';
import { debounce } from 'debounce';
import setServerAllocationNotes from '@/api/server/network/setServerAllocationNotes';
import { useFlashKey } from '@/plugins/useFlash';
import { ServerContext } from '@/state/server';
import CopyOnClick from '@/components/elements/CopyOnClick';
import DeleteAllocationButton from '@/components/server/network/DeleteAllocationButton';
import setPrimaryServerAllocation from '@/api/server/network/setPrimaryServerAllocation';
import getServerAllocations from '@/api/swr/getServerAllocations';
import { ip } from '@/lib/formatters';
import Code from '@/components/elements/Code';

const Label = styled.label`
    ${tw`uppercase text-xs mt-1 text-neutral-400 block px-1 select-none transition-colors duration-150`}
`;

interface Props {
    allocation: Allocation;
    className?: string;
}

const AllocationRow = ({ allocation, className }: Props) => {
    const [loading, setLoading] = useState(false);
    const { clearFlashes, clearAndAddHttpError } = useFlashKey('server:network');
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const { mutate } = getServerAllocations();

    const onNotesChanged = useCallback((id: number, notes: string) => {
        mutate((data) => data?.map((a) => (a.id === id ? { ...a, notes } : a)), false);
    }, []);

    const setAllocationNotes = debounce((notes: string) => {
        setLoading(true);
        clearFlashes();

        setServerAllocationNotes(uuid, allocation.id, notes)
            .then(() => onNotesChanged(allocation.id, notes))
            .catch((error) => clearAndAddHttpError(error))
            .then(() => setLoading(false));
    }, 750);

    const setPrimaryAllocation = () => {
        clearFlashes();
        mutate((data) => data?.map((a) => ({ ...a, isDefault: a.id === allocation.id })), false);

        setPrimaryServerAllocation(uuid, allocation.id).catch((error) => {
            clearAndAddHttpError(error);
            mutate();
        });
    };

    return (
        <GreyRowBox $hoverable={false} className={`flex-wrap md:flex-nowrap ${className || ''}`} style={{ opacity: 0, willChange: 'transform, opacity' }}>
            <div className={'flex items-center w-full md:w-auto'}>
                <div className={'pl-4 pr-6 text-neutral-400 font-mono text-sm'}>
                    [-]
                </div>
                <div className={'mr-4 flex-1 md:w-40'}>
                    {allocation.alias ? (
                        <CopyOnClick text={allocation.alias}>
                            <Code dark className={'w-40 truncate'}>
                                {allocation.alias}
                            </Code>
                        </CopyOnClick>
                    ) : (
                        <CopyOnClick text={ip(allocation.ip)}>
                            <Code dark>{ip(allocation.ip)}</Code>
                        </CopyOnClick>
                    )}
                    <Label>{allocation.alias ? 'Hostname' : 'IP Address'}</Label>
                </div>
                <div className={'w-16 md:w-24 overflow-hidden'}>
                    <Code dark>{allocation.port}</Code>
                    <Label>Port</Label>
                </div>
            </div>
            <div className={'mt-4 w-full md:mt-0 md:flex-1 md:w-auto'}>
                <InputSpinner visible={loading}>
                    <Textarea
                        className={'bg-neutral-800 hover:border-neutral-600 border-transparent'}
                        placeholder={'Notes'}
                        defaultValue={allocation.notes || undefined}
                        onChange={(e) => setAllocationNotes(e.currentTarget.value)}
                    />
                </InputSpinner>
            </div>
            <div className={'flex items-center justify-end space-x-4 mt-4 w-full md:mt-0 md:w-48'}>
                {allocation.isDefault ? (
                    <span className={'text-sm font-mono text-blue-500'}>
                        [ Primary ]
                    </span>
                ) : (
                    <>
                        <Can action={'allocation.delete'}>
                            <DeleteAllocationButton allocation={allocation.id} />
                        </Can>
                        <Can action={'allocation.update'}>
                            <button className={'text-sm font-mono transition-colors duration-100'} style={{ color: 'var(--color-neutral-400)' }} onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-neutral-200)')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-neutral-400)')} onClick={setPrimaryAllocation}>
                                [ Make Primary ]
                            </button>
                        </Can>
                    </>
                )}
            </div>
        </GreyRowBox>
    );
};

export default memo(AllocationRow, isEqual);
