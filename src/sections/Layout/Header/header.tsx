'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import { Link as MUILink, Stack } from '@mui/material';
import RedeemOutlinedIcon from '@mui/icons-material/RedeemOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import { m, useAnimationControls } from 'framer-motion';

import LargeLogo from '@/shared-components/Logo/largeLogo';
import AppLarge from '@/shared-components/MediaQuery/appLarge';
import AppMediumAndSmall from '@/shared-components/MediaQuery/appMediumAndSmall';
import BackgroundGradientSection from '@/shared-components/BackgroundGradientSection/backgroundGradientSection';
import LanguageSwitcher from '@/components/LanguageSwitcher/LanguageSwitcher';
import UserMenu from '@/components/Header/UserMenu';
import { useAppMediaQuery } from '@/hooks/use-app-media-query';
import { useTranslations } from 'next-intl';
import { useSettingsContext } from '@/components/settings';
import { Link } from '@/i18n/routing';
import { useAuth } from '@/hooks/useAuth'; // ← يجلب الجلسة والاسم من DB

const Header = () => {
  const t = useTranslations();
  const controls = useAnimationControls();
  const { isLarge, isSmall } = useAppMediaQuery();
  const { themeDirection } = useSettingsContext();

  // مصادقة + الاسم من القاعدة
  const auth = useAuth();
  const isAuthenticated = auth.isAuthenticated;
  const displayName =
    auth.workspaceName ||
    auth.user?.user_metadata?.full_name ||
    auth.user?.email ||
    'ZakiCode';

  // drawer للموبايل
  const [isVisible, setIsVisible] = useState(false);
  const sharedInitialState: any = {
    y: -1000,
    height: '0vh',
    width: '100vw',
    position: 'absolute',
    backgroundColor: 'transparent',
    backdropFilter: 'blur(10px)',
    zIndex: '10',
  };
  const openSection = async () =>
    await controls.start({
      y: 0,
      height: '100vh',
      width: '100vw',
      overflowY: 'auto',
      position: 'absolute',
      backgroundColor: 'transparent',
      backdropFilter: 'blur(50px)',
      zIndex: '10',
      transition: { ease: 'easeInOut', duration: 0.5 },
    });
  const closeSection = async () =>
    await controls.start({
      ...sharedInitialState,
      height: 0,
      transition: { ease: 'easeInOut', duration: 0.5 },
    });
  const toggle = () => {
    if (isVisible) closeSection(); else openSection();
    setIsVisible((prev) => !prev);
  };
  useEffect(() => { if (isLarge) { setIsVisible(false); closeSection(); } }, [isLarge]);

  const pages = [
    { title: 'Community', href: '/zaki' },
    { title: 'pricing', href: '/billing' },
    { title: 'projects', href: '/projects' },
    { title: 'templates', href: '/templates' },
    { title: 'blog', href: '/blog' },
    { title: 'howItWorks', href: '/howItWorks' },
  ];

  const links = (
    <Box
      sx={{
        flexGrow: 1,
        gap: '36px',
        justifyContent: 'center',
        alignItems: 'center',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
      }}
    >
      {pages.map((page) => (
        <MUILink
          key={page.title}
          component={Link}
          href={page.href}
          onClick={() => isSmall && toggle()}
          variant="body2"
          sx={{
            fontSize: { xs: '18px', md: '16px' },
            color: 'text.primary',
            display: 'block',
            transition: 'color 0.3s ease, transform 0.2s ease',
            '&:hover': { color: 'primary.main', transform: 'scale(1.05)', textDecoration: 'none' },
            '&:active': { transform: 'scale(1)' },
          }}
        >
          {t(page.title)}
        </MUILink>
      ))}
    </Box>
  );

  // زر بدء الاستخدام لغير الموثقين
  const startForFreeButton = (
    <Stack direction="row" alignItems="center" spacing={1}>
      <LanguageSwitcher />
      <Button
        variant="contained"
        LinkComponent={Link}
        href="/signIn"
        sx={{
          px: 1.7,
          py: 1.1,
          background: () =>
            themeDirection === 'ltr'
              ? 'linear-gradient(293.54deg, #1EFBB8 15.17%, #0EE5F9 84.83%)'
              : 'linear-gradient(66.46deg, #1EFBB8 85%, #0EE5F9 85%)',
        }}
      >
        {t('startBuilding')}
      </Button>
    </Stack>
  );

  // الجانب الأيمن بعد تسجيل الدخول (اسم المستخدم + قوائم)
  const authedRightSide = (
    <Stack direction="row" alignItems="center" spacing={1.25}>
      <LanguageSwitcher />
      <IconButton size="small" sx={{ color: 'text.primary' }}>
        <RedeemOutlinedIcon />
      </IconButton>
      <IconButton size="small" sx={{ color: 'text.primary' }}>
        <NotificationsNoneOutlinedIcon />
      </IconButton>
      <UserMenu
        workspaceName={displayName}
        email={auth.user?.email ?? ''}
        creditsLeft={390.4}
        creditsMax={1205}
        onSignOut={auth.signOut}
      />
    </Stack>
  );

  const menuIcon = (
    <IconButton size="large" onClick={toggle} color="inherit">
      {isVisible ? <CloseIcon /> : <MenuIcon />}
    </IconButton>
  );

  const topDrawer = (
    <m.div initial={{ ...sharedInitialState }} animate={controls}>
      <Container>
        <Stack direction="column" spacing={2} sx={{ paddingTop: '80px', backgroundColor: 'transparent', backdropFilter: 'blur(10px)' }}>
          {links}
          {/* أثناء التحميل لا نعرض شيء لتجنب الفلاش */}
          {auth.loading ? null : (!isAuthenticated ? startForFreeButton : authedRightSide)}
        </Stack>
      </Container>
    </m.div>
  );

  const largeRender = (
    <>
      <LargeLogo />
      {links}
      {auth.loading ? null : (!isAuthenticated ? startForFreeButton : authedRightSide)}
    </>
  );

  const smallRender = (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
        <LargeLogo />
        <Box flexGrow={1} display="flex" justifyContent="end" alignItems="center" gap="8px">
          {!auth.loading && isAuthenticated && authedRightSide}
          {menuIcon}
        </Box>
      </Box>
    </>
  );

  return (
    <>
      <BackgroundGradientSection gradientSectionSx={{ height: '300px' }} />
      {topDrawer}
      <AppBar
        position="sticky"
        sx={{ zIndex: '10', backgroundColor: 'transparent', backdropFilter: `blur(${isVisible ? 0 : 10}px)` }}
      >
        <Container>
          <Toolbar disableGutters sx={{ height: { xs: '60px', md: '89px' } }}>
            <AppLarge>{largeRender}</AppLarge>
            <AppMediumAndSmall>{smallRender}</AppMediumAndSmall>
          </Toolbar>
        </Container>
      </AppBar>
    </>
  );
};

export default Header;
