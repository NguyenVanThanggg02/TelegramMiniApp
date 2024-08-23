/**
 *
 * @param {text} text
 * @returns domain from text (that only allows letters, numbers, and underscores)
 * Example:
 * - Input: Xin chào, tôi là developer!
 * - Output: xin_chao_toi_la_developer
 */
export const textToDomain = (text: string): string => {
  // REGEX only allows letters, numbers, and underscores
  const regex = /[^a-zA-Z0-9_]/g;
  const cleanText = text.toLowerCase().replace(" ", "_");
  return cleanText
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(regex, "");
};

