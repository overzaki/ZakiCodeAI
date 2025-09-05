import type {Metadata} from "next";
import "./globals.css";
import AppContext from "@/context/appContext";
import AppLayout from "@/sections/Layout/AppLayout";
import {notFound} from "next/navigation";
import {routing} from "@/i18n/routing";
import {getMessages, getTranslations} from "next-intl/server";

export async function generateMetadata() {
    const t = await getTranslations();

    return {
        title: {
            default: t("zakicode"),
            template: `${t("zakicode")} - %s`
        },
        description: 'Your AI-Powered App and Website Builder',
        openGraph: {
            title: {
                default: 'ZakiCode - Tool to build whatever you want',
                template: 'ZakiCode - %s'
            },
            description: 'Your AI-Powered App and Website Builder',
            images: [
                {
                    url: '/assets/Cover-Image.jpeg',
                    width: 800,
                    height: 600,
                    alt: 'Cover Image',
                },
            ],
        },
    }
};

export default async function RootLayout({
                                             children,
                                             params: {locale}
                                         }: Readonly<{
    children: React.ReactNode;
    params: { locale: string };
}>) {
    if (!routing.locales.includes(locale as any)) {
        notFound();
    }
    const messages = await getMessages();

    return (
        <html lang={locale}>
        <body>
        <AppContext messages={messages} locale={locale}>
            <AppLayout>
                {children}
            </AppLayout>
        </AppContext>
        </body>
        </html>
    );
}
