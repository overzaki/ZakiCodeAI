import React, { ReactNode } from 'react';
import { Box, SxProps } from '@mui/material';

interface IBackgroundGradientSectionProps {
  containerSx?: SxProps;
  parentSx?: SxProps;
  gradientSectionSx?: SxProps;
  children?: ReactNode;
}

const BackgroundGradientSection = ({
  containerSx,
  parentSx,
  gradientSectionSx,
  children,
}: IBackgroundGradientSectionProps) => {
  return (
    <Box
      sx={{
        position: 'relative',
        ...containerSx,
      }}
    >
      <Box
        sx={{
          height: '800px',
          position: 'absolute',
          zIndex: 0,
          top: '100px',
          left: 0,
          right: 0,
          bottom: 0,
          filter: 'blur(271.23px)',
          backgroundImage:
            'linear-gradient(to bottom, #0EE5F9, #0A121D, #006849)',
          transform: 'translateZ(0)', // Force hardware acceleration

          // '&::after': {
          //     content: '""',
          //     position: 'absolute',
          //     width: '100%',
          //     filter: 'blur(571.23px)',
          //     top: 0,
          //     left: 0,
          //     zIndex: 1,
          //     background: '-webkit-linear-gradient(bottom, #0EE5F9, #0A121D, #006849)', /* Chrome10+,Safari5.1+ */
          //     // background: '-webkit-linear-gradient(bottom, rgba(14,229,249,70%), rgba(10,18,29,10%), rgba(0,104,73,0.010))', /* Chrome10+,Safari5.1+ */
          //     ...gradientSectionSx as any
          // },
          ...gradientSectionSx,
        }}
      />
      <Box
        sx={{
          backdropFilter: 'blur(1px)',
          ...parentSx,
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default BackgroundGradientSection;
