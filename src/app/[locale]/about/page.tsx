import React from "react"
import StaticPage from "@/sections/StaticPage/StaticPage";
import getStaticPage from "@/api/static-page/getStaticPage";
import getStaticPageMetaData from "@/utils/getStaticPageMetaData";

export async function generateMetadata() {
    const {page} = await getStaticPage("about")

    return getStaticPageMetaData(page);

}


export default async function PrivacyPolicyPage() {
    const {page} = await getStaticPage("about")

    return <StaticPage page={page}/>;
}
