'use client'
import React from 'react';
import {ISharedMediaQuerySectionsProps} from "@/shared-components/MediaQuery/interfaces";
import {useAppMediaQuery} from "@/hooks/use-app-media-query";

const AppMedium = ({children}: ISharedMediaQuerySectionsProps) => {
    const {isMedium} = useAppMediaQuery()
    if (!isMedium)
        return null
    return (
        <>
            {children}
        </>
    );
};

export default AppMedium;