import i18next from 'i18next';
import { initCloudStorage } from '@telegram-apps/sdk';
import global_en from '@/locales/en/global.json';
import global_vi from '@/locales/vi/global.json';

const cloudStorage = initCloudStorage();

const initializeI18n = async () => {
  try {
    const storageData = await cloudStorage.get(['language']);
    const storedLanguage = storageData['language'] || 'en'; 

    await i18next.init({
      interpolation: { escapeValue: false },
      lng: storedLanguage,
      fallbackLng: 'en',
      resources: {
        en: {
          global: global_en,
        },
        vi: {
          global: global_vi,
        },
      },
    });
  } catch (error) {
    console.error('Error initializing i18next:', error);
  }
};

export { initializeI18n };
