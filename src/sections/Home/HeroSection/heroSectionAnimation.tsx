'use client';

import React, { ReactNode } from 'react';
import { m } from 'framer-motion';

type Props = {
  children: ReactNode;
  /** مدة الأنيميشن بالثواني (اختياري) */
  duration?: number;
  /** التأخير قبل البدء بالثواني (اختياري) */
  delay?: number;
};

const HeroSectionAnimation = ({
  children,
  duration = 1.8,
  delay = 0.5,
}: Props) => {
  return (
    <m.div
      initial={{ opacity: 0, y: 100, scale: 0.5 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        textAlign: 'center',
        gap: '48px',
      }}
      transition={{
        duration,
        delay,
        ease: [0, 0.71, 0.2, 1.01],
      }}
    >
      {children}
    </m.div>
  );
};

export default HeroSectionAnimation;
