"use client";

export default function FormInput({ label, id, value, onChange, type="text", placeholder, error, ...rest }) {
  return (
    <div style={{marginBottom: "0.75rem"}}>
      {label && <label htmlFor={id} style={{display:"block", marginBottom: "0.25rem"}}>{label}</label>}
      <input
        id={id}
        type={type}
        value={value ?? ""}
        onChange={e => onChange && onChange(e.target.value)}
        placeholder={placeholder}
        {...rest}
        style={{
          width: "100%",
          padding: "0.5rem 0.6rem",
          border: error ? "1px solid #ff4d4f" : "1px solid #d9d9d9",
          borderRadius: 6,
          outline: "none"
        }}
      />
      {error && <div style={{color: "#ff4d4f", marginTop: 6, fontSize: 13}}>{error}</div>}
    </div>
  );
}
