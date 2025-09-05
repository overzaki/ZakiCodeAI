'use client'

import React, {CSSProperties, ReactNode} from 'react';
import {m} from "framer-motion";

interface ITitleInnerAnimationProps {
    children: ReactNode,
    initial?: CSSProperties,
    whileInView?: CSSProperties
}

const TitleInnerAnimation = ({initial, whileInView, children}: ITitleInnerAnimationProps) => {

    return (
        <m.div
            initial={{opacity: 0, width: 0, margin: '0 4px', ...initial as any}}
            whileInView={{opacity: 1, width: '61px', margin: '0 12px', display: 'flex', ...whileInView as any}}
            viewport={{once: true}}
            transition={{
                duration: 0.8,
                delay: 0.5,
                ease: [0, 0.71, 0.2, 1.01]
            }}
        >
            {children}
        </m.div>

    );
};

export default TitleInnerAnimation;