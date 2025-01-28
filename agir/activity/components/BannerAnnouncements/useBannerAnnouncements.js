import useSWR from "swr";
import axios from "@agir/lib/utils/axios";


export const useActiveBannerAnnouncement = () =>
    useSWR("/api/activite/bannerannouncements/")

export const answerToBannerAnnouncement = (announcementId, answerId) =>
    axios.put(`/api/activite/bannerannouncements/${announcementId}/answer/${answerId}`)

export const closeBannerAnnouncement = (announcementId) => axios.get(`/api/activite/bannerannouncements/${announcementId}/close`)