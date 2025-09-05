import {alpha, Theme} from '@mui/material/styles';
import {drawerClasses, DrawerProps} from '@mui/material/Drawer';
//
import {paper} from '../../css';

// ----------------------------------------------------------------------

export function drawer(theme: Theme) {
  const lightMode = theme.palette.mode === 'light';

  return {
    MuiDrawer: {
      styleOverrides: {
        root: ({ownerState}: { ownerState: DrawerProps }) => {
          const openTransform =
              ownerState.anchor === 'left' ? 'translateX(-100%)' : 'translateX(100%)';
          const closeTransform =
              ownerState.anchor === 'left'
                  ? 'translateX(-100%) !important'
                  : 'translateX(100%) !important';
          const transfomration = ownerState.open ? openTransform : closeTransform;

          return {
            ...(ownerState.variant === 'temporary' && {
              [`& .${drawerClasses.paper}`]: {
                ...paper({theme}),
                transform: transfomration,
                transition: 'transform 0.5s ease',
                boxShadow:
                    ownerState.anchor === 'left'
                        ? `40px 40px 80px -8px ${alpha(
                        lightMode ? theme.palette.grey[500] : theme.palette.common.black,
                        0.24
                        )}`
                        : `-40px 40px 80px -8px ${alpha(
                        lightMode ? theme.palette.grey[500] : theme.palette.common.black,
                        0.24
                        )}`,
              },
            }),
          };
        },
      },
    },
  };
}
