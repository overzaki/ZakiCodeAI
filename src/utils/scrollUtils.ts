export const scrollToTop = (container: HTMLElement | null) => {
    container?.scrollTo({
        top: 0,
        behavior: 'smooth',
    });
};

export const scrollToBottom = (container: HTMLElement | null) => {
    if (container) {
        container.scrollTo({
            top: container.scrollHeight,
            behavior: 'smooth',
        });
    }
};

export const scrollToElement = (
    container: HTMLElement | null,
    element: HTMLElement,
    offset = 50
) => {
    if (container) {
        const elementRect = element.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        if (elementRect.top < containerRect.top) {
            // Element is above the visible area
            container.scrollTo({
                top: container.scrollTop - (containerRect.top - elementRect.top + offset),
                behavior: 'smooth',
            });
        } else if (elementRect.bottom > containerRect.bottom) {
            // Element is below the visible area
            container.scrollTo({
                top: container.scrollTop + (elementRect.bottom - containerRect.bottom + offset),
                behavior: 'smooth',
            });
        } else {
            // Element is within the visible area
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'start',
            });
        }
    }
};
