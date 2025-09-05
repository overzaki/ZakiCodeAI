// @mui
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
// locales
// components
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { alpha, Button, Typography } from '@mui/material';
import { useSettingsContext } from '@/components/settings';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { allLangs, defaultLang } from '@/i18n/config-lang';

// ----------------------------------------------------------------------

export default function LanguageSwitcher() {
  const locale = useLocale();
  const settings = useSettingsContext();
  const popover = usePopover();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const currentLang =
    allLangs.find((lang) => lang.value === locale) || defaultLang;

  const handleChangeLang = async (newLang: string) => {
    popover.onClose();

    settings.onChangeDirectionByLang(newLang);
    const params = new URLSearchParams(searchParams.toString());

    const segments = pathname.split('/').filter(Boolean);
    segments[0] = newLang;
    const newPath = `/${segments.join('/')}`;

    router.replace(`${newPath}?${params.toString()}`);
  };

  return (
    <>
      <Button
        onClick={popover.onOpen}
        sx={{
          borderRadius: 9999,
          border: '1px solid',
          borderColor: (theme) => alpha(theme.palette.text.secondary, 0.5),
          px: 1.5,
          py: 1.2,
        }}
      >
        <Iconify
          icon={currentLang.icon}
          sx={{ borderRadius: 0.65, width: 28 }}
        />
        {/* <Iconify icon="ic:sharp-language" sx={{ color: 'text.secondary' }} /> */}
        <Typography
          sx={{
            color: 'text.primary',
            px: 1,
            fontWeight: '500',
            fontSize: '.9rem',
          }}
        >
          {/* {currentLang.label} */}
          {currentLang.shortLabel}
        </Typography>
        <Iconify icon="mingcute:down-fill" />
      </Button>

      <CustomPopover
        open={popover.open}
        hiddenArrow
        onClose={popover.onClose}
        sx={{ width: 160 }}
      >
        {allLangs.map((option) => (
          <MenuItem
            key={option.value}
            selected={option.value === currentLang.value}
            onClick={() => handleChangeLang(option.value)}
          >
            <Iconify
              icon={option.icon}
              sx={{ borderRadius: 0.65, width: 28 }}
            />

            {option.label}
          </MenuItem>
        ))}
      </CustomPopover>
    </>
  );
}
