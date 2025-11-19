export const toId = (val) => {
  if (!val) return null;
  if (typeof val === "object") {
    return val.id ?? val.value ?? null;
  }
  return val;
};

export const toIdArray = (arr) => {
  if (!Array.isArray(arr)) return [];
  return arr
    .map((v) => toId(v))
    .filter((v) => v != null);
};