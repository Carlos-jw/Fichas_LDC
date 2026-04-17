import { useState, useRef } from "react";

// ─── Programa de mantenimiento ────────────────────────────────────────────
const MESES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

const PROGRAMA = [
  { id:1,  grupo:"A. Edificio",            tarea:"Control de plagas",          encargado:"Christian Serpa",                frecuencia:"Cada mes",  meses:[0,1,2,3,4,5,6,7,8,9,10,11] },
  { id:2,  grupo:"A. Edificio",            tarea:"Inspección estructural",      encargado:"Jairo Galvis",                  frecuencia:"2 meses",   meses:[0,2,5,8,10] },
  { id:3,  grupo:"A. Edificio",            tarea:"Inspección externa",          encargado:"Carlos Lopez (Fabian)",         frecuencia:"3 meses",   meses:[1,4,7,10] },
  { id:4,  grupo:"A. Edificio",            tarea:"Inspección interna",          encargado:"Carlos Lopez (Fabian)",         frecuencia:"2 meses",   meses:[0,2,4,6,8,10] },
  { id:5,  grupo:"A. Edificio",            tarea:"Mobiliario",                  encargado:"Hasert (Carlos Casas)",         frecuencia:"Cada mes",  meses:[0,1,2,3,4,5,6,7,8,9,10,11] },
  { id:6,  grupo:"A. Edificio",            tarea:"Puertas y ventanas",          encargado:"Will Herrera (Juan Cardenas)",  frecuencia:"2 meses",   meses:[0,2,4,6,8,10] },
  { id:7,  grupo:"A. Edificio",            tarea:"Cubiertas, canales",          encargado:"Adelson Mejia",                 frecuencia:"3 meses",   meses:[1,4,7,10] },
  { id:8,  grupo:"B. Sistemas eléctricos", tarea:"Sistema de seguridad",        encargado:"Demetrio (Reflectores)",        frecuencia:"Cada mes",  meses:[0,1,2,3,4,5,6,7,8,9,10,11] },
  { id:9,  grupo:"B. Sistemas eléctricos", tarea:"Electricidad",                encargado:"Demetrio Hoyos",                frecuencia:"3 meses",   meses:[0,3,6,9] },
  { id:10, grupo:"B. Sistemas eléctricos", tarea:"Sistema de audio y video",    encargado:"Luis Robles & Julián Toro",     frecuencia:"2 meses",   meses:[1,3,5,7,9,11] },
  { id:11, grupo:"C. Equipos y herramientas", tarea:"Equipos y herramientas",   encargado:"Naren Herrera (Giovanny)",      frecuencia:"Cada mes",  meses:[0,1,2,3,4,5,6,7,8,9,10,11] },
  { id:12, grupo:"D. Exteriores",          tarea:"Paisajismo",                  encargado:"Edilberto Cantillo (Snader)",   frecuencia:"Cada mes",  meses:[0,1,2,3,4,5,6,7,8,9,10,11] },
  { id:13, grupo:"E. Seguridad",           tarea:"Atención de emergencias",     encargado:"Adanies Vanegas",               frecuencia:"3 meses",   meses:[1,4,7,10] },
  { id:14, grupo:"E. Seguridad",           tarea:"Inspección de sismo",         encargado:"Comité de Mantenimiento",       frecuencia:"Si ocurre", meses:[] },
  { id:15, grupo:"F. Sistemas mecánicos",  tarea:"Ventilación y aire acond.",   encargado:"Carlos Cortez",                 frecuencia:"3 meses",   meses:[0,3,6,9] },
  { id:16, grupo:"F. Sistemas mecánicos",  tarea:"Baños y accesorios",          encargado:"Julián Zapata",                 frecuencia:"2 meses",   meses:[0,2,4,6,8,10] },
  { id:17, grupo:"F. Sistemas mecánicos",  tarea:"Sistema de aguas residuales", encargado:"Jaime Villeros (Pedro Utria)",  frecuencia:"3 meses",   meses:[1,4,7,10] },
  { id:18, grupo:"F. Sistemas mecánicos",  tarea:"Tanques",                     encargado:"n/a",                           frecuencia:"3 meses",   meses:[0,3,6,9] },
];

const GRUPOS = [...new Set(PROGRAMA.map(p => p.grupo))];

const GRUPO_COLOR = {
  "A. Edificio":              "#5a2d82",
  "B. Sistemas eléctricos":   "#1a5fa8",
  "C. Equipos y herramientas":"#6b6b00",
  "D. Exteriores":            "#2e7d32",
  "E. Seguridad":             "#b91c1c",
  "F. Sistemas mecánicos":    "#0e7490",
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

// ─── Generador de texto WhatsApp ──────────────────────────────────────────
function generarTextoWA(ficha) {
  const cfg = ESTADO_CONFIG[ficha.estado];
  const fecha = new Date(ficha.fecha);
  const fechaStr = fecha.toLocaleDateString("es-CO",{day:"2-digit",month:"long",year:"numeric"});
  const horaStr  = fecha.toLocaleTimeString("es-CO",{hour:"2-digit",minute:"2-digit"});

  const lineas = [
    `📋 *FICHA DE INSPECCIÓN — LDC Colombia*`,
    `Congregación Cordialidad`,
    ``,
    `📌 *Tarea:* ${ficha.tarea}`,
    `🏷 *Grupo:* ${ficha.grupo}`,
    `📅 *Fecha:* ${fechaStr} · ${horaStr}`,
    ``,
    `*Estado:* ${cfg.icon} ${cfg.label.toUpperCase()}`,
    ficha.nota ? `📝 *Observación:* ${ficha.nota}` : null,
    ``,
    `👤 *Responsable:* ${ficha.responsable}`,
    `   Rol: ${ficha.rol}`,
    ``,
    ficha.fotos && ficha.fotos.length > 0
      ? `📸 *Fotos adjuntas:* ${ficha.fotos.length} imagen${ficha.fotos.length > 1 ? "es" : ""} (ver adjuntos)`
      : null,
    ``,
    `_Registrado con Fichas LDC · Congregación Cordialidad_`,
  ].filter(l => l !== null);

  return lineas.join("\n");
}

function enviarWhatsApp(ficha) {
  const texto = generarTextoWA(ficha);
  const url = `https://wa.me/?text=${encodeURIComponent(texto)}`;
  window.open(url, "_blank");
}

// ─── Adjunto de fotos ─────────────────────────────────────────────────────
function AdjuntoFotos({ fotos, onChange }) {
  const inputRef = useRef(null);

  const handleFiles = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const readers = files.map(file => new Promise(res => {
      const r = new FileReader();
      r.onload = () => res({ name: file.name, url: r.result });
      r.readAsDataURL(file);
    }));
    Promise.all(readers).then(nuevas => onChange([...fotos, ...nuevas]));
    e.target.value = "";
  };

  const eliminar = (i) => onChange(fotos.filter((_,idx) => idx !== i));

  return (
    <div style={{marginBottom:13}}>
      {fotos.length > 0 && (
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:10}}>
          {fotos.map((f,i) => (
            <div key={i} style={{position:"relative",borderRadius:8,overflow:"hidden",border:"1.5px solid #ddd8e8",width:80,height:80,flexShrink:0}}>
              <img src={f.url} alt={f.name} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
              <button
                onClick={()=>eliminar(i)}
                style={{position:"absolute",top:2,right:2,width:18,height:18,borderRadius:"50%",background:"rgba(185,28,28,0.85)",border:"none",color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1,padding:0}}
              >✕</button>
            </div>
          ))}
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/*" multiple capture="environment"
        style={{display:"none"}} onChange={handleFiles} />
      <button
        onClick={()=>inputRef.current.click()}
        style={{padding:"9px 14px",borderRadius:8,border:"1.5px dashed #c4b8d4",background:"#faf9fc",color:"#5a2d82",fontFamily:"inherit",fontSize:12,fontWeight:600,cursor:"pointer",width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:7}}
      >
        <span style={{fontSize:16}}>📷</span>
        {fotos.length === 0 ? "Adjuntar fotos de la inspección" : `Agregar más fotos (${fotos.length} adjunta${fotos.length>1?"s":""})`}
      </button>
      <div style={{fontSize:10,color:"#a094b4",marginTop:4,textAlign:"center"}}>
        Abre la cámara o galería · Se adjuntan al enviarlo por WhatsApp
      </div>
    </div>
  );
}

// ─── Vista detalle ficha ──────────────────────────────────────────────────
function DetalleView({ ficha, onVolver, onEliminar }) {
  const cfg = ESTADO_CONFIG[ficha.estado];
  const gc  = GRUPO_COLOR[ficha.grupo] || "#5a2d82";

  return (
    <div style={{minHeight:"100vh",background:"#f0f2f0",fontFamily:"'Segoe UI',system-ui,sans-serif"}}>
      <div style={{background:"#5a2d82",padding:"16px",display:"flex",alignItems:"center",gap:10}}>
        <button onClick={onVolver} style={{background:"rgba(255,255,255,0.15)",border:"none",color:"#fff",borderRadius:6,padding:"6px 12px",cursor:"pointer",fontFamily:"inherit",fontSize:13}}>← Volver</button>
        <span style={{color:"#e9d5ff",fontSize:13}}>Detalle de ficha</span>
      </div>

      <div style={{maxWidth:540,margin:"0 auto",padding:"16px 14px"}}>
        <div style={{background:"#fff",borderRadius:12,border:"1.5px solid #ddd8e8",borderTop:`4px solid ${cfg.dot}`,padding:"18px 16px",boxShadow:"0 2px 10px rgba(90,45,130,0.07)"}}>

          <span style={{fontSize:11,fontWeight:700,background:cfg.bg,color:cfg.color,padding:"3px 10px",borderRadius:5,textTransform:"uppercase",letterSpacing:0.5}}>{cfg.icon} {cfg.label}</span>
          <div style={{marginTop:12,fontSize:10,color:gc,letterSpacing:1,textTransform:"uppercase",fontWeight:700}}>{ficha.grupo}</div>
          <div style={{fontSize:17,fontWeight:700,color:"#2d1a4a",marginTop:2}}>{ficha.tarea}</div>

          {ficha.nota && (
            <div style={{background:"#faf9fc",borderRadius:8,padding:"10px 12px",marginTop:12,fontSize:13,color:"#3a2a5a",lineHeight:1.5}}>
              <div style={{fontSize:10,color:"#8a7a9a",marginBottom:4,textTransform:"uppercase",letterSpacing:1}}>Observación</div>
              {ficha.nota}
            </div>
          )}

          {/* Fotos */}
          {ficha.fotos && ficha.fotos.length > 0 && (
            <div style={{marginTop:14}}>
              <div style={{fontSize:10,color:"#8a7a9a",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>
                📸 Fotos adjuntas ({ficha.fotos.length})
              </div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {ficha.fotos.map((f,i) => (
                  <a key={i} href={f.url} target="_blank" rel="noreferrer">
                    <img src={f.url} alt={`Foto ${i+1}`}
                      style={{width:90,height:90,objectFit:"cover",borderRadius:8,border:"1.5px solid #ddd8e8",display:"block"}}/>
                  </a>
                ))}
              </div>
            </div>
          )}

          <div style={{borderTop:"1px solid #eee8f8",marginTop:16,paddingTop:14}}>
            <div style={{fontSize:10,color:"#8a7a9a",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Responsable</div>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:40,height:40,borderRadius:"50%",background:"#5a2d82",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,fontWeight:700,flexShrink:0}}>
                {ficha.responsable.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{fontWeight:700,color:"#2d1a4a",fontSize:15}}>{ficha.responsable}</div>
                <div style={{fontSize:12,color:"#8a7a9a"}}>{ficha.rol}</div>
              </div>
            </div>
          </div>

          <div style={{fontSize:11,color:"#b4a8c8",marginTop:14}}>{formatFecha(ficha.fecha)}</div>

          {/* Botón WhatsApp */}
          <button
            onClick={()=>enviarWhatsApp(ficha)}
            style={{marginTop:16,width:"100%",padding:"12px",borderRadius:9,border:"none",background:"#25d366",color:"#fff",fontFamily:"inherit",fontSize:14,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}
          >
            <span style={{fontSize:18}}>💬</span> Enviar ficha por WhatsApp
          </button>
          {ficha.fotos && ficha.fotos.length > 0 && (
            <div style={{fontSize:10,color:"#8a7a9a",textAlign:"center",marginTop:5}}>
              El texto de la ficha se copia al abrir WhatsApp. Adjunta las {ficha.fotos.length} foto{ficha.fotos.length>1?"s":""} manualmente en el chat.
            </div>
          )}

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
  const [fichas,       setFichas]       = useState([]);
  const [tareaId,      setTareaId]      = useState(1);
  const [estado,       setEstado]       = useState("BIEN");
  const [nota,         setNota]         = useState("");
  const [responsable,  setResponsable]  = useState("");
  const [rol,          setRol]          = useState(ROLES[0]);
  const [fotos,        setFotos]        = useState([]);
  const [guardado,     setGuardado]     = useState(false);
  const [fichaGuardada,setFichaGuardada]= useState(null); // para botón WA post-guardar
  const [filtroEstado, setFiltroEstado] = useState("TODAS");
  const [vista,        setVista]        = useState("form");
  const [fichaDetalle, setFichaDetalle] = useState(null);

  const tareaActual = PROGRAMA.find(p => p.id === tareaId);

  const handleTarea = (id) => {
    const t = PROGRAMA.find(p => p.id === Number(id));
    setTareaId(Number(id));
    if (t && t.encargado !== "n/a") setResponsable(t.encargado);
  };

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
    setTimeout(() => { setGuardado(false); setFichaGuardada(null); }, 6000);
  };

  const eliminar = (id) => { setFichas(prev => prev.filter(f => f.id !== id)); setFichaDetalle(null); };

  const filtradas = filtroEstado === "TODAS" ? fichas : fichas.filter(f => f.estado === filtroEstado);
  const conteos   = { BIEN: fichas.filter(f=>f.estado==="BIEN").length, ATENCION: fichas.filter(f=>f.estado==="ATENCION").length, CRITICO: fichas.filter(f=>f.estado==="CRITICO").length };

  if (fichaDetalle) {
    const f = fichas.find(x => x.id === fichaDetalle);
    if (!f) { setFichaDetalle(null); return null; }
    return <DetalleView ficha={f} onVolver={()=>setFichaDetalle(null)} onEliminar={()=>eliminar(f.id)} />;
  }

  return (
    <div style={{minHeight:"100vh",background:"#f0f2f0",fontFamily:"'Segoe UI',system-ui,sans-serif",paddingBottom:40}}>

      {/* Header */}
      <div style={{background:"#5a2d82",color:"#fff",padding:"16px 16px 0"}}>
        <div style={{maxWidth:560,margin:"0 auto"}}>
          <div style={{fontSize:10,letterSpacing:3,color:"#d4b8f0",textTransform:"uppercase",marginBottom:2}}>LDC Colombia · Manual 2020</div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <h1 style={{margin:0,fontSize:20,fontWeight:700}}>📋 Fichas de Inspección</h1>
            {fichas.length > 0 && (
              <div style={{display:"flex",gap:6}}>
                {conteos.CRITICO>0 && <span style={{background:"#fee2e2",color:"#b91c1c",padding:"3px 8px",borderRadius:12,fontSize:11,fontWeight:700}}>{conteos.CRITICO} ✕</span>}
                {conteos.ATENCION>0 && <span style={{background:"#fef3c7",color:"#b45309",padding:"3px 8px",borderRadius:12,fontSize:11,fontWeight:700}}>{conteos.ATENCION} !</span>}
              </div>
            )}
          </div>
          <div style={{display:"flex",gap:4,marginTop:12}}>
            {[["form","Nueva ficha"],["lista",`Registros (${fichas.length})`],["programa","Programa anual"]].map(([v,label])=>(
              <button key={v} onClick={()=>setVista(v)} style={{padding:"7px 12px",borderRadius:"6px 6px 0 0",border:"none",background:vista===v?"#f0f2f0":"rgba(255,255,255,0.15)",color:vista===v?"#5a2d82":"#e9d5ff",fontFamily:"inherit",fontSize:12,fontWeight:vista===v?700:400,cursor:"pointer",whiteSpace:"nowrap"}}>{label}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{maxWidth:560,margin:"0 auto",padding:"16px 14px 0"}}>

        {/* ── FORMULARIO ── */}
        {vista==="form" && (
          <div style={{background:"#fff",borderRadius:12,border:"1.5px solid #ddd8e8",padding:"18px 16px",boxShadow:"0 2px 10px rgba(90,45,130,0.07)"}}>

            <label style={labelStyle}>Tarea del programa</label>
            <select value={tareaId} onChange={e=>handleTarea(e.target.value)} style={selectStyle}>
              {GRUPOS.map(g => (
                <optgroup key={g} label={g}>
                  {PROGRAMA.filter(p=>p.grupo===g).map(p=>(
                    <option key={p.id} value={p.id}>{p.tarea}</option>
                  ))}
                </optgroup>
              ))}
            </select>

            <div style={{background:"#f4f0fa",borderRadius:8,padding:"10px 12px",marginBottom:14,display:"flex",gap:16,flexWrap:"wrap"}}>
              <div>
                <div style={{fontSize:10,color:"#8a7a9a",letterSpacing:1,textTransform:"uppercase"}}>Grupo</div>
                <div style={{fontSize:12,fontWeight:600,color:GRUPO_COLOR[tareaActual.grupo]}}>{tareaActual.grupo}</div>
              </div>
              <div>
                <div style={{fontSize:10,color:"#8a7a9a",letterSpacing:1,textTransform:"uppercase"}}>Frecuencia</div>
                <div style={{fontSize:12,fontWeight:600,color:"#2d1a4a"}}>{tareaActual.frecuencia}</div>
              </div>
              <div>
                <div style={{fontSize:10,color:"#8a7a9a",letterSpacing:1,textTransform:"uppercase"}}>Encargado programa</div>
                <div style={{fontSize:12,fontWeight:600,color:"#2d1a4a"}}>{tareaActual.encargado}</div>
              </div>
            </div>

            <label style={labelStyle}>Estado encontrado</label>
            <div style={{display:"flex",gap:8,marginBottom:14}}>
              {Object.entries(ESTADO_CONFIG).map(([key,cfg])=>(
                <button key={key} onClick={()=>setEstado(key)} style={{flex:1,padding:"11px 4px",borderRadius:8,border:estado===key?`2px solid ${cfg.color}`:"2px solid #e5e0ef",background:estado===key?cfg.bg:"#faf9fc",color:estado===key?cfg.color:"#8a7a9a",fontFamily:"inherit",fontSize:12,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
                  <span style={{width:8,height:8,borderRadius:"50%",background:estado===key?cfg.dot:"#ccc5d9",flexShrink:0}}/>
                  {cfg.label}
                </button>
              ))}
            </div>

            <label style={labelStyle}>Observación / Nota</label>
            <textarea value={nota} onChange={e=>setNota(e.target.value)} placeholder="Describa lo encontrado…" rows={3} style={{...inputStyle,resize:"vertical",lineHeight:1.5}}/>

            {/* Fotos */}
            <label style={labelStyle}>Fotos de la inspección</label>
            <AdjuntoFotos fotos={fotos} onChange={setFotos} />

            <div style={{borderTop:"1px solid #eee8f8",margin:"4px 0 16px",paddingTop:14}}>
              <div style={{fontSize:11,color:"#5a2d82",fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:12}}>👤 Responsable</div>
              <label style={labelStyle}>Nombre completo *</label>
              <input value={responsable} onChange={e=>setResponsable(e.target.value)} placeholder="Nombre del inspector…" style={i
