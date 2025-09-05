"use client";
import {ReactNode} from "react";
import {m} from "framer-motion";


export const SlideIn = ({ children, direction = 'left', duration = 0.5, distance = 100 } : {
    children: ReactNode;
    direction: "left" | "right";
    duration?: number;
    distance?: number;
                        }
) => {
    const variants = {
        hidden: { x: direction === 'left' ? -distance : distance, opacity: 0 },
        visible: { x: 0, opacity: 1 },
        exit: { x: direction === 'left' ? distance : -distance, opacity: 0 },
    };

    return (
        <m.div
            initial="hidden"
            whileInView={variants.visible}
            viewport={{ once: true }}
            exit="exit"
            variants={variants}
            transition={{ duration }}
        >
            {children}
        </m.div>
    );
};
