'use client'

import React from 'react';
import Typography from "@mui/material/Typography";
import {Stack} from "@mui/material";
import NextSvgImage from "@/components/next-svg-image";
import {RouterLink} from "@/routes/components";
import {KonnectFont} from "@/theme/typography";
import {ImagesSrc} from "@/constants/imagesSrc";
import {useAppMediaQuery} from "@/hooks/use-app-media-query";
import {useLocale} from "next-intl";

const Logo = () => {
    const locale = useLocale();
    const {isLarge} = useAppMediaQuery()
    const dimension = isLarge ? '24px' : '32px'
    const ZakiCodeLogo = <NextSvgImage src={ImagesSrc.Logo}
                                       style={{width: dimension, height: dimension}}
    />

    const ZakiCodeLabel = <Typography
        variant="h6"
        noWrap
        component="div"
        sx={{
            display: 'flex',
            fontFamily: KonnectFont.style,
            fontSize: {
                xs: '24px',
                md: '20px'
            }
        }}
    >
        ZakiCode
    </Typography>
    return (
        <Stack zIndex={1} spacing={1} direction={"row"} component={RouterLink} href={`/${locale}`}>
            {ZakiCodeLogo}
            {ZakiCodeLabel}
        </Stack>
    );
};

export default Logo;