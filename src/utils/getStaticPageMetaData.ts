import {getTranslations} from "next-intl/server";

export default async function getStaticPageMetaData(page: any) {
    const t = await getTranslations();

    return {
        title: page.metadataTitle,
        description: `${t("zakicode")} - ` + page.description,
        openGraph: {
            title: page.metadataTitle,
            description: `${t("zakicode")} - ` + page.description,
        },
    }
}