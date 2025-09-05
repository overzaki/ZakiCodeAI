'use client';

import merge from 'lodash/merge';
import {useMemo} from 'react';
// @mui
import CssBaseline from '@mui/material/CssBaseline';
import {createTheme, ThemeOptions, ThemeProvider as MuiThemeProvider} from '@mui/material/styles';
// system
import {palette} from './palette';
import {shadows} from './shadows';
import {typography} from './typography';
import {customShadows} from './custom-shadows';
// options
import {presets} from './options/presets';
import {darkMode} from './options/dark-mode';
import {contrast} from './options/contrast';
import RTL, {direction} from './options/right-to-left';
//
import NextAppDirEmotionCacheProvider from './next-emotion-cache';
import {useSettingsContext} from "@/components/settings/context";
import {componentsOverrides} from "@/theme/overrides";

// ----------------------------------------------------------------------

type Props = {
    children: React.ReactNode;
};

export default function ThemeProvider({children}: Props) {

    const settings = useSettingsContext();

    const darkModeOption = darkMode(settings.themeMode);

    const presetsOption = presets('default');

    const contrastOption = contrast(true, settings.themeMode);

    const directionOption = direction(settings.themeDirection);

    const baseOption = useMemo(
        () => ({
            palette: palette('light'),
            shadows: shadows('light'),
            customShadows: customShadows('light'),
            typography,
            shape: {borderRadius: 8},
            breakpoints: {
                values: {
                    xs: 0,
                    sm: 600,
                    md: 900,
                    lg: 1350,
                    xl: 1536,
                },
            },
        }),
        []
    );

    const memoizedValue = useMemo(
        () =>
            merge(
                // Base
                baseOption,
                // Direction: remove if not in use
                // directionOption,
                // Dark mode: remove if not in use
                darkModeOption,
                // Presets: remove if not in use
                presetsOption,
                // Contrast: remove if not in use
                contrastOption.theme
            ),
        [baseOption, directionOption, darkModeOption, presetsOption, contrastOption.theme]
    );

    const theme = createTheme(memoizedValue as ThemeOptions);

    theme.components = merge(componentsOverrides(theme), contrastOption.components);

    const themeWithLocale = useMemo(
        () => createTheme(theme),
        [theme]
    );

    return (
        <NextAppDirEmotionCacheProvider options={{key: 'css'}}>
            <MuiThemeProvider theme={themeWithLocale}>
                <RTL themeDirection={settings.themeDirection}>
                    <CssBaseline/>
                    {children}
                </RTL>
            </MuiThemeProvider>
        </NextAppDirEmotionCacheProvider>
    );
}
