export const timePeriodFormatter = (dateTime: string | Date, t: TFunction): string => {
  const currentTime = new Date();
  const targetTime = new Date(dateTime);

  const timeDifference = currentTime.getTime() - targetTime.getTime();
  const seconds = Math.floor(timeDifference / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${t("orderManagement.ago")}`;
  } else if (hours > 0) {
    return `${hours}h ${t("orderManagement.ago")}`;
  } else if (minutes > 0) {
    return `${minutes}m ${t("orderManagement.ago")}`;
  } else {
    return `${seconds}s ${t("orderManagement.ago")}`;
  }
};




import { TFunction } from 'i18next';

