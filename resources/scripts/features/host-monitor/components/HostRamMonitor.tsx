import * as React from 'react';
import { useState, useEffect } from 'react';
import tw from 'twin.macro';
import styled, { keyframes, css } from 'styled-components/macro';
import { bytesToString } from '@/lib/formatters';
import { useHostRam } from '../api/getHostRam';

const doubleFlashLight = keyframes`
  0%, 100% { 
    opacity: 1; 
    box-shadow: 0 -4px 12px 2px rgba(0, 0, 0, 0.4); 
    background-color: #000000; 
  }
  50% { 
    opacity: 0.1; 
    box-shadow: 0 -2px 4px 0px rgba(0, 0, 0, 0.05); 
    background-color: #a1a1aa; 
  }
`;

const doubleFlashDark = keyframes`
  0%, 100% { 
    opacity: 1; 
    box-shadow: 0 -6px 16px 2px rgba(255, 255, 255, 0.7); 
    background-color: #ffffff; 
  }
  50% { 
    opacity: 0.2; 
    box-shadow: 0 -2px 4px 0px rgba(255, 255, 255, 0.1); 
    background-color: #a1a1aa; 
  }
`;

const dimRetractLight = keyframes`
  0%, 100% { opacity: 1; }
  50% { 
    opacity: 0.1; 
    background-color: #e4e4e7; 
  }
`;

const dimRetractDark = keyframes`
  0%, 100% { opacity: 1; }
  50% { 
    opacity: 0.1; 
    background-color: #3f3f46; 
  }
`;

const RamLine = styled.div<{ $state: 'idle' | 'increasing' | 'decreasing' }>`
    ${tw`absolute bottom-0 left-0 h-[4px] bg-neutral-50 transition-all duration-1000 ease-out`}

    ${(props) =>
        props.$state === 'increasing' &&
        css`
            animation: ${doubleFlashLight} 0.6s ease-in-out 2;
            .dark & {
                animation: ${doubleFlashDark} 0.6s ease-in-out 2;
            }
        `}
  ${(props) =>
        props.$state === 'decreasing' &&
        css`
            animation: ${dimRetractLight} 0.6s ease-in-out 2;
            .dark & {
                animation: ${dimRetractDark} 0.6s ease-in-out 2;
            }
        `}
`;

const useAnimatedValue = (value: number, duration = 2500) => {
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

export const HostRamMonitor = () => {
    const { data: displayRam } = useHostRam();
    const [percentage, setPercentage] = useState(0);
    const [flashState, setFlashState] = useState<'idle' | 'increasing' | 'decreasing'>('idle');

    useEffect(() => {
        if (displayRam && displayRam.total > 0) {
            const targetPercentage = Math.min(100, Math.max(0, (displayRam.used / displayRam.total) * 100));
            const delta = targetPercentage - percentage;

            if (percentage > 0 && Math.abs(delta) >= 1.5) {
                if (delta > 0) {
                    setFlashState('increasing');
                } else {
                    setFlashState('decreasing');
                }
                setTimeout(() => setFlashState('idle'), 1200);
            }

            if (percentage === 0) {
                setTimeout(() => setPercentage(targetPercentage), 100);
            } else {
                setPercentage(targetPercentage);
            }
        }
    }, [displayRam?.used, displayRam?.total]);

    const animatedUsed = useAnimatedValue(displayRam?.used || 0);

    if (!displayRam || !displayRam.total) {
        return <span className='text-neutral-200 ml-1'>N/A</span>;
    }

    return (
        <div className='group h-full flex items-center cursor-default'>
            <span
                className='text-neutral-200 ml-1 inline-block text-left relative z-10'
                style={{ width: '180px', fontVariantNumeric: 'tabular-nums' }}
            >
                {bytesToString(animatedUsed)} / {bytesToString(displayRam.total)}
            </span>
            <div className='absolute bottom-0 left-0 w-full h-[4px] bg-neutral-700' />
            <RamLine $state={flashState} style={{ width: `${percentage}%` }} />
            {displayRam.top_processes && displayRam.top_processes.length > 0 && (
                <div className='absolute top-[calc(100%+0px)] right-0 w-72 bg-neutral-800 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50'>
                    <div className='px-4 py-3 bg-neutral-700 text-xs font-bold text-neutral-500 uppercase tracking-wider'>
                        Top Host Memory Processes
                    </div>
                    <div className='flex flex-col py-2'>
                        {displayRam.top_processes.map((proc, i) => (
                            <div
                                key={i}
                                className='flex justify-between items-center px-4 py-2 hover:bg-neutral-600 transition-colors'
                            >
                                <span className='font-mono text-sm text-neutral-200 truncate pr-4'>{proc.name}</span>
                                <span className='font-mono text-sm text-neutral-300 whitespace-nowrap'>
                                    {bytesToString(proc.ram_bytes)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
