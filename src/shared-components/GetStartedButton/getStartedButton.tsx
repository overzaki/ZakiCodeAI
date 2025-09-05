"use client";

import React from 'react';
import {Button, SxProps} from "@mui/material";
import NextSvgImage from "@/components/next-svg-image";
import {ImagesSrc} from "@/constants/imagesSrc";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import {useTranslations} from "next-intl";
import {useSettingsContext} from "@/components/settings";

const GetStartedButton = ({sx}: { sx?: SxProps }) => {
    const arrowIcon = <NextSvgImage src={ImagesSrc.ArrowIcon}/>
    const t = useTranslations();
    const { themeDirection } = useSettingsContext();

    return (
        <Button
            variant='contained'
            color='primary'
            sx={{
                px: {xs: '32px', sm: '32px'},
                py: {xs: '14px', sm: '14px'},
                minWidth: 'fit-content',
                background: () =>
                    themeDirection === "ltr"
                        ? 'linear-gradient(293.54deg, #1EFBB8 15.17%, #0EE5F9 84.83%)'
                        : 'linear-gradient(66.46deg, #1EFBB8 85%, #0EE5F9 85%)',
                ...sx
            }}
            endIcon={themeDirection === "ltr" ? arrowIcon : <KeyboardBackspaceIcon /> }
        >
            {t("getStarted")}
        </Button>
    );
};

export default GetStartedButton;