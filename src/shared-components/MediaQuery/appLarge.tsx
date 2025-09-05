'use client'
import React from 'react';
import {ISharedMediaQuerySectionsProps} from "@/shared-components/MediaQuery/interfaces";
import {useAppMediaQuery} from "@/hooks/use-app-media-query";

const AppLarge = ({children}: ISharedMediaQuerySectionsProps) => {
    const {isLarge} = useAppMediaQuery()
    if (!isLarge)
        return null
    return (
        <>
            {children}
        </>
    );
};

export default AppLarge;