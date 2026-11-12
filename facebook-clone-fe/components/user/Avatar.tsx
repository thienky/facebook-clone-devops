import Image from 'next/image';
import React from 'react'
function getInitials(name: string | undefined | null): string {
    if (!name || typeof name !== 'string') return 'U';
    return name
        .split(' ')
        .map(word => word[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

const Avatar = ({ author }: { author: { avatar: string, name: string } }) => {
    const avatarUrl = author.avatar || '/avatars/default-avatar.png';
    return (
        <>
            {avatarUrl.startsWith("from") ? (
                <div className={`w-9 h-9 bg-gradient-to-br ${avatarUrl} rounded-full flex items-center justify-center flex-shrink-0`}>
                    <span className="text-white text-xs font-semibold">{getInitials(author.name)}</span>
                </div>
            ) : (
                <Image
                    src={avatarUrl}
                    alt={author.name}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover"
                    layout="fixed"
                />
            )}
        </>
    )
}

export default Avatar