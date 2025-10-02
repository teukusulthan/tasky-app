export const toNum = (s: string) => {
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};
