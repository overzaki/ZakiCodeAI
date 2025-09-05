'use client'
import React from 'react';
import {ISharedMediaQuerySectionsProps} from "@/shared-components/MediaQuery/interfaces";
import {useAppMediaQuery} from "@/hooks/use-app-media-query";

const AppSmall = ({children}: ISharedMediaQuerySectionsProps) => {
    const {isSmall} = useAppMediaQuery()
    if (!isSmall)
        return null
    return (
        <>
            {children}
        </>
    );
};

export default AppSmall;