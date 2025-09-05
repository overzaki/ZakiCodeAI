import React from 'react';
import { Box, SxProps } from '@mui/material';

const ColorizedLabel = ({ label, sx }: { label: string; sx?: SxProps }) => {
  return (
    <Box
      className="colorized-label"
      sx={{
        display: 'inline',
        lineHeight: '1',
        background:
          'radial-gradient(circle, rgba(30,251,184,1) 0%, rgba(14,229,249,1) 100%)',
        backgroundClip: 'text',
        textFillColor: 'transparent',
        ...sx,
      }}
    >
      {label}
    </Box>
  );
};

export default ColorizedLabel;
