'use client';

import React, {ReactNode, useEffect, useState} from 'react';
import {ILoadingContext} from './interfaces';
import LoadingScreen from "@/shared-components/LoadingScreen/loadingScreen";

const loadingContext = React.createContext<ILoadingContext>({});

const LoadingContextProvider = (props: { children: ReactNode }) => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            setIsLoading(false);
        }, 2000);
    }, []);

    return (
        <loadingContext.Provider value={{}}>
            {isLoading ? <LoadingScreen/> : props.children}
        </loadingContext.Provider>
    );
};

export {LoadingContextProvider, loadingContext};
