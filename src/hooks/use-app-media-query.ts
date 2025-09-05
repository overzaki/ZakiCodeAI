'use client'

import {useResponsive} from "@/hooks/use-responsive";

export const useAppMediaQuery = () => {
    const isLarge = useResponsive('up', 'md')
    const isMedium = useResponsive('between', 'sm', 'md')
    const isSmall = useResponsive('down', 'sm')
    return {
        isLarge,
        isMedium,
        isSmall
    }
}

