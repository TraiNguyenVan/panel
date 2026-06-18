import React, { useEffect, useState, useRef } from 'react';
import { useActivityLogs } from '@/api/server/activity';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import { useFlashKey } from '@/plugins/useFlash';
import { staggerRows } from '@/lib/animations';
import FlashMessageRender from '@/components/FlashMessageRender';
import Spinner from '@/components/elements/Spinner';
import ActivityLogEntry from '@/components/elements/activity/ActivityLogEntry';
import PaginationFooter from '@/components/elements/table/PaginationFooter';
import { ActivityLogFilters } from '@/api/account/activity';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import { styles as btnStyles } from '@/components/elements/button/index';
import { XCircleIcon } from '@heroicons/react/solid';
import useLocationHash from '@/plugins/useLocationHash';

export default () => {
    const { hash } = useLocationHash();
    const { clearAndAddHttpError } = useFlashKey('server:activity');
    const [filters, setFilters] = useState<ActivityLogFilters>({ page: 1, sorts: { timestamp: -1 } });

    const { data, isValidating, error } = useActivityLogs(filters, {
        revalidateOnMount: true,
        revalidateOnFocus: false,
    });

    const listRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setFilters((value) => ({ ...value, filters: { ip: hash.ip, event: hash.event } }));
    }, [hash]);

    useEffect(() => {
        if (!data?.items.length || !listRef.current) return;
        const rows = Array.from(listRef.current.children) as HTMLElement[];
        if (rows.length) staggerRows(rows);
    }, [data?.items]);

    useEffect(() => {
        clearAndAddHttpError(error);
    }, [error]);

    return (
        <ServerContentBlock title={'Activity Log'}>
            <FlashMessageRender byKey={'server:activity'} />
            {(filters.filters?.event || filters.filters?.ip) && (
                <div className={'flex justify-end mb-2'}>
                    <Link
                        to={'#'}
                        className={classNames(btnStyles.button, btnStyles.text, 'w-full sm:w-auto')}
                        onClick={() => setFilters((value) => ({ ...value, filters: {} }))}
                    >
                        Clear Filters <span className="font-mono border border-transparent">[+]</span>
                    </Link>
                </div>
            )}
            {!data && isValidating ? (
                <Spinner centered />
            ) : !data?.items.length ? (
                <p className={'text-sm text-center text-gray-400'}>No activity logs available for this server.</p>
            ) : (
                <div ref={listRef} className={'border border-neutral-700 bg-neutral-900'}>
                    {data?.items.map((activity) => (
                        <ActivityLogEntry key={activity.id} activity={activity}>
                            <span />
                        </ActivityLogEntry>
                    ))}
                </div>
            )}
            {data && (
                <PaginationFooter
                    pagination={data.pagination}
                    onPageSelect={(page) => setFilters((value) => ({ ...value, page }))}
                />
            )}
        </ServerContentBlock>
    );
};
