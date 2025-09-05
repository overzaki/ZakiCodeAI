import type { Metadata } from 'next';
import React from 'react';
import { notFound } from 'next/navigation';
import AppContext from '@/context/appContext';
import { routing } from '@/i18n/routing';
import { getMessages, getTranslations } from 'next-intl/server';
import ProtectedRoute from '@/components/ProtectedRoute';
import '../../[locale]/globals.css';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return {
    title: {
      default: t('zakicode'),
      template: `${t('zakicode')} - %s`,
    },
    description: 'Editor',
  };
}

export default async function EditorGroupLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <AppContext messages={messages} locale={locale}>
          {/* <ProtectedRoute requireAuth={true}> */}
          {children}
          {/* </ProtectedRoute> */}
        </AppContext>
      </body>
    </html>
  );
}
