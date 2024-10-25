
export const ENDPOINT = {
    getCalendar: "/api/agenda/",
    getCalendarEvents: "/api/evenements/agenda/"

}

export const getCalendarEndpointBySlug = (slug) => {
    return `${ENDPOINT['getCalendar']}${slug}`
}

export const getCalendarEventsEndpoint = (slug) => {
    return `${ENDPOINT['getCalendarEvents']}${slug}`
}