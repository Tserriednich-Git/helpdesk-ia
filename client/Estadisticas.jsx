const ESTADOS = [
    { valor: "abierto", texto: "Abierto", color: "#3b82f6" },
    { valor: "en_proceso", texto: "En proceso", color: "#f59e0b" },
    { valor: "resuelto", texto: "Resuelto", color: "#22c55e" },
  ];
  
  const CATEGORIAS = ["red", "hardware", "software", "cuentas", "otros"];
  
  function Barra({ etiqueta, cantidad, total, color }) {
    const porcentaje = total > 0 ? Math.round((cantidad / total) * 100) : 0;
    return (
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
          <span>{etiqueta}</span>
          <span>
            {cantidad} ({porcentaje}%)
          </span>
        </div>
        <div style={{ background: "#e5e7eb", borderRadius: 999, height: 10 }}>
          <div
            style={{ width: `${porcentaje}%`, background: color, height: 10, borderRadius: 999 }}
          />
        </div>
      </div>
    );
  }
  
  export default function Estadisticas({ tickets }) {
    const total = tickets.length;
    const sinCategoria = tickets.filter((t) => !t.category).length;
  
    return (
      <div className="tarjeta">
        <h2>Resumen</h2>
        <p style={{ marginTop: 0 }}>
          Total de tickets: <strong>{total}</strong>
        </p>
  
        <h3>Por estado</h3>
        {ESTADOS.map((e) => (
          <Barra
            key={e.valor}
            etiqueta={e.texto}
            cantidad={tickets.filter((t) => t.status === e.valor).length}
            total={total}
            color={e.color}
          />
        ))}
  
        <h3>Por categoría</h3>
        {CATEGORIAS.map((c) => (
          <Barra
            key={c}
            etiqueta={c}
            cantidad={tickets.filter((t) => t.category === c).length}
            total={total}
            color="#6366f1"
          />
        ))}
        {sinCategoria > 0 && (
          <Barra etiqueta="sin categoría" cantidad={sinCategoria} total={total} color="#9ca3af" />
        )}
      </div>
    );
  }