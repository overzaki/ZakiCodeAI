'use client';

import * as React from 'react';
import Image from 'next/image';

type Props = {
  size?: number;
  /** غيّر المسار لو تحب، الافتراضي public/brand/zaki-mark.svg */
  src?: string;
};

export default function LogoMark({ size = 56, src = '/brand/zaki-mark.png' }: Props) {
  return (
    <div
      style={{
        width: size,
        height: size,
        display: 'grid',
        placeItems: 'center',
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(56,245,209,.20)',
        background: 'transparent',
      }}
    >
      <Image src={src} alt="ZakiCode logo" width={size} height={size} priority />
    </div>
  );
}
