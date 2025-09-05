"use client"
import {ReactNode} from "react";
import {m} from "framer-motion";

export const FadeIn = ({children, duration = 0.5, distance = 100}: {
    children: ReactNode,
    duration?: number,
    distance?: number
}) => {
    return (
        <m.div
            initial={{opacity: 0, y: distance}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{ once: true }}
            exit={{opacity: 0, y: distance}}
            transition={{duration}}
        >
            {children}
        </m.div>
    );
};