"use client";

export default function FormSelect({ id, label, value, onChange, options = [], placeholder="Selecione", error, ...rest }) {
  return (
    <div style={{marginBottom: "0.75rem"}}>
      {label && <label htmlFor={id} style={{display:"block", marginBottom: "0.25rem"}}>{label}</label>}
      <select
        id={id}
        value={value ?? ""}
        onChange={e => onChange && onChange(e.target.value)}
        {...rest}
        style={{width:"100%", padding:"0.5rem", borderRadius:6, border: error ? "1px solid #ff4d4f" : "1px solid #d9d9d9"}}
      >
        <option value="">{placeholder}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <div style={{color:"#ff4d4f", marginTop:6, fontSize:13}}>{error}</div>}
    </div>
  );
}
