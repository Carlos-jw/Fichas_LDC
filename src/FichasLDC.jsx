import { useState, useRef } from "react";
import jsPDF from "jspdf";

// ─── Paleta azul ──────────────────────────────────────────────────────────
const C = {
  primary:     "#1a56db",
  primaryDark: "#1240a0",
  primaryBg:   "#eff6ff",
  primaryLight:"#bfdbfe",
  primaryText: "#1e3a5f",
  bg:          "#f0f4f8",
  border:      "#d1dde8",
  card:        "#ffffff",
  muted:       "#6b7a8d",
  mutedLight:  "#a0aec0",
};

// ─── Programa de mantenimiento ────────────────────────────────────────────
const MESES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

const PROGRAMA = [
  { id:1,  grupo:"A. Edificio",               tarea:"Control de plagas",          encargado:"Christian Serpa",               frecuencia:"Cada mes",  meses:[0,1,2,3,4,5,6,7,8,9,10,11] },
  { id:2,  grupo:"A. Edificio",               tarea:"Inspección estructural",      encargado:"Jairo Galvis",                  frecuencia:"2 meses",   meses:[0,2,5,8,10] },
  { id:3,  grupo:"A. Edificio",               tarea:"Inspección externa",          encargado:"Carlos Lopez (Fabian)",         frecuencia:"3 meses",   meses:[1,4,7,10] },
  { id:4,  grupo:"A. Edificio",               tarea:"Inspección interna",          encargado:"Carlos Lopez (Fabian)",         frecuencia:"2 meses",   meses:[0,2,4,6,8,10] },
  { id:5,  grupo:"A. Edificio",               tarea:"Mobiliario",                  encargado:"Hasert (Carlos Casas)",         frecuencia:"Cada mes",  meses:[0,1,2,3,4,5,6,7,8,9,10,11] },
  { id:6,  grupo:"A. Edificio",               tarea:"Puertas y ventanas",          encargado:"Will Herrera (Juan Cardenas)",  frecuencia:"2 meses",   meses:[0,2,4,6,8,10] },
  { id:7,  grupo:"A. Edificio",               tarea:"Cubiertas, canales",          encargado:"Adelson Mejia",                 frecuencia:"3 meses",   meses:[1,4,7,10] },
  { id:8,  grupo:"B. Sistemas eléctricos",    tarea:"Sistema de seguridad",        encargado:"Demetrio (Reflectores)",        frecuencia:"Cada mes",  meses:[0,1,2,3,4,5,6,7,8,9,10,11] },
  { id:9,  grupo:"B. Sistemas eléctricos",    tarea:"Electricidad",                encargado:"Demetrio Hoyos",                frecuencia:"3 meses",   meses:[0,3,6,9] },
  { id:10, grupo:"B. Sistemas eléctricos",    tarea:"Sistema de audio y video",    encargado:"Luis Robles & Julián Toro",     frecuencia:"2 meses",   meses:[1,3,5,7,9,11] },
  { id:11, grupo:"C. Equipos y herramientas", tarea:"Equipos y herramientas",      encargado:"Naren Herrera (Giovanny)",      frecuencia:"Cada mes",  meses:[0,1,2,3,4,5,6,7,8,9,10,11] },
  { id:12, grupo:"D. Exteriores",             tarea:"Paisajismo",                  encargado:"Edilberto Cantillo (Snader)",   frecuencia:"Cada mes",  meses:[0,1,2,3,4,5,6,7,8,9,10,11] },
  { id:13, grupo:"E. Seguridad",              tarea:"Atención de emergencias",     encargado:"Adanies Vanegas",               frecuencia:"3 meses",   meses:[1,4,7,10] },
  { id:14, grupo:"E. Seguridad",              tarea:"Inspección de sismo",         encargado:"Comité de Mantenimiento",       frecuencia:"Si ocurre", meses:[] },
  { id:15, grupo:"F. Sistemas mecánicos",     tarea:"Ventilación y aire acond.",   encargado:"Carlos Cortez",                 frecuencia:"3 meses",   meses:[0,3,6,9] },
  { id:16, grupo:"F. Sistemas mecánicos",     tarea:"Baños y accesorios",          encargado:"Julián Zapata",                 frecuencia:"2 meses",   meses:[0,2,4,6,8,10] },
  { id:17, grupo:"F. Sistemas mecánicos",     tarea:"Sistema de aguas residuales", encargado:"Jaime Villeros (Pedro Utria)",  frecuencia:"3 meses",   meses:[1,4,7,10] },
  { id:18, grupo:"F. Sistemas mecánicos",     tarea:"Tanques",                     encargado:"n/a",                           frecuencia:"3 meses",   meses:[0,3,6,9] },
];

const GRUPOS = [...new Set(PROGRAMA.map(p => p.grupo))];

const GRUPO_COLOR = {
  "A. Edificio":               "#1a56db",
  "B. Sistemas eléctricos":    "#0369a1",
  "C. Equipos y herramientas": "#0f766e",
  "D. Exteriores":             "#15803d",
  "E. Seguridad":              "#b91c1c",
  "F. Sistemas mecánicos":     "#6d28d9",
};

const ESTADO_CONFIG = {
  BIEN:     { label:"Bien",     color:"#15803d", bg:"#dcfce7", dot:"#22c55e", icon:"✓" },
  ATENCION: { label:"Atención", color:"#b45309", bg:"#fef3c7", dot:"#f59e0b", icon:"!" },
  CRITICO:  { label:"Crítico",  color:"#b91c1c", bg:"#fee2e2", dot:"#ef4444", icon:"✕" },
};

const ROLES = ["Anciano","Siervo ministerial","Voluntario","Entrenador de mantenimiento","Otro"];
const mesActual = new Date().getMonth();

const formatFecha = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString("es-CO",{day:"2-digit",month:"short",year:"numeric"}) +
    " · " + d.toLocaleTimeString("es-CO",{hour:"2-digit",minute:"2-digit"});
};

// ─── Generar PDF ──────────────────────────────────────────────────────────
async function generarPDF(ficha) {
  const cfg = ESTADO_CONFIG[ficha.estado];
  const doc = new jsPDF({ unit:"mm", format:"a4" });
  const W = 210, margen = 18, ancho = W - margen * 2;
  let y = 18;

  // Encabezado azul
  doc.setFillColor(26, 86, 219);
  doc.rect(0, 0, W, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14); doc.setFont("helvetica","bold");
  doc.text("FICHA DE INSPECCIÓN — LDC Colombia", margen, 12);
  doc.setFontSize(9); doc.setFont("helvetica","normal");
  doc.text("Congregación Cordialidad", margen, 20);
  doc.text(formatFecha(ficha.fecha), W - margen, 20, { align:"right" });
  y = 38;

  // Badge estado
  const badgeRgb = { BIEN:[21,128,61], ATENCION:[180,83,9], CRITICO:[185,28,28] };
  doc.setFillColor(...badgeRgb[ficha.estado]);
  doc.roundedRect(margen, y - 5, 36, 8, 2, 2, "F");
  doc.setTextColor(255,255,255);
  doc.setFontSize(9); doc.setFont("helvetica","bold");
  doc.text(`${cfg.icon} ${cfg.label.toUpperCase()}`, margen + 3, y + 0.5);
  y += 11;

  // Grupo + Tarea
  const gcHex = (GRUPO_COLOR[ficha.grupo] || "#1a56db").replace("#","").match(/.{2}/g).map(h=>parseInt(h,16));
  doc.setTextColor(...gcHex);
  doc.setFontSize(8); doc.setFont("helvetica","bold");
  doc.text(ficha.grupo.toUpperCase(), margen, y);
  y += 6;
  doc.setTextColor(30,58,95);
  doc.setFontSize(14); doc.setFont("helvetica","bold");
  doc.text(ficha.tarea, margen, y);
  y += 11;

  // Separador
  doc.setDrawColor(209,221,232);
  doc.line(margen, y, W - margen, y);
  y += 7;

  // Observación
  if (ficha.nota) {
    doc.setFillColor(239,246,255);
    const lines = doc.splitTextToSize(ficha.nota, ancho - 10);
    const boxH  = lines.length * 5.5 + 11;
    doc.roundedRect(margen, y - 4, ancho, boxH, 3, 3, "F");
    doc.setTextColor(107,122,141); doc.setFontSize(7); doc.setFont("helvetica","bold");
    doc.text("OBSERVACIÓN", margen + 4, y + 1);
    doc.setTextColor(30,58,95); doc.setFontSize(10); doc.setFont("helvetica","normal");
    lines.forEach((l,i) => doc.text(l, margen + 4, y + 8 + i * 5.5));
    y += boxH + 6;
  }

  // Responsable
  doc.setTextColor(107,122,141); doc.setFontSize(7); doc.setFont("helvetica","bold");
  doc.text("REALIZADO POR", margen, y); y += 5;
  doc.setTextColor(30,58,95); doc.setFontSize(11); doc.setFont("helvetica","bold");
  doc.text(ficha.responsable, margen, y); y += 5;
  doc.setTextColor(107,122,141); doc.setFontSize(9); doc.setFont("helvetica","normal");
  doc.text(ficha.rol, margen, y); y += 10;

  // Encargado programa
  doc.setTextColor(107,122,141); doc.setFontSize(7); doc.setFont("helvetica","bold");
  doc.text("RESPONSABLE DE LA FICHA", margen, y); y += 5;
  doc.setTextColor(30,58,95); doc.setFontSize(9); doc.setFont("helvetica","normal");
  doc.text(ficha.encargadoPrograma, margen, y); y += 13;

  // Fotos
  if (ficha.fotos && ficha.fotos.length > 0) {
    doc.setDrawColor(209,221,232);
    doc.line(margen, y, W - margen, y); y += 7;
    doc.setTextColor(107,122,141); doc.setFontSize(7); doc.setFont("helvetica","bold");
    doc.text(`FOTOS ADJUNTAS (${ficha.fotos.length})`, margen, y); y += 6;

    const fotoW = (ancho - 8) / 3;
    const fotoH = fotoW * 0.75;
    let col = 0;

    for (const foto of ficha.fotos) {
      const x = margen + col * (fotoW + 4);
      if (y + fotoH > 270) { doc.addPage(); y = 18; }
      try {
        doc.addImage(foto.url, "JPEG", x, y, fotoW, fotoH, undefined, "MEDIUM");
      } catch {
        doc.setFillColor(239,246,255);
        doc.rect(x, y, fotoW, fotoH, "F");
      }
      col++;
      if (col === 3) { col = 0; y += fotoH + 4; }
    }
    if (col > 0) y += fotoH + 4;
  }

  // Pie de página
  const total = doc.internal.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setFillColor(239,246,255);
    doc.rect(0, 287, W, 10, "F");
    doc.setTextColor(107,122,141); doc.setFontSize(7); doc.setFont("helvetica","normal");
    doc.text("LDC Colombia · Manual 2020 · Congregación Cordialidad", margen, 293);
    doc.text(`Pág. ${i} / ${total}`, W - margen, 293, { align:"right" });
  }

  return doc;
}

async function compartirPDF(ficha) {
  const doc  = await generarPDF(ficha);
  const blob = doc.output("blob");
  const nombre = `Ficha_${ficha.tarea.replace(/\s+/g,"_")}_${new Date(ficha.fecha).toLocaleDateString("es-CO").replace(/\//g,"-")}.pdf`;
  const file = new File([blob], nombre, { type:"application/pdf" });

  if (navigator.share && navigator.canShare && navigator.canShare({ files:[file] })) {
    await navigator.share({ title:`Ficha: ${ficha.tarea}`, files:[file] });
  } else {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = nombre; a.click();
    URL.revokeObjectURL(url);
  }
}

// ─── Adjunto de fotos ─────────────────────────────────────────────────────
function AdjuntoFotos({ fotos, onChange }) {
  const inputRef = useRef(null);

  const handleFiles = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    Promise.all(files.map(f => new Promise(res => {
      const r = new FileReader();
      r.onload = () => res({ name:f.name, url:r.result });
      r.readAsDataURL(f);
    }))).then(nuevas => onChange([...fotos, ...nuevas]));
    e.target.value = "";
  };

  return (
    <div style={{marginBottom:14}}>
      {fotos.length > 0 && (
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:10}}>
          {fotos.map((f,i) => (
            <div key={i} style={{position:"relative",borderRadius:8,overflow:"hidden",border:`1.5px solid ${C.border}`,width:78,height:78,flexShrink:0}}>
              <img src={f.url} alt="" style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
              <button onClick={()=>onChange(fotos.filter((_,idx)=>idx!==i))} style={{position:"absolute",top:2,right:2,width:20,height:20,borderRadius:"50%",background:"rgba(185,28,28,0.85)",border:"none",color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",padding:0}}>✕</button>
            </div>
          ))}
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/*" multiple capture="environment" style={{display:"none"}} onChange={handleFiles}/>
      <button onClick={()=>inputRef.current.click()} style={{padding:"10px 14px",borderRadius:8,border:`1.5px dashed ${C.primaryLight}`,background:C.primaryBg,color:C.primary,fontFamily:"inherit",fontSize:13,fontWeight:600,cursor:"pointer",width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
        <span style={{fontSize:17}}>📷</span>
        {fotos.length === 0 ? "Adjuntar fotos de la inspección" : `Agregar más fotos (${fotos.length} adjunta${fotos.length>1?"s":""})`}
      </button>
      <div style={{fontSize:11,color:C.mutedLight,marginTop:4,textAlign:"center"}}>Cámara o galería · Se incluyen en el PDF</div>
    </div>
  );
}

// ─── Botón compartir PDF ──────────────────────────────────────────────────
function BtnCompartir({ ficha }) {
  const [cargando, setCargando] = useState(false);
  const handleClick = async () => {
    setCargando(true);
    try { await compartirPDF(ficha); } catch(e){ console.error(e); } finally { setCargando(false); }
  };
  return (
    <button onClick={handleClick} disabled={cargando} style={{padding:"12px",borderRadius:9,border:"none",background:cargando?"#6b7a8d":"#25d366",color:"#fff",fontFamily:"inherit",fontSize:14,fontWeight:700,cursor:cargando?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,width:"100%",marginTop:10}}>
      <span style={{fontSize:18}}>💬</span>
      {cargando ? "Generando PDF…" : "Generar PDF y compartir"}
    </button>
  );
}

// ─── Vista detalle ────────────────────────────────────────────────────────
function DetalleView({ ficha, onVolver, onEliminar }) {
  const cfg = ESTADO_CONFIG[ficha.estado];
  const gc  = GRUPO_COLOR[ficha.grupo] || C.primary;
  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Segoe UI',system-ui,sans-serif"}}>
      <div style={{background:C.primary,padding:"14px 16px",display:"flex",alignItems:"center",gap:10}}>
        <button onClick={onVolver} style={{background:"rgba(255,255,255,0.18)",border:"none",color:"#fff",borderRadius:7,padding:"7px 14px",cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:600}}>← Volver</button>
        <span style={{color:"#bfdbfe",fontSize:13}}>Detalle de ficha</span>
      </div>
      <div style={{maxWidth:640,margin:"0 auto",padding:"16px 14px"}}>
        <div style={{background:C.card,borderRadius:14,border:`1.5px solid ${C.border}`,borderTop:`4px solid ${cfg.dot}`,padding:"20px 18px",boxShadow:"0 2px 12px rgba(26,86,219,0.08)"}}>
          <span style={{fontSize:11,fontWeight:700,background:cfg.bg,color:cfg.color,padding:"3px 11px",borderRadius:6,textTransform:"uppercase",letterSpacing:0.5}}>{cfg.icon} {cfg.label}</span>
          <div style={{marginTop:12,fontSize:10,color:gc,letterSpacing:1,textTransform:"uppercase",fontWeight:700}}>{ficha.grupo}</div>
          <div style={{fontSize:18,fontWeight:700,color:C.primaryText,marginTop:3}}>{ficha.tarea}</div>

          {ficha.nota && (
            <div style={{background:C.primaryBg,borderRadius:9,padding:"11px 14px",marginTop:13,fontSize:13,color:C.primaryText,lineHeight:1.6}}>
              <div style={{fontSize:10,color:C.muted,marginBottom:4,textTransform:"uppercase",letterSpacing:1,fontWeight:700}}>Observación</div>
              {ficha.nota}
            </div>
          )}

          {ficha.fotos && ficha.fotos.length > 0 && (
            <div style={{marginTop:14}}>
              <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:8,fontWeight:700}}>📸 Fotos ({ficha.fotos.length})</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {ficha.fotos.map((f,i) => (
                  <a key={i} href={f.url} target="_blank" rel="noreferrer">
                    <img src={f.url} alt={`Foto ${i+1}`} style={{width:90,height:90,objectFit:"cover",borderRadius:9,border:`1.5px solid ${C.border}`,display:"block"}}/>
                  </a>
                ))}
              </div>
            </div>
          )}

          <div style={{borderTop:`1px solid ${C.border}`,marginTop:16,paddingTop:14}}>
            <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:8,fontWeight:700}}>Realizado por</div>
            <div style={{display:"flex",alignItems:"center",gap:11}}>
              <div style={{width:42,height:42,borderRadius:"50%",background:C.primary,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:700,flexShrink:0}}>
                {ficha.responsable.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{fontWeight:700,color:C.primaryText,fontSize:15}}>{ficha.responsable}</div>
                <div style={{fontSize:12,color:C.muted}}>{ficha.rol}</div>
              </div>
            </div>
          </div>

          <div style={{fontSize:11,color:C.mutedLight,marginTop:12}}>{formatFecha(ficha.fecha)}</div>

          <BtnCompartir ficha={ficha} />
          <div style={{fontSize:10,color:C.muted,textAlign:"center",marginTop:5}}>
            Genera un PDF con datos y fotos · Comparte por WhatsApp, Drive o email
          </div>

          <button onClick={onEliminar} style={{marginTop:10,width:"100%",padding:"10px",borderRadius:8,border:"1.5px solid #fee2e2",background:"transparent",color:"#b91c1c",fontFamily:"inherit",fontSize:13,fontWeight:600,cursor:"pointer"}}>
            Eliminar ficha
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── App principal ────────────────────────────────────────────────────────
export default function FichasLDC() {
  const [fichas,        setFichas]        = useState([]);
  const [tareaId,       setTareaId]       = useState(1);
  const [estado,        setEstado]        = useState("BIEN");
  const [nota,          setNota]          = useState("");
  const [responsable,   setResponsable]   = useState("");
  const [rol,           setRol]           = useState(ROLES[0]);
  const [fotos,         setFotos]         = useState([]);
  const [guardado,      setGuardado]      = useState(false);
  const [fichaGuardada, setFichaGuardada] = useState(null);
  const [filtroEstado,  setFiltroEstado]  = useState("TODAS");
  const [vista,         setVista]         = useState("form");
  const [fichaDetalle,  setFichaDetalle]  = useState(null);

  const tareaActual = PROGRAMA.find(p => p.id === tareaId);

  const guardar = () => {
    if (!responsable.trim()) return;
    const nueva = {
      id: Date.now(),
      grupo: tareaActual.grupo,
      tarea: tareaActual.tarea,
      encargadoPrograma: tareaActual.encargado,
      estado, nota: nota.trim(),
      responsable: responsable.trim(), rol,
      fotos: [...fotos],
      fecha: new Date().toISOString(),
    };
    setFichas(prev => [nueva, ...prev]);
    setFichaGuardada(nueva);
    setNota(""); setEstado("BIEN"); setFotos([]);
    setGuardado(true);
    setTimeout(() => { setGuardado(false); setFichaGuardada(null); }, 8000);
  };

  const eliminar = (id) => { setFichas(prev => prev.filter(f => f.id !== id)); setFichaDetalle(null); };

  const filtradas = filtroEstado === "TODAS" ? fichas : fichas.filter(f => f.estado === filtroEstado);
  const conteos   = {
    BIEN:     fichas.filter(f=>f.estado==="BIEN").length,
    ATENCION: fichas.filter(f=>f.estado==="ATENCION").length,
    CRITICO:  fichas.filter(f=>f.estado==="CRITICO").length,
  };

  if (fichaDetalle) {
    const f = fichas.find(x => x.id === fichaDetalle);
    if (!f) { setFichaDetalle(null); return null; }
    return <DetalleView ficha={f} onVolver={()=>setFichaDetalle(null)} onEliminar={()=>eliminar(f.id)} />;
  }

  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Segoe UI',system-ui,sans-serif",paddingBottom:48}}>

      {/* Header */}
      <div style={{background:C.primary,color:"#fff",padding:"16px 16px 0"}}>
        <div style={{maxWidth:700,margin:"0 auto"}}>
          <div style={{fontSize:10,letterSpacing:3,color:"#bfdbfe",textTransform:"uppercase",marginBottom:2}}>LDC Colombia · Manual 2020</div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
            <h1 style={{margin:0,fontSize:20,fontWeight:700}}>📋 Fichas de Inspección</h1>
            {fichas.length > 0 && (
              <div style={{display:"flex",gap:6}}>
                {conteos.CRITICO>0  && <span style={{background:"#fee2e2",color:"#b91c1c",padding:"3px 9px",borderRadius:12,fontSize:11,fontWeight:700}}>{conteos.CRITICO} ✕</span>}
                {conteos.ATENCION>0 && <span style={{background:"#fef3c7",color:"#b45309",padding:"3px 9px",borderRadius:12,fontSize:11,fontWeight:700}}>{conteos.ATENCION} !</span>}
              </div>
            )}
          </div>
          <div style={{display:"flex",gap:4,marginTop:12,overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
            {[["form","Nueva ficha"],["lista",`Registros (${fichas.length})`],["programa","Programa anual"]].map(([v,label])=>(
              <button key={v} onClick={()=>setVista(v)} style={{padding:"8px 14px",borderRadius:"7px 7px 0 0",border:"none",background:vista===v?C.bg:"rgba(255,255,255,0.15)",color:vista===v?C.primary:"#bfdbfe",fontFamily:"inherit",fontSize:12,fontWeight:vista===v?700:400,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{maxWidth:700,margin:"0 auto",padding:"18px 14px 0"}}>

        {/* ── FORMULARIO ── */}
        {vista==="form" && (
          <div style={{background:C.card,borderRadius:14,border:`1.5px solid ${C.border}`,padding:"20px 18px",boxShadow:"0 2px 12px rgba(26,86,219,0.07)"}}>

            <label style={labelStyle}>Tarea del programa</label>
            <select value={tareaId} onChange={e=>setTareaId(Number(e.target.value))} style={selectStyle}>
              {GRUPOS.map(g => (
                <optgroup key={g} label={g}>
                  {PROGRAMA.filter(p=>p.grupo===g).map(p=>(
                    <option key={p.id} value={p.id}>{p.tarea}</option>
                  ))}
                </optgroup>
              ))}
            </select>

            <div style={{background:C.primaryBg,borderRadius:9,padding:"11px 14px",marginBottom:15,display:"flex",gap:20,flexWrap:"wrap"}}>
              <div>
                <div style={{fontSize:10,color:C.muted,letterSpacing:1,textTransform:"uppercase",fontWeight:600}}>Grupo</div>
                <div style={{fontSize:12,fontWeight:700,color:GRUPO_COLOR[tareaActual.grupo]}}>{tareaActual.grupo}</div>
              </div>
              <div>
                <div style={{fontSize:10,color:C.muted,letterSpacing:1,textTransform:"uppercase",fontWeight:600}}>Frecuencia</div>
                <div style={{fontSize:12,fontWeight:700,color:C.primaryText}}>{tareaActual.frecuencia}</div>
              </div>
              <div>
                <div style={{fontSize:10,color:C.muted,letterSpacing:1,textTransform:"uppercase",fontWeight:600}}>Encargado en programa</div>
                <div style={{fontSize:12,fontWeight:700,color:C.primaryText}}>{tareaActual.encargado}</div>
              </div>
            </div>

            <label style={labelStyle}>Estado encontrado</label>
            <div style={{display:"flex",gap:8,marginBottom:15,flexWrap:"wrap"}}>
              {Object.entries(ESTADO_CONFIG).map(([key,cfg])=>(
                <button key={key} onClick={()=>setEstado(key)} style={{flex:"1 1 80px",padding:"11px 4px",borderRadius:9,border:estado===key?`2px solid ${cfg.color}`:"2px solid #e2eaf2",background:estado===key?cfg.bg:C.primaryBg,color:estado===key?cfg.color:C.muted,fontFamily:"inherit",fontSize:12,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
                  <span style={{width:8,height:8,borderRadius:"50%",background:estado===key?cfg.dot:"#c5d4e0",flexShrink:0}}/>
                  {cfg.label}
                </button>
              ))}
            </div>

            <label style={labelStyle}>Observación / Nota</label>
            <textarea value={nota} onChange={e=>setNota(e.target.value)} placeholder="Describa lo encontrado…" rows={3} style={{...inputStyle,resize:"vertical",lineHeight:1.6}}/>

            <label style={labelStyle}>Fotos de la inspección</label>
            <AdjuntoFotos fotos={fotos} onChange={setFotos} />

            <div style={{borderTop:`1px solid ${C.border}`,margin:"4px 0 16px",paddingTop:15}}>
              <div style={{fontSize:11,color:C.primary,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:13}}>👤 Responsable de la ficha</div>
              <label style={labelStyle}>Nombre de quien hizo la ficha *</label>
              <input value={responsable} onChange={e=>setResponsable(e.target.value)} placeholder="Ej: Carlos Cortez, Julián Zapata…" style={inputStyle}/>
              <div style={{fontSize:11,color:C.muted,marginTop:-10,marginBottom:13}}>Si fueron varios, separa los nombres con coma.</div>
              <label style={labelStyle}>Rol en la congregación</label>
              <select value={rol} onChange={e=>setRol(e.target.value)} style={selectStyle}>
                {ROLES.map(r=><option key={r}>{r}</option>)}
              </select>
            </div>

            <button onClick={guardar} disabled={!responsable.trim()} style={{width:"100%",padding:"13px",borderRadius:10,border:"none",background:guardado?"#15803d":responsable.trim()?C.primary:"#a0bce8",color:"#fff",fontFamily:"inherit",fontSize:14,fontWeight:700,cursor:responsable.trim()?"pointer":"not-allowed",transition:"background 0.2s"}}>
              {guardado ? "✓ Ficha registrada" : "Registrar ficha"}
            </button>
            {!responsable.trim() && <div style={{fontSize:11,color:C.mutedLight,textAlign:"center",marginTop:5}}>El nombre es obligatorio</div>}

            {guardado && fichaGuardada && (
              <>
                <BtnCompartir ficha={fichaGuardada} />
                <div style={{fontSize:10,color:C.muted,textAlign:"center",marginTop:5}}>
                  PDF con datos y fotos · Elige WhatsApp, Drive o email al compartir
                </div>
              </>
            )}
          </div>
        )}

        {/* ── LISTA ── */}
        {vista==="lista" && (
          <>
            {fichas.length===0 ? (
              <div style={{textAlign:"center",color:C.muted,fontSize:13,padding:"48px 0"}}>
                Sin fichas registradas aún.<br/>
                <span onClick={()=>setVista("form")} style={{color:C.primary,cursor:"pointer",fontWeight:700,textDecoration:"underline"}}>Crear primera ficha</span>
              </div>
            ) : (
              <>
                <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>
                  {[["TODAS",`Todas (${fichas.length})`],["BIEN",`Bien (${conteos.BIEN})`],["ATENCION",`Atención (${conteos.ATENCION})`],["CRITICO",`Crítico (${conteos.CRITICO})`]].map(([f,label])=>(
                    <button key={f} onClick={()=>setFiltroEstado(f)} style={{padding:"6px 13px",borderRadius:20,border:filtroEstado===f?`1.5px solid ${C.primary}`:`1.5px solid ${C.border}`,background:filtroEstado===f?C.primary:C.card,color:filtroEstado===f?"#fff":C.primary,fontFamily:"inherit",fontSize:11,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"}}>
                      {label}
                    </button>
                  ))}
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {filtradas.map(f=>{
                    const cfg=ESTADO_CONFIG[f.estado];
                    const gc=GRUPO_COLOR[f.grupo]||C.primary;
                    return (
                      <div key={f.id} onClick={()=>setFichaDetalle(f.id)} style={{background:C.card,borderRadius:11,border:`1.5px solid ${C.border}`,borderLeft:`4px solid ${cfg.dot}`,padding:"14px 14px 12px",boxShadow:"0 1px 5px rgba(26,86,219,0.06)",cursor:"pointer"}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4,flexWrap:"wrap"}}>
                              <span style={{fontSize:10,fontWeight:700,background:cfg.bg,color:cfg.color,padding:"2px 8px",borderRadius:4,textTransform:"uppercase",letterSpacing:0.5}}>{cfg.icon} {cfg.label}</span>
                              <span style={{fontSize:10,color:gc,fontWeight:700}}>{f.grupo}</span>
                            </div>
                            <div style={{fontSize:14,fontWeight:700,color:C.primaryText,marginBottom:4}}>{f.tarea}</div>
                            <div style={{display:"flex",alignItems:"center",gap:7,flexWrap:"wrap"}}>
                              <div style={{width:22,height:22,borderRadius:"50%",background:C.primary,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,flexShrink:0}}>
                                {f.responsable.charAt(0).toUpperCase()}
                              </div>
                              <span style={{fontSize:12,color:C.muted}}>{f.responsable}</span>
                              {f.fotos && f.fotos.length > 0 && <span style={{fontSize:11,color:C.mutedLight}}>📷 {f.fotos.length}</span>}
                            </div>
                            <div style={{fontSize:10,color:C.mutedLight,marginTop:5}}>{formatFecha(f.fecha)}</div>
                          </div>
                          <span style={{color:C.mutedLight,fontSize:22,paddingLeft:8,alignSelf:"center"}}>›</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}

        {/* ── PROGRAMA ANUAL ── */}
        {vista==="programa" && (
          <div style={{background:C.card,borderRadius:14,border:`1.5px solid ${C.border}`,overflow:"hidden",boxShadow:"0 2px 12px rgba(26,86,219,0.07)"}}>
            <div style={{padding:"14px 16px 10px",borderBottom:`1px solid ${C.border}`}}>
              <div style={{fontSize:13,fontWeight:700,color:C.primaryText}}>Programa de mantenimiento 2025</div>
              <div style={{fontSize:11,color:C.muted,marginTop:2}}>
                Mes resaltado = programado · <span style={{background:"#e8f5e9",padding:"1px 6px",borderRadius:3,fontWeight:700,color:"#15803d"}}>verde</span> = mes actual
              </div>
            </div>
            <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:11,minWidth:540}}>
                <thead>
                  <tr style={{background:C.primaryBg}}>
                    <th style={{...th,textAlign:"left",width:130}}>Tarea</th>
                    <th style={{...th,width:110}}>Encargado</th>
                    {MESES.map((m,i)=>(
                      <th key={i} style={{...th,background:i===mesActual?"#dcfce7":undefined,color:i===mesActual?"#15803d":C.muted,fontWeight:i===mesActual?800:600}}>{m}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {GRUPOS.map(g=>(
                    <>
                      <tr key={g}>
                        <td colSpan={14} style={{background:GRUPO_COLOR[g],color:"#fff",padding:"5px 11px",fontSize:10,fontWeight:700,letterSpacing:1,textTransform:"uppercase"}}>{g}</td>
                      </tr>
                      {PROGRAMA.filter(p=>p.grupo===g).map((p,idx)=>{
                        const registrada = fichas.some(f=>f.tarea===p.tarea && new Date(f.fecha).getMonth()===mesActual);
                        return (
                          <tr key={p.id} style={{background:idx%2===0?C.card:C.primaryBg,cursor:"pointer"}}
                            onClick={()=>{ setTareaId(p.id); setVista("form"); }}
                          >
                            <td style={{...td,fontWeight:600,color:C.primaryText,textDecoration:registrada?"underline":undefined}}>
                              {registrada && <span style={{color:"#15803d",marginRight:4}}>✓</span>}
                              {p.tarea}
                            </td>
                            <td style={{...td,color:C.muted,fontSize:10}}>{p.encargado}</td>
                            {MESES.map((_,i)=>(
                              <td key={i} style={{...td,textAlign:"center",background:i===mesActual?"#f0fdf4":undefined}}>
                                {p.meses.includes(i) && <span style={{color:i===mesActual?"#15803d":C.primary,fontWeight:700,fontSize:13}}>✓</span>}
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{padding:"10px 16px",borderTop:`1px solid ${C.border}`,fontSize:11,color:C.muted}}>
              Toca cualquier tarea para ir directo al formulario.
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ─── Estilos base ─────────────────────────────────────────────────────────
const labelStyle  = {display:"block",fontSize:10,letterSpacing:1.5,textTransform:"uppercase",color:C.muted,marginBottom:5,fontWeight:700};
const inputStyle  = {width:"100%",padding:"10px 12px",borderRadius:8,border:`1.5px solid ${C.border}`,fontFamily:"inherit",fontSize:13,color:C.primaryText,background:C.primaryBg,boxSizing:"border-box",marginBottom:13,outline:"none"};
const selectStyle = {...inputStyle,cursor:"pointer"};
const th = {padding:"7px 5px",fontSize:10,fontWeight:700,color:C.muted,textAlign:"center",borderBottom:`1px solid ${C.border}`,whiteSpace:"nowrap"};
const td = {padding:"7px 8px",fontSize:11,borderBottom:`1px solid ${C.primaryBg}`,verticalAlign:"middle"};
