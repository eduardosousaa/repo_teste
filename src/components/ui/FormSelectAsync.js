"use client";

import React, { useState, useEffect } from "react";

export default function FormSelectAsync({ id, label, value, onChange, fetchOptions, placeholder="Buscar...", debounceMs=300, error }) {
  const [q, setQ] = useState("");
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!fetchOptions) return;
      setLoading(true);
      fetchOptions(q).then(res => {
        setOptions(res || []);
        setLoading(false);
      }).catch(() => setLoading(false));
    }, debounceMs);

    return () => clearTimeout(t);
  }, [q, fetchOptions, debounceMs]);

  return (
    <div style={{marginBottom: "0.75rem"}}>
      {label && <label htmlFor={id} style={{display:"block", marginBottom: "0.25rem"}}>{label}</label>}

      <input
        id={`${id ?? "async"}-search`}
        value={q}
        onChange={e => setQ(e.target.value)}
        placeholder={placeholder}
        style={{width:"100%", padding:"0.45rem", borderRadius:6, border:"1px solid #d9d9d9", marginBottom:6}}
      />

      <select
        id={id}
        value={value ?? ""}
        onChange={e => onChange && onChange(e.target.value)}
        style={{width:"100%", padding:"0.45rem", borderRadius:6, border: error ? "1px solid #ff4d4f" : "1px solid #d9d9d9"}}
      >
        <option value="">{loading ? "Carregando..." : "Selecione"}</option>
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>

      {error && <div style={{color:"#ff4d4f", marginTop:6, fontSize:13}}>{error}</div>}
    </div>
  );
}
