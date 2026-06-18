import useSWR from 'swr';
import http from '@/api/http';

export interface HostRamData {
    used: number;
    total: number;
    top_processes?: { name: string; ram_bytes: number }[];
}

export const useHostRam = () => {
    const initRam = (window as any).SiteConfiguration?.host_ram as HostRamData | undefined;

    return useSWR<HostRamData>(
        '/api/client/host-ram',
        async (url: string) => {
            const { data } = await http.get(url);
            return data;
        },
        {
            refreshInterval: 2500,
            initialData: initRam && initRam.total ? initRam : undefined,
            revalidateOnMount: true,
        }
    );
};
