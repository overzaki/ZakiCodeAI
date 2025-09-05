'use client';

import React from 'react';
import { Box, Typography, Stack } from '@mui/material';
import Iconify from '@/components/iconify';
import { useTranslations } from 'next-intl';
import { useSettingsContext } from '@/components/settings';
import Image from 'next/image';
import { ImagesSrc } from '@/constants/imagesSrc';
import { useResponsive } from '@/hooks/use-responsive';

const steps = [
  {
    icon: 'mage:message-dots',
    title: 'Prompt',
    description: 'Prompt Desc',
  },
  {
    icon: 'fa-solid:code',
    title: 'Develop',
    description: 'Develop Desc',
  },
  {
    icon: 'jam:refresh',
    title: 'Iterate',
    description: 'Iterate Desc',
  },
  {
    icon: 'lineicons:rocket-5',
    title: 'Deploy',
    description: 'Deploy Desc',
  },
];

const StepsSection = () => {
  const t = useTranslations();
  const isMd = useResponsive('up', 'md');
  const { themeDirection } = useSettingsContext();

  return (
    <Box
      sx={{
        py: 8,
        px: 2,
        maxWidth: '1200px',
        mx: 'auto',
      }}
    >
      {/* Steps Container */}
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: { xs: 4, md: 1 },
          alignItems: { xs: 'center', md: 'start' },
          justifyContent: 'center',
        }}
      >
        {steps.map((step, index) => (
          <React.Fragment key={step.title}>
            {/* Step Card */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                maxWidth: { xs: '100%', md: '200px', lg: '280px', xl: '320px' },
                position: 'relative',
                zIndex: 2,
              }}
            >
              {/* Icon Container */}
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  bgcolor: 'primary.contrastText',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 3,
                  boxShadow: '0 8px 32px rgba(30, 251, 184, 0.3)',
                  borderBottomLeftRadius: '5px !important',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    borderRadius: '50%',
                    borderBottomLeftRadius: '5px !important',
                    top: -2,
                    left: -2,
                    right: -2,
                    bottom: -2,
                    background: 'linear-gradient(135deg, #1EFBB8, #0EE5F9)',
                    zIndex: -1,
                    opacity: 0.3,
                    filter: 'blur(8px)',
                  },
                }}
              >
                <Iconify
                  icon={step.icon}
                  sx={{
                    width: '60%',
                    height: '60%',
                    color: 'primary.main',
                  }}
                />
              </Box>

              {/* Title */}
              <Typography
                sx={{
                  color: 'text.primary',
                  fontWeight: 600,
                  mb: 0.5,
                  fontSize: '1rem',
                }}
              >
                {t(step.title)}
              </Typography>

              {/* Description */}
              <Typography
                sx={{
                  color: 'text.secondary',
                  lineHeight: 1.6,
                  fontSize: '0.8rem',
                }}
              >
                {t(step.description)}
              </Typography>
            </Box>

            {/* Arrow Connector */}
            {index < steps.length - 1 && (
              <Box
                width={isMd ? 110 : 14}
                height={isMd ? 14 : 110}
                sx={{
                  // display: { xs: 'none', md: 'flex' },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mt: { xs: 2, md: 8 },
                  mx: 2,
                  position: 'relative',
                  flexShrink: 0,
                }}
              >
                <Image
                  src={ImagesSrc.ArcArrow}
                  alt="arrow"
                  width={isMd ? 110 : 14}
                  height={isMd ? 14 : 110}
                  style={{
                    width: 'auto',
                    height: 'auto',
                    maxWidth: 'none',
                    //   transform: `
                    //   ${themeDirection === 'rtl' ? 'scaleX(-1)' : ''}
                    //   ${index % 2 === 1 ? 'scaleY(-1)' : ''}
                    //   rotate(90deg)
                    // `,
                    transform: isMd
                      ? `
                       ${themeDirection === 'rtl' ? 'scaleX(-1)' : ''} 
                       ${index % 2 === 1 ? 'scaleY(-1)' : ''}
                     `
                      : `
                    ${index % 2 === 1 ? 'scaleX(-1)' : ''}
                    rotate(90deg)
                  `,
                  }}
                />
              </Box>
            )}
            {/* Mobile Arrow Indicators */}
            {/* <Box
              sx={{
                display: { xs: 'flex', md: 'none' },
                justifyContent: 'center',
                mt: 4,
                gap: 1,
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              {steps.slice(0, -1).map((_, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    my: 1,
                  }}
                >
                  <img
                    src="/assets/arc-arrow.svg"
                    alt="arrow"
                    style={{
                      width: '40px',
                      height: 'auto',
                      transform: `
                  ${themeDirection === 'rtl' ? 'scaleX(-1)' : ''} 
                  ${index % 2 === 1 ? 'scaleY(-1)' : ''}
                  rotate(90deg)
                `,
                    }}
                  />
                </Box>
              ))}
            </Box> */}
          </React.Fragment>
        ))}
      </Box>
    </Box>
  );
};

export default StepsSection;
