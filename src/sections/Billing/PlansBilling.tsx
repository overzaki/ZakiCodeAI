'use client';

import * as React from 'react';
import {
  Box, Stack, Typography, Paper, Button, LinearProgress, Divider, Alert, List, ListItem, ListItemIcon, ListItemText,
} from '@mui/material';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import LogoMark from '@/shared-components/Logo/LogoMark';
import WorkspaceSidebar from '@/sections/Workspace/Sidebar';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';

const palette = {
  pageBase: '#0b2c32',
  glow: 'rgba(56, 245, 209, 0.14)',
  cardFrom: 'rgba(12, 49, 56, 0.92)',
  cardTo: 'rgba(9, 42, 49, 0.92)',
  line: 'rgba(56, 245, 209, 0.22)',
  text: '#eaf8f9',
  subtext: 'rgba(234, 248, 249, .8)',
};

function SectionBG() {
  return (
    <Box aria-hidden sx={{
      position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
      background: `
        radial-gradient(1200px 800px at 70% 10%, rgba(56,245,209,.14), transparent 60%),
        radial-gradient(900px 700px at 25% 80%, rgba(14,165,233,.16), transparent 55%),
        radial-gradient(1600px 1200px at 50% 50%, #0b2c32, #0a2a31 65%, #0a2730 100%)
      `,
      filter: 'saturate(1.05)',
    }} />
  );
}

function ShellCard({ children, sx }: React.PropsWithChildren<{ sx?: any }>) {
  return (
    <Paper elevation={0} sx={{
      p: 2.5, borderRadius: 3, color: palette.text,
      background: `linear-gradient(180deg, ${palette.cardFrom}, ${palette.cardTo})`,
      backdropFilter: 'blur(8px)', border: `1px solid ${palette.line}`, ...sx,
    }}>
      {children}
    </Paper>
  );
}

function FeatureList({ items }: { items: string[] }) {
  return (
    <List dense sx={{ color: palette.subtext }}>
      {items.map((it, i) => (
        <ListItem key={i} sx={{ py: 0.3 }}>
          <ListItemIcon sx={{ minWidth: 28 }}>
            <CheckRoundedIcon fontSize="small" sx={{ color: '#82ffd8' }} />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontSize: 14 }} primary={it} />
        </ListItem>
      ))}
    </List>
  );
}

const PlanCard = ({
  title, price, cta, features, secondary, href,
}: {
  title: string; price?: string; cta: string; features: string[]; secondary?: boolean; href?: string;
}) => (
  <ShellCard sx={{ flex: 1, minWidth: 280, ...(secondary && { opacity: .95 }) }}>
    <Typography variant="h6" sx={{ fontWeight: 800, mb: .5 }}>{title}</Typography>
    {price ? (
      <Stack direction="row" alignItems="baseline" spacing={.5} sx={{ mb: 1.5 }}>
        <Typography sx={{ fontSize: 34, fontWeight: 800 }}>{price}</Typography>
        <Typography sx={{ opacity: .85 }}>per month</Typography>
      </Stack>
    ) : <Box height={24} />}

    <Button
      component={href ? (Link as any) : 'button'}
      href={href}
      fullWidth
      variant="contained"
      endIcon={<ArrowForwardRoundedIcon />}
      sx={{
        mt: 1, mb: 1.5, py: 1.05, fontWeight: 800, borderRadius: 9999, textTransform: 'none',
        background: 'linear-gradient(90deg, #0EE5F9 0%, #1EFBB8 100%)',
        color: '#08262b', boxShadow: '0 8px 24px rgba(14,165,233,.24), inset 0 0 0 1px rgba(255,255,255,.05)',
        '&:hover': { filter: 'brightness(1.04)' },
      }}
    >
      {cta}
    </Button>

    <Divider sx={{ borderColor: palette.line, my: 1.2 }} />
    <FeatureList items={features} />
  </ShellCard>
);

/* ================== تحميل الخطط من Supabase (واختيار الأرخص لكل Tier) ================== */
type DBPlan = {
  id: string;
  tier: 'free'|'pro'|'business'|'enterprise';
  name: string;
  monthly_credits: number | null;
  price_monthly_cents: number | null;
  price_annual_cents: number | null;
  features: string[];
  order_index: number;
};

function usePlans() {
  const [plans, setPlans] = React.useState<DBPlan[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('billing_plans')
        .select('id,tier,name,monthly_credits,price_monthly_cents,price_annual_cents,features,order_index')
        .eq('is_active', true);

      if (!mounted) return;
      if (error) {
        setError(error.message);
        setPlans([]);
      } else {
        setPlans((data as DBPlan[]).sort((a,b) => a.order_index - b.order_index));
      }
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  const pickCheapest = React.useCallback(
    (tier: DBPlan['tier']) => {
      const arr = (plans || []).filter(p => p.tier === tier && p.price_monthly_cents != null);
      if (!arr.length) return null;
      return arr.reduce((min, p) =>
        (min == null || (p.price_monthly_cents! < min.price_monthly_cents!)) ? p : min, null as DBPlan | null);
    },
    [plans]
  );

  const free       = (plans || []).find(p => p.tier === 'free') || null;
  const enterprise = (plans || []).find(p => p.tier === 'enterprise') || null;
  const proBest    = pickCheapest('pro');
  const bizBest    = pickCheapest('business');

  return { loading, error, free, proBest, bizBest, enterprise, hasAny: (plans?.length||0) > 0 };
}

/* ================== واجهة الزائر (بطاقات مختصرة فقط) ================== */
function PublicPricing({ t }: { t: any }) {
  const { loading, error, free, proBest, bizBest, enterprise, hasAny } = usePlans();

  if (loading) return (
    <Stack spacing={2} sx={{ p: 3, maxWidth: 1280, mx: 'auto' }}>
      <LinearProgress />
    </Stack>
  );

  if (error) return (
    <Stack spacing={2} sx={{ p: 3, maxWidth: 1280, mx: 'auto' }}>
      <Alert severity="error">{error}</Alert>
    </Stack>
  );

  if (!hasAny) return (
    <Stack spacing={2} sx={{ p: 3, maxWidth: 1280, mx: 'auto' }}>
      <Alert severity="warning">No active plans found in database.</Alert>
    </Stack>
  );

  const priceFmt = (cents: number | null | undefined) =>
    cents == null ? undefined : `$${(cents/100).toLocaleString()}`;

  // ملاحظات الميزات العامة لكل Tier (مثل صورة Lovable)
  const proCommon = [
    `${proBest?.monthly_credits?.toLocaleString() ?? 100} monthly credits`,
    'Workspace collaboration with unlimited members',
    'Workspace roles and permissions',
    'Private projects',
    'Custom domains',
    'Remove "Edit with ZakiCode" badge',
    'Code mode',
  ];
  const bizCommon = [
    `${bizBest?.monthly_credits?.toLocaleString() ?? 200} monthly credits`,
    '5 daily credits (up to 150/month)', // سطر تسويقي مطابق للّقطة
    'SSO',
    'Personal Projects',
    'Opt out of data training',
    'Design templates',
  ];

  return (
    <Stack spacing={2.5} sx={{ position:'relative', zIndex:1, p:{xs:2,md:3}, maxWidth:1280, mx:'auto', textAlign:'center' }}>
      <Box>
        <Box sx={{ display:'grid', placeItems:'center', mb:1 }}><LogoMark size={40} /></Box>
        <Typography variant="h5" sx={{ fontWeight:800, mb:.5 }}>{t('pricing_title')}</Typography>
        <Typography sx={{ opacity:.85 }}>{t('pricing_sub')}</Typography>
      </Box>

      <Stack direction={{ xs:'column', md:'row' }} gap={2}>
        {free && (
          <PlanCard
            title={free.name}
            price={priceFmt(free.price_monthly_cents)}
            cta={t('get_started')}
            href="/signIn"
            features={free.features}
          />
        )}

        {/* بطاقة واحدة فقط للـ Pro (أرخص باقة) */}
        {proBest && (
          <PlanCard
            title={proBest.name.replace(/^Pro\s.*/,'Pro')}
            price={priceFmt(proBest.price_monthly_cents)}
            cta={t('get_started')}
            href="/signIn"
            features={proCommon}
          />
        )}

        {/* بطاقة واحدة فقط للـ Business (أرخص باقة) */}
        {bizBest && (
          <PlanCard
            title={bizBest.name.replace(/^Business\s.*/,'Business')}
            price={priceFmt(bizBest.price_monthly_cents)}
            cta={t('get_started')}
            href="/signIn"
            features={bizCommon}
          />
        )}

        {enterprise && (
          <PlanCard
            title={enterprise.name}
            cta={t('book_demo')}
            href="/contact"
            features={enterprise.features}
            secondary
          />
        )}
      </Stack>
    </Stack>
  );
}

/* ================== واجهة المستخدِم المُسجّل (مبسطة الآن) ================== */
function AuthedView({ t, isAuthenticated }: { t:any; isAuthenticated:boolean }) {
  return (
    <Stack direction="row" gap={2} sx={{ position:'relative', zIndex:1, p:{xs:2,md:3}, maxWidth:1280, mx:'auto' }}>
      <Box sx={{ width:260, display:{ xs:'none', md:'block' }, alignSelf:'flex-start' }}>
        <WorkspaceSidebar t={t as any} active="billing" showPeople={isAuthenticated} />
      </Box>
      <Stack spacing={2} sx={{ flex:1 }}>
        <Typography variant="h5" sx={{ fontWeight:800 }}>{t('title')}</Typography>
        <ShellCard>
          <Typography sx={{ opacity:.85 }}>
            {t('you_are_on')} — {t('browse_plans_below')}
          </Typography>
        </ShellCard>
        {/* بإمكانك لاحقاً استبدال PublicPricing بواجهة “الخطط التفصيلية مع القوائم المنسدلة” */}
        <PublicPricing t={t} />
      </Stack>
    </Stack>
  );
}

/* ================== الصفحة ================== */
export default function PlansBilling() {
  const t = useTranslations('billing');
  const { user } = useAuth();
  const isAuthenticated = !!user;

  return (
    <Box sx={{ position:'relative', minHeight:'100svh', overflow:'hidden', backgroundColor:palette.pageBase, color:palette.text }}>
      <SectionBG />
      {isAuthenticated ? <AuthedView t={t} isAuthenticated={isAuthenticated} /> : <PublicPricing t={t} />}
    </Box>
  );
}
