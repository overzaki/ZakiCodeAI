'use client';

import React from 'react';
import Image from 'next/image';
import {
  Box,
  Typography,
  Stack,
  Grid,
  Button,
  alpha,
  Link as MUILink,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useSettingsContext } from '@/components/settings';
import Iconify from '@/components/iconify';
import { Link } from '@/i18n/routing';
import { ImagesSrc } from '@/constants/imagesSrc';

// ---------------------------------------------
// Fake data so we can swap with API later
// ---------------------------------------------
const plans = [
  {
    id: 'hobby',
    badge: 'HOBBY',
    priceLabel: '$0',
    cta: 'Upgrade',
    icon: ImagesSrc.hoppy,
    accent: '#1EFBB8',
    // bg: 'radial-gradient(1200px 400px at 0% 0%, rgba(27, 251, 182, .25), transparent 60%), radial-gradient(600px 600px at 100% 100%, rgba(27, 251, 182, .12), transparent 60%)',
    bg: 'radial-gradient(700px 700px at 60% 20%, rgba(12, 207, 113, 0.05), transparent 60%)',
    features: [
      '100 Interactions (GPT‑3.5 Only)',
      'Deploy 1 App',
      'Connect 1 Collection',
      '10GB of Storage',
      'Community Support (Discord)',
    ],
  },
  {
    id: 'pro',
    badge: 'PRO',
    priceLabel: '$50',
    cta: 'Upgrade',
    icon: ImagesSrc.pro,
    accent: '#AAB2BF',
    // bg: 'radial-gradient(700px 700px at 60% 20%, rgba(170,178,191,.15), transparent 60%)',
    bg: 'radial-gradient(700px 700px at 60% 50%, rgba(151, 204, 240, 0.1), rgba(30,30,30, 1) 30%)',
    features: [
      'Unlimited Interactions',
      '$0.09 per Interaction',
      'Deploy 10 Apps',
      'Connect 10 Collections',
      '1TB of Storage',
      'Community & Email Support',
    ],
  },
  {
    id: 'enterprise',
    badge: 'ENTERPRISE',
    priceLabel: 'Custom',
    cta: 'Request Access',
    icon: ImagesSrc.interprise,
    accent: '#6DA2FF',
    // bg: 'radial-gradient(1200px 400px at 100% 0%, rgba(109,162,255,.25), transparent 60%), radial-gradient(600px 600px at 0% 100%, rgba(109,162,255,.12), transparent 60%)',
    bg: 'radial-gradient(700px 700px at 60% 20%, rgba(92, 124, 230, 0.05), transparent 60%)',
    features: [
      'Unlimited Interactions',
      'Custom Interaction Pricing',
      'Unlimited Apps',
      'Unlimited Collections',
      'Unlimited Storage',
      'Dedicated Support',
    ],
  },
] as const;

const dedicatedIncluded = [
  'Shared Zaki Code Channel',
  'Prompt Engineering Guidance',
  'Dedicated Support Engineer',
  'Context Sourcing Guidance',
];

const PricingPageSection = () => {
  const t = useTranslations();
  const { themeDirection } = useSettingsContext();

  return (
    <Stack
      alignItems="center"
      sx={{
        py: 8,
        px: 2,
        maxWidth: '1200px',
        mx: 'auto',
      }}
    >
      {/* Section Header */}
      <Box sx={{ width: '100%', mb: 4, zIndex: 1 }}>
        <Stack
          direction={'row'}
          justifyContent={'space-between'}
          alignItems={'center'}
          spacing={1}
          sx={{ width: '100%', textAlign: 'start', mb: 4 }}
        >
          <Typography
            color="text.primary"
            sx={{ fontWeight: 600, fontSize: { xs: '2rem', md: '2.5rem' } }}
          >
            {t('Pricing Plans')}
          </Typography>
          <MUILink
            // <Typography
            component={Link}
            href={'usage'}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              textTransform: 'none',
              color: 'primary.main',
            }}
          >
            <Iconify icon="solar:chart-2-linear" />
            {t('View Usage')}
          </MUILink>
        </Stack>
      </Box>

      {/* Plans Grid */}
      <Grid
        container
        spacing={2.5}
        sx={{ width: '100%', justifyContent: 'center' }}
      >
        {plans.map((plan) => (
          <Grid item xs={12} md={3.5} key={plan.id}>
            <Box
              sx={{
                position: 'relative',
                p: 2.5,
                borderRadius: 3,
                overflow: 'hidden',
                bgcolor: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.05)',
                backgroundImage: plan.bg,
                height: '100%',
              }}
            >
              {/* Badge */}
              <Box
                sx={{
                  borderRadius: 9999,
                  mb: 2,
                  // bgcolor: (theme) => alpha(plan.accent, 0.2),
                  background: `linear-gradient(45deg, ${alpha(plan.accent, 0.3)}, rgba(0,0,0,0.2))`,
                  color: 'text.primary',
                  border: '1px solid',
                  borderColor: (theme) => alpha(plan.accent, 0.35),
                  fontWeight: 500,
                  letterSpacing: 1.2,
                  position: 'relative',
                  width: 'fit-content',
                  py: 0.5,
                  px: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                }}
              >
                <Image
                  src={plan.icon}
                  alt={plan.badge}
                  width={20}
                  height={20}
                />
                {plan.badge}
              </Box>

              {/* Price */}
              <Typography
                sx={{
                  color: 'text.primary',
                  fontSize: '2.25rem',
                  fontWeight: 500,
                  mb: 1,
                }}
              >
                {plan.priceLabel}
              </Typography>
              <Typography sx={{ color: 'text.secondary', mb: 2 }}>
                {plan.id === 'hobby'
                  ? 'Great for personal use or a first step to explore the platform.'
                  : plan.id === 'pro'
                    ? 'Perfect for building and scaling models with limited context.'
                    : 'For large scale models with large and ever‑changing context.'}
              </Typography>

              <Button
                fullWidth
                sx={{
                  mt: 1,
                  mb: 2,
                  py: 1.3,
                  borderRadius: 999,
                  fontWeight: 600,
                  color: plan.id === 'pro' ? '#0A121D' : 'text.primary',
                  bgcolor:
                    plan.id === 'pro'
                      ? 'rgba(255,255,255,0.85)'
                      : 'action.disabledBackground',
                  '&:hover': {
                    bgcolor:
                      plan.id === 'pro'
                        ? 'rgba(255,255,255,0.95)'
                        : 'background.default',
                  },
                }}
              >
                {t(plan.cta)}
              </Button>

              {/* <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.08)' }} /> */}

              <Stack spacing={2} mt={2}>
                {plan.features.map((f, idx) => (
                  <Stack
                    key={idx}
                    direction="row"
                    spacing={1}
                    alignItems="flex-start"
                  >
                    <Iconify
                      icon="akar-icons:circle-check"
                      sx={{ color: 'text.disabled', mt: '2px' }}
                    />
                    <Typography sx={{ color: 'text.secondary' }}>
                      {f}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Dedicated Support Add-on */}
      <Grid container sx={{ width: '100%', mt: 3 }}>
        <Grid
          item
          xs={12}
          md={8}
          sx={{
            p: 1,
            borderStartStartRadius: '16px',
            borderEndStartRadius: { xs: 0, md: '16px' },
            borderStartEndRadius: { xs: '16px', md: 0 },
            bgcolor: 'rgba(27, 27, 27, 0.9)',
          }}
        >
          <Box
            sx={{
              p: 3,
              borderRadius: 1,
              border: '1px solid rgba(255,255,255,0.08)',
              backgroundImage:
                'radial-gradient(600px 300px at 70% 50%, rgba(11, 37, 48, 1), transparent 50%)',
              height: '100%',
            }}
          >
            <Typography
              sx={{
                color: 'text.primary',
                fontWeight: 700,
                fontSize: { xs: '1.5rem', md: '1.8rem' },
                mb: 1.5,
              }}
            >
              {t('Dedicated Support')}
            </Typography>
            <Typography
              sx={{
                color: 'text.secondary',
                mb: 3,
                opacity: 0.8,
                fontWeight: 400,
              }}
            >
              {t(
                'We are here to help get you started with a dedicated support engineer who can assist with scoping your first models and getting them deployed.',
              )}
            </Typography>

            <Typography
              sx={{
                color: 'text.secondary',
                fontSize: 12,
                letterSpacing: 1.2,
                mb: 3,
              }}
            >
              {t("WHAT'S INCLUDED")}
            </Typography>

            <Grid container spacing={3}>
              {[0, 1].map((col) => (
                <Grid item xs={12} sm={6} key={col}>
                  <Stack spacing={2.5}>
                    {dedicatedIncluded
                      .filter((_, i) => i % 2 === col)
                      .map((line) => (
                        <Stack
                          key={line}
                          direction="row"
                          spacing={1}
                          alignItems="flex-start"
                        >
                          <Iconify
                            icon="akar-icons:circle-check"
                            sx={{ color: 'text.disabled', mt: '2px' }}
                          />
                          <Typography sx={{ color: 'text.secondary' }}>
                            {t(line)}
                          </Typography>
                        </Stack>
                      ))}
                  </Stack>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Grid>

        <Grid
          item
          xs={12}
          md={4}
          sx={{
            p: 1,
            borderStartEndRadius: { xs: 0, md: '16px' },
            borderEndStartRadius: { xs: '16px', md: 0 },
            borderEndEndRadius: '16px',
            bgcolor: 'rgba(27, 27, 27, 0.9)',
          }}
        >
          <Box
            sx={{
              height: '100%',
              p: 3,
              borderRadius: 1,
              border: '1px solid rgba(255,255,255,0.08)',
              textAlign: 'center',
              backgroundImage:
                'radial-gradient(300px 300px at 50% 50%, rgba(136,108,255,.25), transparent 60%)',
            }}
          >
            <Box
              sx={{
                width: 'fit-content',
                mb: 2,
                py: 0.5,
                px: 1,
                mx: 'auto',
                borderRadius: 9999,
                bgcolor: 'rgba(255,255,255,0.08)',
                background:
                  'linear-gradient(45deg, rgba(255, 255, 255, 0.15), rgba(0,0,0,0.2))',
                color: 'text.secondary',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                border: '1px solid #B097F833',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 9999,
                  width: 20,
                  height: 20,
                  background: 'linear-gradient(#B097F8, #7A58DD)',
                  color: 'white',
                  border: '1px solid #B097F8',
                }}
              >
                +
              </Box>
              {t('ADD ON')}
            </Box>
            <Typography
              sx={{ color: 'text.primary', fontWeight: 500, fontSize: '2rem' }}
            >
              $750
            </Typography>
            <Typography sx={{ color: 'text.secondary', mb: 2 }}>
              {t('monthly')}
            </Typography>

            <Button
              fullWidth
              sx={{
                py: 1.1,
                borderRadius: 999,
                bgcolor: 'rgba(255,255,255,0.85)',
                color: '#0A121D',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.95)' },
              }}
            >
              {t('Request Access')}
            </Button>

            <Typography
              sx={{
                color: 'text.secondary',
                mt: 1,
                fontSize: 12,
                fontWeight: 400,
                textAlign: 'start',
              }}
            >
              {t('No long term contract obligation.')}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default PricingPageSection;
