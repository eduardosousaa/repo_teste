export default function maskNumber(value = "") {
  return value.replace(/\D/g, ""); 
}

export function maskTime(value = "") {
  if (value == null) return "";
 
  let v = String(value).replace(/\D/g, "").slice(0, 4);

  const hh = v.slice(0, 2);
  let mm = v.slice(2, 4);

  if (mm.length >= 1 && Number(mm[0]) > 5) {
    mm = "5" + (mm[1] ?? "");
  }

  let h = hh;
  if (h.length === 2 && Number(h) > 23) h = "23";
  if (mm.length === 2 && Number(mm) > 59) mm = "59";

  if (mm.length > 0) return `${h}:${mm}`;
  return h; 
}

export function maskProcesso(value = "") {
  if (!value) return "";

  value = value.replace(/\D/g, "");

  value = value.replace(/^(\d{5})(\d)/, "$1.$2");
  value = value.replace(/^(\d{5}\.\d{5})(\d)/, "$1/$2");
  value = value.replace(/^(\d{5}\.\d{5}\/\d{4})(\d)/, "$1-$2");

  return value.substring(0, 21);
}