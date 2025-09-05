export interface ISocialMediaIcon {
    icon: any
    href: string
}

export interface IFooterMenuItem {
    category: string
    items: {
        label: string,
        href: string
    }[]
}