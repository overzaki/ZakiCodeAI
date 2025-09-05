'use client';

import React, { ReactNode, useMemo } from 'react';
import ReduxProvider from '../redux/reduxProvider';
import MotionLazy from 'src/components/animate/motion-lazy';
import { SettingsProvider } from '@/components/settings/context';
import ThemeProvider from '@/theme';
import { SnackbarProvider } from '@/components/snackbar';
import { LoadingContextProvider } from '@/context/LoadingProvider/loadingContext';
import { AbstractIntlMessages, NextIntlClientProvider } from 'next-intl';

const AppContextsContext = React.createContext<any>({});

/**
 * يصلّح مفاتيح رسائل next-intl التي تحتوي نقطة "." (غير مسموح)
 * نستبدل النقطة برمز "·" أو أي حرف آمن.
 * ملاحظة: لو عندك استدعاءات t('a.b') لازم تغيّري المفتاح بنفس الاستبدال،
 * أو استخدمي نهج "التعشيش" بدل المفاتيح بالنقاط.
 */
function fixNextIntlKeys(messages: Record<string, any>): Record<string, any> {
  if (!messages || typeof messages !== 'object' || Array.isArray(messages)) return messages as any;
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(messages)) {
    const safeKey = k.replace(/\./g, '·');
    out[safeKey] =
      v && typeof v === 'object' && !Array.isArray(v) ? fixNextIntlKeys(v as Record<string, any>) : v;
  }
  return out;
}

const AppContext = ({
  children,
  messages,
  locale
}: {
  children: ReactNode;
  messages: AbstractIntlMessages;
  locale: string;
}) => {
  // طبّق التصحيح مرة واحدة لكل تغيّر في الرسائل
  const safeMessages = useMemo(
    () => (messages ? (fixNextIntlKeys(messages as any) as AbstractIntlMessages) : ({} as AbstractIntlMessages)),
    [messages]
  );

  return (
    <AppContextsContext.Provider value={{}}>
      <ReduxProvider>
        <NextIntlClientProvider
          messages={safeMessages}
          locale={locale}
          // اختياري: منع رمي الأخطاء إلى الكونسول
          onError={() => undefined}
        >
          <SettingsProvider
            defaultSettings={{
              themeMode: 'dark', // 'light' | 'dark'
              themeSound: 'on', // 'on' | 'off'
              themeSoundType: 'single', // 'single' | 'continuous'
              themeDirection: locale === 'ar' ? 'rtl' : 'ltr', //  'rtl' | 'ltr'
              themeContrast: 'bold', // 'default' | 'bold'
              themeLayout: 'vertical', // 'vertical' | 'horizontal' | 'mini'
              themeColorPresets: 'default', // 'default' | 'cyan' | 'purple' | 'blue' | 'orange' | 'red'
              themeStretch: true
            }}
          >
            <ThemeProvider>
              <MotionLazy>
                <SnackbarProvider>
                  <LoadingContextProvider>{children}</LoadingContextProvider>
                </SnackbarProvider>
              </MotionLazy>
            </ThemeProvider>
          </SettingsProvider>
        </NextIntlClientProvider>
      </ReduxProvider>
    </AppContextsContext.Provider>
  );
};

export default AppContext;
