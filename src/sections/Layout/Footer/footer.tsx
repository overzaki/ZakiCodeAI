'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { Grid, Stack, Link as MUILink } from '@mui/material';
import Logo from '@/shared-components/Logo/logo';
import {
  footerMenuItems,
  socialMediaIcons,
} from '@/sections/Layout/Footer/constants';
import NextSvgImage from '@/components/next-svg-image';
import { useAppTheme } from '@/hooks/use-app-theme';
import { ImagesSrc } from '@/constants/imagesSrc';
import AppLarge from '@/shared-components/MediaQuery/appLarge';
import AppMedium from '@/shared-components/MediaQuery/appMedium';
import AppSmall from '@/shared-components/MediaQuery/appSmall';
import BackgroundGradientSection from '@/shared-components/BackgroundGradientSection/backgroundGradientSection';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

const Footer = () => {
  const theme = useAppTheme();
  const t = useTranslations();
  const locale = useLocale();

  const socialMediaLinks = (
    <Box
      sx={{
        margin: '28px 0 20px 0',
        gap: '8px',
        justifyContent: 'start',
        display: 'flex',
      }}
    >
      {socialMediaIcons.map((item, index) => (
        <Link
          key={index}
          style={{ display: 'block' }}
          target={'_blank'}
          href={item.href}
        >
          <NextSvgImage
            src={item.icon}
            style={{
              width: '24px',
              height: '24px',
              color: theme.palette.text.primary,
            }}
          />
        </Link>
      ))}
    </Box>
  );

  const allMenuItems = (
    <>
      {footerMenuItems.map((item, index1) => (
        <Grid
          key={index1}
          item
          xs={6}
          sm={4}
          md={1.5}
          sx={{
            marginInlineStart: { md: 'auto' },
          }}
        >
          <Typography
            variant={'body2'}
            fontWeight={'bold'}
            marginBottom={'16px'}
          >
            {t(item.category)}
          </Typography>
          <Stack spacing={2}>
            {item.items.map((link, index2) => {
              return (
                <MUILink
                  component={Link}
                  color={'text.primary'}
                  key={`${index1}-${index2}`}
                  href={`${link.href}`}
                  sx={{
                    fontSize: '.8rem',
                    fontWeight: 500,
                    color: 'text.secondary',
                  }}
                >
                  {t(link.label)}
                </MUILink>
              );
            })}
          </Stack>
        </Grid>
      ))}
    </>
  );

  const copyrightLabel = (
    <Typography variant={'body2'}>
      {t('copyright')} © {new Date().getFullYear()}{' '}
      {t('OverZakiIncAllRightsReserved')}
    </Typography>
  );

  const zakiCodeSlogan = (
    <Box sx={{ px: { xs: 2, md: 10 } }}>
      <NextSvgImage
        src={ImagesSrc.FooterSloganImage}
        style={{ width: '100%', height: '100%' }}
      />
    </Box>
  );

  const desktopRender = (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Grid container spacing={2}>
          <Grid item xs={3}>
            <Logo />
            {socialMediaLinks}
            {copyrightLabel}
          </Grid>
          <Grid item xs={0.5} />
          {allMenuItems}
        </Grid>
      </Grid>
      <Grid item xs={12}>
        {zakiCodeSlogan}
      </Grid>
    </Grid>
  );

  const tabletRender = (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Logo />
        {socialMediaLinks}
        {copyrightLabel}
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={2} rowSpacing={4}>
          {allMenuItems}
        </Grid>
      </Grid>
      <Grid item xs={12}>
        {zakiCodeSlogan}
      </Grid>
    </Grid>
  );

  const mobileRender = (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Logo />
        {socialMediaLinks}
        {copyrightLabel}
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={2} rowSpacing={4}>
          {allMenuItems}
        </Grid>
      </Grid>
      <Grid item xs={12}>
        {zakiCodeSlogan}
      </Grid>
    </Grid>
  );

  return (
    <Container
      sx={{
        pt: 5,
      }}
    >
      <BackgroundGradientSection
        containerSx={{
          paddingBottom: '50px',
        }}
        gradientSectionSx={{
          top: '100px',
          height: '400px',
        }}
      >
        <AppLarge>{desktopRender}</AppLarge>
        <AppMedium>{tabletRender}</AppMedium>
        <AppSmall>{mobileRender}</AppSmall>
      </BackgroundGradientSection>
    </Container>
  );
};

export default Footer;
