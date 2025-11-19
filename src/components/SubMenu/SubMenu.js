"use client";

import React, { useState } from "react";

export default function SubMenu({ title, items = [] }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{marginBottom: 8}}>
      <button onClick={() => setOpen(s => !s)} style={{display:"flex", justifyContent:"space-between", width:"100%", padding: "0.5rem", borderRadius:6}}>
        <span>{title}</span>
        <span>{open ? "▾" : "▸"}</span>
      </button>
      {open && (
        <div style={{paddingLeft: 12, marginTop: 6}}>
          {items.map(it => <div key={it.href}><a href={it.href}>{it.label}</a></div>)}
        </div>
      )}
    </div>
  );
}
