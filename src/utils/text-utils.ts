/**
 * Removes emojis from a given string.
 * @param text The input string potentially containing emojis.
 * @returns The string with emojis removed.
 */
export function removeEmojis(text: string): string {
  const emojiRegex =
    /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g;
  return text
    .replace(emojiRegex, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function removeEmojisPreserveSpaces(text: string): string {
  const emojiRegex =
    /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g;
  return text.replace(emojiRegex, '');
}
