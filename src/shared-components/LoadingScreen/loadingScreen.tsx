import React from 'react';
import {Box} from "@mui/material";
import NextSvgImage from "@/components/next-svg-image";
import {ImagesSrc} from "@/constants/imagesSrc";

const LoadingScreen = () => {
    return (
        <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            width: '100vw',
            backgroundColor: '#151b23'
        }}>
            <NextSvgImage src={ImagesSrc.ZakiGradientGreen}
                          unoptimized={true}
                          style={{width: '80px', height: '70px'}}/>
        </Box>
    );
};

export default LoadingScreen;