import React, { CSSProperties } from 'react';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

interface Props {
    icon: IconDefinition;
    className?: string;
    style?: CSSProperties;
}

const asciiMap: Record<string, string> = {
    trash: '[x]',
    'trash-alt': '[x]',
    'pencil-alt': '[*]',
    pen: '[*]',
    server: '[#]',
    copy: '[=]',
    clone: '[=]',
    play: '[>]',
    'play-circle': '[>]',
    stop: '[ ]',
    'stop-circle': '[ ]',
    redo: '[R]',
    sync: '[R]',
    'sync-alt': '[R]',
    folder: '[/]',
    'folder-open': '[/]',
    file: '[_]',
    'file-alt': '[_]',
    'file-code': '[_]',
    'file-archive': '[_]',
    'box-open': '[^]',
    archive: '[^]',
    'level-up-alt': '[^]',
    'arrow-up': '[^]',
    'arrow-down': '[v]',
    'file-download': '[v]',
    'cloud-download-alt': '[v]',
    'cloud-upload-alt': '[^]',
    lock: '[!]',
    unlock: '[!]',
    key: '[k]',
    user: '[@]',
    users: '[@]',
    clock: '[t]',
    history: '[t]',
    'exclamation-triangle': '[!]',
    'exclamation-circle': '[!]',
    check: '[ok]',
    'check-circle': '[ok]',
    search: '[?]',
    cog: '[&]',
    cogs: '[&]',
    wrench: '[&]',
    'ellipsis-h': '[...]',
    'ellipsis-v': '[...]',
    wifi: '[~]',
    'network-wired': '[~]',
    microchip: '[#]',
    memory: '[#]',
    hdd: '[#]',
    terminal: '[_>]',
    'sign-in-alt': '[->]',
    'sign-out-alt': '[<-]',
    'external-link-alt': '[->]'
};

const Icon = ({ icon, className, style }: Props) => {
    const name = icon ? icon.iconName : '';
    const ascii = asciiMap[name] || '[+]';

    return (
        <span className={`font-mono border border-transparent ${className || ''}`} style={style}>
            {ascii}
        </span>
    );
};

export default Icon;
