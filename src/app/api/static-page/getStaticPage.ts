"use server";

import {getLocale, getTranslations} from "next-intl/server";
import IStaticPageType from "@/api/static-page/interface";
import {HOST_API} from "@/api/shared/constants";

export default async function getStaticPage(slug: string): Promise<IStaticPageType> {
    const locale = await getLocale()
    const t = await getTranslations();

    const res = await fetch(`${HOST_API}/pages-admin/slug_tenant/${slug}`)
    const {data} = await res.json();

    const page = {
        metadataTitle: t(slug),
        title: data?.title?.[locale],
        content: data?.content?.[locale],
        description: data?.description?.[locale],
    }

    return {page}
}