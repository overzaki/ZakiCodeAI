import type {TabsProps} from '@mui/material/Tabs';
import Tabs, {tabsClasses} from '@mui/material/Tabs';
import type {SxProps, Theme} from '@mui/material/styles';
import {useTheme} from '@mui/material/styles';

import NoSsr from '@mui/material/NoSsr';
import {tabClasses} from '@mui/material/Tab';

import {stylesMode} from 'src/theme/styles';

// ----------------------------------------------------------------------

export type CustomTabsProps = TabsProps & {
    slotProps?: TabsProps['slotProps'] & {
        scroller?: SxProps<Theme>;
        indicator?: SxProps<Theme>;
        tab?: SxProps<Theme>;
        selected?: SxProps<Theme>;
        scrollButtons?: SxProps<Theme>;
        flexContainer?: SxProps<Theme>;
    };
};

export function CustomTabs({children, slotProps, sx, ...other}: CustomTabsProps) {
    const theme = useTheme();

    return (
        <Tabs
            sx={{
                gap: {sm: 0},
                minHeight: 38,
                flexShrink: 0,
                alignItems: 'center',
                bgcolor: 'background.neutral',
                [`& .${tabsClasses.scroller}`]: {
                    p: 1,
                    ...slotProps?.scroller,
                },
                [`& .${tabsClasses.flexContainer}`]: {
                    gap: 0,
                    ...slotProps?.flexContainer,
                },
                [`& .${tabsClasses.scrollButtons}`]: {
                    borderRadius: 1,
                    minHeight: 'inherit',
                    ...slotProps?.scrollButtons,
                },
                [`& .${tabsClasses.indicator}`]: {
                    py: 0.25,
                    height: 1,
                    bgcolor: 'transparent',
                    '& > span': {
                        width: 1,
                        height: 1,
                        borderRadius: 1,
                        display: 'block',
                        bgcolor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.common.white,
                        // boxShadow: theme.customShadows.z1,
                        [stylesMode.dark]: {bgcolor: 'grey.900'},
                        ...slotProps?.indicator,
                    },
                },
                [`& .${tabClasses.root}`]: {
                    py: 1,
                    px: 2,
                    zIndex: 1,
                    minHeight: 'auto',
                    ...slotProps?.tab,
                    [`&.${tabClasses.selected}`]: {
                        ...slotProps?.selected,
                    },
                },
                ...sx,
            }}
            {...other}
            TabIndicatorProps={{
                children: (
                    <NoSsr>
                        <span/>
                    </NoSsr>
                ),
            }}
        >
            {children}
        </Tabs>
    );
}
