'use client';

import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Stack,
  Grid,
  LinearProgress,
  alpha,
  Link as MUILink,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useSettingsContext } from '@/components/settings';
import Iconify from '@/components/iconify';
import { Link } from '@/i18n/routing';

const UsagePageSection = () => {
  const t = useTranslations();
  const { themeDirection } = useSettingsContext();

  // Fake data (replace with API later)
  const usage = useMemo(
    () => ({
      billingPeriod: {
        from: 'Nov 15, 2025',
        to: 'Dec 15, 2025',
        resetOn: 'Dec 15, 2025',
      },
      monthlyMessages: { used: 2, limit: 25, unit: 'Messages' },
      dailyMessages: { used: 0, limit: 25, unit: 'Messages' },
      integrationCredit: { used: 5, limit: 500, unit: 'Credits' },
      dailyUsage: [
        // simple series (day label, value)
        // { label: 'Nov 11', value: 0 },
        // { label: 'Nov 12', value: 0 },
        // { label: 'Nov 13', value: 0 },
        { label: 'Nov 14', value: 0.4 },
        { label: 'Nov 15', value: 1.6 },
      ],
      dailyMax: 2, // y-axis max reference
    }),
    [],
  );

  const percent = (used: number, limit: number) =>
    Math.min(100, Math.round((used / limit) * 100));
  const remaining = (used: number, limit: number) => Math.max(0, limit - used);

  const ProgressRow = (props: {
    title: string;
    data: { used: number; limit: number; unit: string };
    barColor?: string;
  }) => {
    const p = percent(props.data.used, props.data.limit);
    return (
      <Box sx={{ mb: 3 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 0.5 }}
        >
          <Typography sx={{ color: 'text.primary', fontWeight: 600 }}>
            {props.title}
          </Typography>
          <Typography sx={{ color: 'text.secondary' }}>
            {props.data.used}/{props.data.limit}
          </Typography>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={p}
          sx={{
            height: 6,
            borderRadius: 999,
            bgcolor: alpha('#ffffff', 0.08),
            '& .MuiLinearProgress-bar': {
              borderRadius: 999,
              background: (theme) =>
                `linear-gradient(90deg, ${theme.palette.info.main}, ${theme.palette.primary.main})`,
            },
          }}
        />
        <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.75 }}>
          <Typography sx={{ color: 'text.secondary', fontSize: 12 }}>
            {p}% {t('Used')}
          </Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: 12 }}>
            {remaining(props.data.used, props.data.limit)}{' '}
            {t(`${props.data.unit} Remaining`)}
          </Typography>
        </Stack>
      </Box>
    );
  };

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
            {t('Usage')}
          </Typography>
          <MUILink
            // <Typography
            component={Link}
            href={'pricing'}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              textTransform: 'none',
              color: 'primary.main',
            }}
          >
            <Iconify icon="tabler:credit-card" />
            {t('See Pricing')}
          </MUILink>
        </Stack>
      </Box>

      {/* Usage Grid */}
      <Grid container spacing={2.5} sx={{ width: '100%' }}>
        {/* Current Usage */}
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              height: '100%',
              minHeight: '200px',
              p: 3,
              borderRadius: 3,
              // bgcolor: 'rgba(255,255,255,0.03)',
              bgcolor: 'background.paper',
              border: '1px solid rgba(255,255,255,0.08)',
              // backgroundImage:
              //   'radial-gradient(1000px 400px at 0% 0%, rgba(27, 251, 182, .12), transparent 60%)',
            }}
          >
            <Typography sx={{ color: 'text.primary', fontWeight: 700, mb: 2 }}>
              {t('Current Usage')}
            </Typography>

            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ color: 'text.secondary', mb: 1.5 }}
            >
              <Iconify icon="solar:calendar-bold" />
              <Typography sx={{ fontSize: 14 }}>
                {t('Current Billing Period')}:
              </Typography>
              <Typography sx={{ fontSize: 14, color: 'text.primary' }}>
                {usage.billingPeriod.from} - {usage.billingPeriod.to}
              </Typography>
            </Stack>
            <Typography sx={{ color: 'text.secondary', fontSize: 12, mb: 2 }}>
              {t('Credits Will Reset On')} {usage.billingPeriod.resetOn}
            </Typography>

            <ProgressRow
              title={t('Monthly Messages')}
              data={usage.monthlyMessages}
            />
            <ProgressRow
              title={t('Daily Messages')}
              data={usage.dailyMessages}
            />
            <ProgressRow
              title={t('Integration Credit')}
              data={usage.integrationCredit}
            />
          </Box>
        </Grid>

        {/* Daily Usage Chart */}
        <Grid item xs={12} md={6} sx={{ minHeight: '400px' }}>
          <Box
            sx={{
              height: '100%',
              minHeight: '200px',
              p: 3,
              borderRadius: 3,
              // bgcolor: 'rgba(255,255,255,0.03)',
              bgcolor: 'background.paper',
              border: '1px solid rgba(255,255,255,0.08)',
              // backgroundImage:
              //   'radial-gradient(900px 350px at 100% 0%, rgba(109,162,255,.15), transparent 60%)',
            }}
          >
            <Typography sx={{ color: 'text.primary', fontWeight: 700, mb: 2 }}>
              {t('Daily Usage (Messages)')}
            </Typography>

            <Box
              sx={{
                position: 'relative',
                height: '100%',
                borderRadius: 2,
                overflow: 'hidden',
                // bgcolor: 'rgba(255,255,255,0.02)',
                // horizontal grid lines
                // backgroundImage:
                //   'repeating-linear-gradient(to bottom, rgba(255,255,255,0.06) 0 1px, transparent 1px 44px)',
              }}
            >
              {/* bars */}
              <Stack
                direction="row"
                justifyContent="space-around"
                alignItems="flex-end"
                sx={{ position: 'absolute', inset: 0, px: 3, pb: 6 }}
              >
                {usage.dailyUsage.map((d) => {
                  const h = Math.max(4, (d.value / usage.dailyMax) * 160);
                  return (
                    <Stack
                      key={d.label}
                      alignItems="center"
                      spacing={1}
                      sx={{ height: '100%', justifyContent: 'flex-end' }}
                    >
                      <Box
                        sx={{
                          width: 46,
                          height: h,
                          borderStartEndRadius: '10px',
                          borderStartStartRadius: '10px',
                          background: (theme) =>
                            `linear-gradient(180deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                          boxShadow: '0 6px 24px rgba(27,251,182,.2)',
                        }}
                      />
                      <Typography
                        sx={{ color: 'text.secondary', fontSize: 12 }}
                      >
                        {d.label}
                      </Typography>
                    </Stack>
                  );
                })}
              </Stack>

              {/* y-axis labels */}
              <Stack
                sx={{ position: 'absolute', left: 8, top: 10, height: '80%' }}
                justifyContent="space-between"
                spacing={5}
              >
                {[
                  usage.dailyMax,
                  usage.dailyMax * 0.75,
                  usage.dailyMax * 0.5,
                  usage.dailyMax * 0.25,
                  0,
                ].map((n) => (
                  <Typography
                    key={n}
                    sx={{ color: 'text.secondary', fontSize: 12 }}
                  >
                    {Number(n).toFixed(1)}
                  </Typography>
                ))}
              </Stack>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default UsagePageSection;
