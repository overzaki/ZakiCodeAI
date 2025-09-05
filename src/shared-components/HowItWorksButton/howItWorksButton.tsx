'use client'

import React from 'react';
import {Button} from "@mui/material";
import NextSvgImage from "@/components/next-svg-image";
import {useAppTheme} from "@/hooks/use-app-theme";
import {ImagesSrc} from "@/constants/imagesSrc";
import {useTranslations} from "next-intl";
import {useSettingsContext} from "@/components/settings";

const HowItWorksButton = () => {
    const theme = useAppTheme()

    const playIcon = <NextSvgImage src={ImagesSrc.PlayIcon} style={{color: theme.palette.text.primary}}/>
    const t = useTranslations();
    const { themeDirection } = useSettingsContext();

    return (
        <Button
            variant={'text'}
            sx={{
                px: {xs: '32px', sm: '32px'},
                py: {xs: '14px', sm: '14px'},
                minWidth: 'fit-content',
            }}
            startIcon={themeDirection === "ltr" ? playIcon : null}
            endIcon={themeDirection === "rtl" ? playIcon : null}

        >
            {t("howItWorks")}
        </Button>
    );
};

export default HowItWorksButton;