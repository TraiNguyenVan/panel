import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    faClock,
    faCloudDownloadAlt,
    faCloudUploadAlt,
    faHdd,
    faMemory,
    faMicrochip,
    faWifi,
} from '@fortawesome/free-solid-svg-icons';
import { bytesToString, ip, mbToBytes } from '@/lib/formatters';
import { ServerContext } from '@/state/server';
import { SocketEvent, SocketRequest } from '@/components/server/events';
import UptimeDuration from '@/components/server/UptimeDuration';
import StatBlock from '@/components/server/console/StatBlock';
import useWebsocketEvent from '@/plugins/useWebsocketEvent';
import classNames from 'classnames';
import { capitalize } from '@/lib/strings';
import { staggerCards } from '@/lib/animations';

const useAnimatedValue = (value: number, duration = 2000) => {
    const [current, setCurrent] = useState(value);
    
    useEffect(() => {
        let startTimestamp: number;
        const startValue = current;
        const diff = value - startValue;

        if (diff === 0) return;

        let frameId: number;

        const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            
            // Linear easing for continuous rolling
            const easeProgress = progress;

            setCurrent(startValue + diff * easeProgress);

            if (progress < 1) {
                frameId = window.requestAnimationFrame(step);
            } else {
                setCurrent(value);
            }
        };

        frameId = window.requestAnimationFrame(step);

        return () => window.cancelAnimationFrame(frameId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, duration]);

    return current;
};

const getBackgroundColor = (value: number, max: number | null): string | undefined => {
    const delta = !max ? 0 : value / max;

    if (delta > 0.8) {
        if (delta > 0.9) {
            return 'bg-red-500';
        }
        return 'bg-yellow-500';
    }

    return undefined;
};

const Limit = ({ limit, children }: { limit: string | null; children: React.ReactNode }) => (
    <>
        {children}
        <span className={'ml-1 text-[70%] select-none'} style={{ color: 'var(--color-neutral-400)' }}>/ {limit || <>&infin;</>}</span>
    </>
);

const ServerDetailsBlock = ({ className }: { className?: string }) => {
    const [stats, setStats] = useState<Stats>({ memory: 0, cpu: 0, disk: 0, uptime: 0, tx: 0, rx: 0 });
    const [animated, setAnimated] = useState(false);
    const gridRef = useRef<HTMLDivElement>(null);

    const status = ServerContext.useStoreState((state) => state.status.value);
    const connected = ServerContext.useStoreState((state) => state.socket.connected);
    const instance = ServerContext.useStoreState((state) => state.socket.instance);
    const limits = ServerContext.useStoreState((state) => state.server.data!.limits);

    const textLimits = useMemo(
        () => ({
            cpu: limits?.cpu ? `${limits.cpu}%` : null,
            memory: limits?.memory ? bytesToString(mbToBytes(limits.memory)) : null,
            disk: limits?.disk ? bytesToString(mbToBytes(limits.disk)) : null,
        }),
        [limits]
    );

    const allocation = ServerContext.useStoreState((state) => {
        const match = state.server.data!.allocations.find((allocation) => allocation.isDefault);

        return !match ? 'n/a' : `${match.alias || ip(match.ip)}:${match.port}`;
    });

    useEffect(() => {
        if (!connected || !instance) {
            return;
        }

        instance.send(SocketRequest.SEND_STATS);
    }, [instance, connected]);

    useWebsocketEvent(SocketEvent.STATS, (data) => {
        let stats: any = {};
        try {
            stats = JSON.parse(data);
        } catch (e) {
            return;
        }

        setStats({
            memory: stats.memory_bytes,
            cpu: stats.cpu_absolute,
            disk: stats.disk_bytes,
            tx: stats.network.tx_bytes,
            rx: stats.network.rx_bytes,
            uptime: stats.uptime || 0,
        });
    });

    // Animate stat cards in on first mount
    useEffect(() => {
        if (!gridRef.current || animated) return;
        const cards = gridRef.current.querySelectorAll('[class*="col-span"]');
        if (cards.length) {
            setAnimated(true);
            staggerCards(cards, 150);
        }
    }, []);

    const animatedCpu = useAnimatedValue(stats.cpu);
    const animatedMemory = useAnimatedValue(stats.memory);
    const animatedDisk = useAnimatedValue(stats.disk);
    const animatedRx = useAnimatedValue(stats.rx);
    const animatedTx = useAnimatedValue(stats.tx);

    return (
        <div ref={gridRef} className={classNames('grid grid-cols-6 gap-2 md:gap-4', className)}>
            <StatBlock icon={faWifi} title={'Address'} copyOnClick={allocation}>
                {allocation}
            </StatBlock>
            <StatBlock
                icon={faClock}
                title={'Uptime'}
                color={getBackgroundColor(status === 'running' ? 0 : status !== 'offline' ? 9 : 10, 10)}
            >
                {status === null ? (
                    'Offline'
                ) : stats.uptime > 0 ? (
                    <UptimeDuration uptime={stats.uptime / 1000} />
                ) : (
                    capitalize(status)
                )}
            </StatBlock>
            <StatBlock icon={faMicrochip} title={'CPU Load'} color={getBackgroundColor(stats.cpu, limits.cpu)}>
                {status === 'offline' ? (
                    <span style={{ color: 'var(--color-neutral-400)' }}>Offline</span>
                ) : (
                    <Limit limit={textLimits.cpu}>{animatedCpu.toFixed(2)}%</Limit>
                )}
            </StatBlock>
            <StatBlock
                icon={faMemory}
                title={'Memory'}
                color={getBackgroundColor(stats.memory / 1024, limits.memory * 1024)}
            >
                {status === 'offline' ? (
                    <span style={{ color: 'var(--color-neutral-400)' }}>Offline</span>
                ) : (
                    <Limit limit={textLimits.memory}>{bytesToString(animatedMemory)}</Limit>
                )}
            </StatBlock>
            <StatBlock icon={faHdd} title={'Disk'} color={getBackgroundColor(stats.disk / 1024, limits.disk * 1024)}>
                <Limit limit={textLimits.disk}>{bytesToString(animatedDisk)}</Limit>
            </StatBlock>
            <StatBlock icon={faCloudDownloadAlt} title={'Network (Inbound)'}>
                {status === 'offline' ? <span style={{ color: 'var(--color-neutral-400)' }}>Offline</span> : bytesToString(animatedRx)}
            </StatBlock>
            <StatBlock icon={faCloudUploadAlt} title={'Network (Outbound)'}>
                {status === 'offline' ? <span style={{ color: 'var(--color-neutral-400)' }}>Offline</span> : bytesToString(animatedTx)}
            </StatBlock>
        </div>
    );
};

export default ServerDetailsBlock;
