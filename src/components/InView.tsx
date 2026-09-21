'use client';

import { useRef } from 'react';
import {
    motion,
    useInView as useFramerInView,
    type UseInViewOptions,
    type Variants,
    type Transition,
} from 'motion/react';

export type InViewProps = {
    children: React.ReactNode;
    variants?: Variants;
    transition?: Transition;
    viewOptions?: UseInViewOptions;
    as?: keyof typeof motion;
};

export function InView({
    children,
    variants,
    transition,
    viewOptions,
    as = 'div',
}: InViewProps) {
    const ref = useRef(null);
    const isInView = useFramerInView(ref, viewOptions);

    const MotionComponent = motion[as] as React.ElementType;

    const defaultVariants: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
    };

    return (
        <MotionComponent
            ref={ref}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            variants={variants ?? defaultVariants}
            transition={transition}
        >
            {children}
        </MotionComponent>
    );
}