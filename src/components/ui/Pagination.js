"use client";

export default function Pagination({ page, setPage, totalPages }) {
  const prev = () => setPage(Math.max(1, page - 1));
  const next = () => setPage(Math.min(totalPages, page + 1));

  if (totalPages <= 1) return null;

  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div style={{display:"flex", gap:8, alignItems:"center", marginTop:12}}>
      <button onClick={prev} disabled={page === 1}>Anterior</button>
      {start > 1 && <button onClick={() => setPage(1)}>1</button>}
      {start > 2 && <span>...</span>}
      {pages.map(p => (
        <button key={p} onClick={() => setPage(p)} style={{fontWeight: p === page ? "700" : "400"}}>{p}</button>
      ))}
      {end < totalPages - 1 && <span>...</span>}
      {end < totalPages && <button onClick={() => setPage(totalPages)}>{totalPages}</button>}
      <button onClick={next} disabled={page === totalPages}>Próximo</button>
    </div>
  );
}
