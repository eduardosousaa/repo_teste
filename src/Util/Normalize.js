
export const stripDiacritics = (s = "") =>
  String(s).normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export const normalizeText = (s = "") =>
  stripDiacritics(String(s).trim()).toUpperCase();