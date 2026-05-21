import { useState, useMemo } from "react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from "recharts";
import { Plus, Trash2, Edit3, X, Package, Target, BarChart2, Home, Fuel, Clock, MapPin, TrendingUp, TrendingDown, DollarSign, CheckCircle2, Circle, Navigation, Zap, Star, Car, FileText, ChevronRight, AlertCircle } from "lucide-react";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 11);
const today = () => new Date().toISOString().split("T")[0];
const fmt = (n) => `R$\u00a0${Number(n || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const C = {
  bg: "#080D17", card: "#0F1623", card2: "#141d2e", input: "#1a2438",
  accent: "#00E096", blue: "#4B8EF0", amber: "#F5A623",
  red: "#F04B4B", purple: "#A78BFA", pink: "#F472B6",
  text: "#EEF2FF", muted: "#5A6A8A", border: "rgba(255,255,255,0.07)",
  borderHov: "rgba(255,255,255,0.13)"
};

const PLAT_DEL = ["Shopee", "Amazon", "iFood", "Rappi", "Loggi", "Porta a Porta", "Outra"];
const PLAT_RIDE = ["Uber", "99", "InDrive", "Maxim", "Lalamove", "BlaBlaCar", "Outra"];
const GOAL_CATS = ["Manutenção", "Prestação / Financiamento", "Pneus", "Reserva de Emergência", "Carro novo", "Viagem", "Combustível", "Aluguel", "Investimento", "Outro"];

const PLAT_COLOR = {
  Uber: "#E0E0E0", "99": "#F01B0F", InDrive: "#00C853", Maxim: "#FF6B00",
  Lalamove: "#FF6B35", BlaBlaCar: "#29B6F6", Shopee: "#EE4D2D",
  Amazon: "#FF9900", iFood: "#EA1D2C", Rappi: "#FF441F", Loggi: "#4B8EF0",
  "Porta a Porta": "#00E096", Outra: "#A78BFA"
};

// ─── DEMO DATA ────────────────────────────────────────────────────────────────
const DEMO_DEL = [
  { id: uid(), platform: "Shopee", date: "2025-05-12", earnings: 180, km: 45, hours: 6, fuel: 30, tolls: 5, tips: 10, notes: "" },
  { id: uid(), platform: "Amazon", date: "2025-05-14", earnings: 220, km: 60, hours: 8, fuel: 40, tolls: 8, tips: 0, notes: "" },
  { id: uid(), platform: "Porta a Porta", date: "2025-05-15", earnings: 150, km: 35, hours: 5, fuel: 25, tolls: 0, tips: 20, notes: "" },
  { id: uid(), platform: "Shopee", date: "2025-05-17", earnings: 195, km: 50, hours: 7, fuel: 35, tolls: 5, tips: 15, notes: "" },
  { id: uid(), platform: "Amazon", date: "2025-05-19", earnings: 240, km: 65, hours: 8.5, fuel: 44, tolls: 10, tips: 5, notes: "" },
];
const DEMO_RIDES = [
  { id: uid(), platform: "Uber", date: "2025-05-13", earnings: 250, km: 80, hours: 8, fuel: 55, tolls: 10, appFee: 62.5, tips: 15, notes: "" },
  { id: uid(), platform: "99", date: "2025-05-14", earnings: 180, km: 60, hours: 6, fuel: 42, tolls: 5, appFee: 27, tips: 0, notes: "" },
  { id: uid(), platform: "InDrive", date: "2025-05-16", earnings: 210, km: 70, hours: 7, fuel: 49, tolls: 8, appFee: 21, tips: 10, notes: "" },
  { id: uid(), platform: "Uber", date: "2025-05-18", earnings: 290, km: 95, hours: 9, fuel: 66.5, tolls: 12, appFee: 72.5, tips: 20, notes: "" },
  { id: uid(), platform: "99", date: "2025-05-19", earnings: 165, km: 55, hours: 5.5, fuel: 38, tolls: 0, appFee: 24.75, tips: 8, notes: "" },
];

const delProfit = (d) => Number(d.earnings) + Number(d.tips) - Number(d.fuel) - Number(d.tolls);
const rideProfit = (r) => Number(r.earnings) + Number(r.tips) - Number(r.fuel) - Number(r.tolls) - Number(r.appFee);

// ─── STYLE HELPERS ────────────────────────────────────────────────────────────
const cardStyle = (extra = {}) => ({
  background: C.card, border: `1px solid ${C.border}`, borderRadius: 16,
  padding: "18px 22px", ...extra
});
const inputStyle = (extra = {}) => ({
  background: C.input, border: `1px solid rgba(255,255,255,0.1)`,
  borderRadius: 10, color: C.text, padding: "10px 13px", fontSize: 14,
  outline: "none", width: "100%", boxSizing: "border-box", ...extra
});
const lbl = { fontSize: 11, color: C.muted, marginBottom: 5, display: "block", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 };
const accentBtn = (extra = {}) => ({
  background: C.accent, color: "#000", border: "none", borderRadius: 10,
  padding: "10px 18px", cursor: "pointer", fontWeight: 700, fontSize: 14,
  display: "flex", alignItems: "center", gap: 6, ...extra
});
const ghostBtn = (col = C.muted, extra = {}) => ({
  background: "transparent", color: col, border: `1px solid ${C.border}`,
  borderRadius: 8, padding: "6px 8px", cursor: "pointer", display: "flex", alignItems: "center",
  ...extra
});

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
function MetricCard({ title, value, sub, color, icon: Icon }) {
  return (
    <div style={{ ...cardStyle(), flex: 1, minWidth: 150 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <span style={{ fontSize: 11, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{title}</span>
        {Icon && <div style={{ width: 30, height: 30, borderRadius: 8, background: `${color}1A`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={15} color={color} />
        </div>}
      </div>
      <div style={{ fontSize: 21, fontWeight: 800, color, letterSpacing: -0.5 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function Badge({ text, color }) {
  return <span style={{ background: `${color}22`, color, borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>{text}</span>;
}

function PlatDot({ platform }) {
  const col = PLAT_COLOR[platform] || C.accent;
  return <span style={{ width: 8, height: 8, borderRadius: "50%", background: col, display: "inline-block", flexShrink: 0 }} />;
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ ...cardStyle({ maxWidth: 560, width: "100%", maxHeight: "90vh", overflowY: "auto", border: `1px solid ${C.borderHov}` }) }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <h3 style={{ color: C.text, margin: 0, fontSize: 17, fontWeight: 700 }}>{title}</h3>
          <button onClick={onClose} style={ghostBtn(C.muted)}><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, desc, action, onAction }) {
  return (
    <div style={{ ...cardStyle({ textAlign: "center", padding: "56px 32px" }) }}>
      <div style={{ width: 60, height: 60, borderRadius: 16, background: `${C.muted}15`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
        <Icon size={28} color={C.muted} />
      </div>
      <div style={{ color: C.text, fontSize: 17, fontWeight: 600, marginBottom: 8 }}>{title}</div>
      <div style={{ color: C.muted, fontSize: 14, marginBottom: 24 }}>{desc}</div>
      {action && <button onClick={onAction} style={accentBtn({ margin: "0 auto" })}><Plus size={16} />{action}</button>}
    </div>
  );
}

function FilterBar({ options, value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {options.map(p => (
        <button key={p} onClick={() => onChange(p)} style={{
          background: value === p ? C.accent : C.card2, color: value === p ? "#000" : C.muted,
          border: `1px solid ${value === p ? C.accent : C.border}`, borderRadius: 8,
          padding: "5px 12px", cursor: "pointer", fontSize: 12, fontWeight: value === p ? 700 : 400,
          transition: "all 0.15s"
        }}>{p}</button>
      ))}
    </div>
  );
}

// ─── DELIVERY FORM ────────────────────────────────────────────────────────────
const EMPTY_DEL = { platform: "Shopee", date: today(), earnings: "", km: "", hours: "", fuel: "", tolls: "", tips: "", notes: "" };
const EMPTY_RIDE = { platform: "Uber", date: today(), earnings: "", km: "", hours: "", fuel: "", tolls: "", appFee: "", tips: "", notes: "" };

function IncomeForm({ type, initial, onSave, onClose }) {
  const [form, setForm] = useState(initial);
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const platforms = type === "del" ? PLAT_DEL : PLAT_RIDE;
  const profit = type === "del" ? delProfit(form) : rideProfit(form);
  const hasData = !!form.earnings;

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <span style={lbl}>Plataforma</span>
          <select value={form.platform} onChange={set("platform")} style={inputStyle()}>
            {platforms.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <span style={lbl}>Data</span>
          <input type="date" value={form.date} onChange={set("date")} style={inputStyle()} />
        </div>
        <div>
          <span style={lbl}>Ganho bruto (R$)</span>
          <input type="number" placeholder="0,00" value={form.earnings} onChange={set("earnings")} style={inputStyle()} />
        </div>
        {type === "ride" && <div>
          <span style={lbl}>Taxa do app (R$)</span>
          <input type="number" placeholder="0,00" value={form.appFee} onChange={set("appFee")} style={inputStyle()} />
        </div>}
        {type === "del" && <div>
          <span style={lbl}>Gorjetas (R$)</span>
          <input type="number" placeholder="0,00" value={form.tips} onChange={set("tips")} style={inputStyle()} />
        </div>}
        <div>
          <span style={lbl}>KM rodados</span>
          <input type="number" placeholder="0" value={form.km} onChange={set("km")} style={inputStyle()} />
        </div>
        <div>
          <span style={lbl}>Horas trabalhadas</span>
          <input type="number" placeholder="0" step="0.5" value={form.hours} onChange={set("hours")} style={inputStyle()} />
        </div>
        <div>
          <span style={lbl}>Combustível (R$)</span>
          <input type="number" placeholder="0,00" value={form.fuel} onChange={set("fuel")} style={inputStyle()} />
        </div>
        <div>
          <span style={lbl}>Pedágios (R$)</span>
          <input type="number" placeholder="0,00" value={form.tolls} onChange={set("tolls")} style={inputStyle()} />
        </div>
        {type === "ride" && <div>
          <span style={lbl}>Gorjetas (R$)</span>
          <input type="number" placeholder="0,00" value={form.tips} onChange={set("tips")} style={inputStyle()} />
        </div>}
        <div style={{ gridColumn: "1 / -1" }}>
          <span style={lbl}>Observações (opcional)</span>
          <input placeholder="Ex: dia chuvoso, zona sul..." value={form.notes} onChange={set("notes")} style={inputStyle()} />
        </div>
      </div>

      {hasData && (
        <div style={{ background: profit >= 0 ? `${C.accent}12` : `${C.red}12`, border: `1px solid ${profit >= 0 ? C.accent : C.red}30`, borderRadius: 10, padding: "12px 14px", margin: "14px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: C.muted }}>Lucro líquido</span>
            <span style={{ fontWeight: 800, color: profit >= 0 ? C.accent : C.red, fontSize: 16 }}>{fmt(profit)}</span>
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            {form.hours > 0 && <span style={{ fontSize: 12, color: C.muted }}>R${(profit / form.hours).toFixed(2)}/h</span>}
            {form.km > 0 && <span style={{ fontSize: 12, color: C.muted }}>R${(profit / form.km).toFixed(3)}/km</span>}
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
        <button onClick={() => onSave(form)} style={accentBtn({ flex: 1, justifyContent: "center" })}>
          <CheckCircle2 size={16} /> Salvar
        </button>
        <button onClick={onClose} style={{ ...ghostBtn(C.muted, { flex: 1, justifyContent: "center", padding: "10px" }), fontSize: 14, fontWeight: 500 }}>
          Cancelar
        </button>
      </div>
    </div>
  );
}

// ─── ENTRY LIST ROW ───────────────────────────────────────────────────────────
function EntryRow({ item, profit, onEdit, onDelete }) {
  const col = PLAT_COLOR[item.platform] || C.accent;
  return (
    <div style={{ ...cardStyle({ padding: "14px 18px" }), display: "flex", alignItems: "center", gap: 14, transition: "border-color 0.15s" }}>
      <div style={{ width: 38, height: 38, borderRadius: 10, background: `${col}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <PlatDot platform={item.platform} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5, flexWrap: "wrap" }}>
          <Badge text={item.platform} color={col} />
          <span style={{ fontSize: 12, color: C.muted }}>{item.date}</span>
          {item.notes && <span style={{ fontSize: 11, color: C.muted, fontStyle: "italic", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 120 }}>{item.notes}</span>}
        </div>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, color: C.muted, display: "flex", alignItems: "center", gap: 3 }}><Fuel size={11} />R${Number(item.fuel).toFixed(2)}</span>
          <span style={{ fontSize: 12, color: C.muted, display: "flex", alignItems: "center", gap: 3 }}><MapPin size={11} />{item.km}km</span>
          <span style={{ fontSize: 12, color: C.muted, display: "flex", alignItems: "center", gap: 3 }}><Clock size={11} />{item.hours}h</span>
          {item.appFee > 0 && <span style={{ fontSize: 12, color: C.muted }}>taxa:{fmt(item.appFee)}</span>}
        </div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontSize: 17, fontWeight: 800, color: profit >= 0 ? C.accent : C.red, letterSpacing: -0.3 }}>{fmt(profit)}</div>
        <div style={{ fontSize: 11, color: C.muted }}>bruto: {fmt(item.earnings)}</div>
      </div>
      <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
        <button onClick={onEdit} style={ghostBtn(C.muted)}><Edit3 size={14} /></button>
        <button onClick={onDelete} style={ghostBtn(C.red)}><Trash2 size={14} /></button>
      </div>
    </div>
  );
}

// ─── GOAL CARD ────────────────────────────────────────────────────────────────
function GoalCard({ g, onToggle, onEdit, onDelete, onAddProgress }) {
  const [addAmt, setAddAmt] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const pct = Math.min(100, ((Number(g.current) || 0) / Number(g.target)) * 100);
  const remaining = Math.max(0, Number(g.target) - (Number(g.current) || 0));
  const progressColor = pct >= 100 ? C.accent : pct >= 60 ? C.blue : pct >= 30 ? C.amber : C.red;

  return (
    <div style={{ ...cardStyle({ padding: "16px 20px", borderLeft: `3px solid ${g.completed ? C.accent : progressColor}` }) }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div style={{ flex: 1, marginRight: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: g.completed ? C.muted : C.text, textDecoration: g.completed ? "line-through" : "none" }}>{g.name}</span>
            {g.completed && <span style={{ fontSize: 11, color: C.accent, fontWeight: 800, background: `${C.accent}18`, padding: "1px 7px", borderRadius: 5 }}>✓ CONCLUÍDA</span>}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <Badge text={g.category} color={C.blue} />
            {g.deadline && <span style={{ fontSize: 11, color: C.muted }}>prazo: {g.deadline}</span>}
            {g.notes && <span style={{ fontSize: 11, color: C.muted, fontStyle: "italic" }}>{g.notes}</span>}
          </div>
        </div>
        <div style={{ display: "flex", gap: 5 }}>
          <button onClick={() => onToggle(g.id)} title={g.completed ? "Reabrir" : "Concluir"} style={ghostBtn(g.completed ? C.muted : C.accent)}>
            {g.completed ? <Circle size={14} /> : <CheckCircle2 size={14} />}
          </button>
          <button onClick={() => onEdit(g)} style={ghostBtn(C.muted)}><Edit3 size={14} /></button>
          <button onClick={() => onDelete(g.id)} style={ghostBtn(C.red)}><Trash2 size={14} /></button>
        </div>
      </div>

      <div style={{ marginBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 13, color: C.muted }}>{fmt(g.current || 0)} <span style={{ color: C.muted }}>de</span> {fmt(g.target)}</span>
          <span style={{ fontSize: 14, fontWeight: 800, color: progressColor }}>{pct.toFixed(0)}%</span>
        </div>
        <div style={{ height: 7, background: `${C.border}`, borderRadius: 99, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: progressColor, borderRadius: 99, transition: "width 0.4s ease" }} />
        </div>
        {remaining > 0 && <div style={{ fontSize: 12, color: C.muted, marginTop: 5 }}>Faltam: <span style={{ color: C.text, fontWeight: 600 }}>{fmt(remaining)}</span></div>}
      </div>

      {!g.completed && (
        <div style={{ marginTop: 8 }}>
          {!showAdd ? (
            <button onClick={() => setShowAdd(true)} style={{ background: `${C.blue}18`, color: C.blue, border: `1px solid ${C.blue}30`, borderRadius: 8, padding: "5px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
              + Adicionar progresso
            </button>
          ) : (
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <input type="number" placeholder="Valor (R$)" value={addAmt} onChange={e => setAddAmt(e.target.value)}
                style={inputStyle({ width: 140, padding: "6px 10px", fontSize: 13 })} autoFocus />
              <button onClick={() => { onAddProgress(g.id, addAmt); setAddAmt(""); setShowAdd(false); }}
                style={accentBtn({ padding: "6px 14px", fontSize: 13 })}>OK</button>
              <button onClick={() => setShowAdd(false)} style={ghostBtn(C.muted, { padding: "6px 10px" })}>
                <X size={14} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── DASHBOARD TAB ────────────────────────────────────────────────────────────
function DashboardTab({ deliveries, rides }) {
  const allItems = [...deliveries, ...rides];
  const totalDelP = useMemo(() => deliveries.reduce((a, d) => a + delProfit(d), 0), [deliveries]);
  const totalRideP = useMemo(() => rides.reduce((a, r) => a + rideProfit(r), 0), [rides]);
  const totalP = totalDelP + totalRideP;
  const totalHours = useMemo(() => allItems.reduce((a, x) => a + Number(x.hours || 0), 0), [allItems]);
  const totalKm = useMemo(() => allItems.reduce((a, x) => a + Number(x.km || 0), 0), [allItems]);
  const totalCost = useMemo(() => allItems.reduce((a, x) => a + Number(x.fuel || 0) + Number(x.tolls || 0) + Number(x.appFee || 0), 0), [allItems]);

  const dailyData = useMemo(() => {
    const map = {};
    deliveries.forEach(d => {
      const k = d.date.slice(5);
      if (!map[k]) map[k] = { day: k, entregas: 0, corridas: 0 };
      map[k].entregas = +(map[k].entregas + delProfit(d)).toFixed(2);
    });
    rides.forEach(r => {
      const k = r.date.slice(5);
      if (!map[k]) map[k] = { day: k, entregas: 0, corridas: 0 };
      map[k].corridas = +(map[k].corridas + rideProfit(r)).toFixed(2);
    });
    return Object.values(map).sort((a, b) => a.day < b.day ? -1 : 1);
  }, [deliveries, rides]);

  const platRank = useMemo(() => {
    const map = {};
    deliveries.forEach(d => {
      if (!map[d.platform]) map[d.platform] = { name: d.platform, profit: 0, hours: 0, km: 0, days: 0 };
      map[d.platform].profit += delProfit(d);
      map[d.platform].hours += Number(d.hours || 0);
      map[d.platform].km += Number(d.km || 0);
      map[d.platform].days++;
    });
    rides.forEach(r => {
      if (!map[r.platform]) map[r.platform] = { name: r.platform, profit: 0, hours: 0, km: 0, days: 0 };
      map[r.platform].profit += rideProfit(r);
      map[r.platform].hours += Number(r.hours || 0);
      map[r.platform].km += Number(r.km || 0);
      map[r.platform].days++;
    });
    return Object.values(map).sort((a, b) => b.profit - a.profit);
  }, [deliveries, rides]);

  const workDays = new Set(allItems.map(x => x.date)).size;

  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
        <MetricCard title="Lucro Total" value={fmt(totalP)} sub={`${allItems.length} registros`} color={C.accent} icon={DollarSign} />
        <MetricCard title="Entregas" value={fmt(totalDelP)} sub={`${deliveries.length} registros`} color={C.blue} icon={Package} />
        <MetricCard title="Corridas" value={fmt(totalRideP)} sub={`${rides.length} registros`} color={C.purple} icon={Navigation} />
        <MetricCard title="R$/hora" value={totalHours > 0 ? `R$\u00a0${(totalP / totalHours).toFixed(2)}` : "—"} sub={`${totalHours.toFixed(0)}h trabalhadas`} color={C.amber} icon={Clock} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 14, marginBottom: 16 }}>
        <div style={cardStyle()}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 14 }}>Lucro diário</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dailyData} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: C.muted }} />
              <YAxis tick={{ fontSize: 10, fill: C.muted }} />
              <Tooltip contentStyle={{ background: C.card2, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 12 }}
                formatter={(v, n) => [fmt(v), n === "entregas" ? "Entregas" : "Corridas"]} />
              <Bar dataKey="entregas" stackId="a" fill={C.blue} />
              <Bar dataKey="corridas" stackId="a" fill={C.purple} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
            {[["Entregas", C.blue], ["Corridas", C.purple]].map(([n, c]) => (
              <span key={n} style={{ fontSize: 11, color: C.muted, display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 8, height: 8, background: c, borderRadius: 2 }} />{n}
              </span>
            ))}
          </div>
        </div>

        <div style={cardStyle()}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 14 }}>🏆 Ranking plataformas</div>
          {platRank.length === 0
            ? <div style={{ color: C.muted, fontSize: 13, textAlign: "center", paddingTop: 40 }}>Sem dados ainda</div>
            : platRank.map((p, i) => (
              <div key={p.name} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {i === 0 && <span style={{ fontSize: 13 }}>🥇</span>}
                    {i === 1 && <span style={{ fontSize: 13 }}>🥈</span>}
                    {i === 2 && <span style={{ fontSize: 13 }}>🥉</span>}
                    <span style={{ fontSize: 12, color: i === 0 ? C.text : C.muted, fontWeight: i === 0 ? 700 : 400 }}>{p.name}</span>
                  </div>
                  <span style={{ fontSize: 12, color: C.accent, fontWeight: 700 }}>{fmt(p.profit)}</span>
                </div>
                <div style={{ height: 4, background: C.border, borderRadius: 99 }}>
                  <div style={{ height: "100%", width: `${Math.max(5, (p.profit / platRank[0].profit) * 100)}%`, background: PLAT_COLOR[p.name] || C.accent, borderRadius: 99 }} />
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 3 }}>
                  <span style={{ fontSize: 10, color: C.muted }}>{p.hours.toFixed(0)}h</span>
                  <span style={{ fontSize: 10, color: C.muted }}>{p.km.toFixed(0)}km</span>
                  <span style={{ fontSize: 10, color: C.muted }}>R${p.hours > 0 ? (p.profit / p.hours).toFixed(2) : "—"}/h</span>
                </div>
              </div>
            ))
          }
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
        {[
          ["KM total", `${totalKm.toFixed(0)} km`, `R$${totalKm > 0 ? (totalP / totalKm).toFixed(3) : "—"}/km`],
          ["Custo operacional", fmt(totalCost), "combustível + pedágios + taxas"],
          ["Média diária", workDays > 0 ? fmt(totalP / workDays) : "—", `${workDays} dias trabalhados`],
        ].map(([t, v, s]) => (
          <div key={t} style={cardStyle({ padding: "14px 16px" })}>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{t}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.text, letterSpacing: -0.3 }}>{v}</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>{s}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ENTREGAS TAB ─────────────────────────────────────────────────────────────
function EntregasTab({ deliveries, setDeliveries }) {
  const [modal, setModal] = useState(null);
  const [filter, setFilter] = useState("Todas");

  const filtered = useMemo(() =>
    (filter === "Todas" ? deliveries : deliveries.filter(d => d.platform === filter))
      .slice().sort((a, b) => b.date.localeCompare(a.date))
    , [deliveries, filter]);

  const totalP = filtered.reduce((a, d) => a + delProfit(d), 0);

  const save = (form) => {
    if (modal?.id) setDeliveries(prev => prev.map(x => x.id === modal.id ? { ...form, id: modal.id } : x));
    else setDeliveries(prev => [{ ...form, id: uid() }, ...prev]);
    setModal(null);
  };

  return (
    <div>
      {modal !== null && (
        <Modal title={modal?.id ? "Editar entrega" : "Nova entrega"} onClose={() => setModal(null)}>
          <IncomeForm type="del" initial={modal?.id ? modal : EMPTY_DEL} onSave={save} onClose={() => setModal(null)} />
        </Modal>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <FilterBar options={["Todas", ...PLAT_DEL]} value={filter} onChange={setFilter} />
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {filtered.length > 0 && <span style={{ fontSize: 13, color: C.accent, fontWeight: 700 }}>{fmt(totalP)}</span>}
          <button onClick={() => setModal({})} style={accentBtn()}><Plus size={16} />Nova entrega</button>
        </div>
      </div>

      {filtered.length === 0
        ? <EmptyState icon={Package} title="Nenhuma entrega ainda" desc="Registre seus ganhos com Shopee, Amazon, iFood e muito mais" action="Adicionar entrega" onAction={() => setModal({})} />
        : <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map(d => <EntryRow key={d.id} item={d} profit={delProfit(d)} onEdit={() => setModal(d)} onDelete={() => setDeliveries(prev => prev.filter(x => x.id !== d.id))} />)}
        </div>
      }
    </div>
  );
}

// ─── CORRIDAS TAB ─────────────────────────────────────────────────────────────
function CorridasTab({ rides, setRides }) {
  const [modal, setModal] = useState(null);
  const [filter, setFilter] = useState("Todas");

  const filtered = useMemo(() =>
    (filter === "Todas" ? rides : rides.filter(r => r.platform === filter))
      .slice().sort((a, b) => b.date.localeCompare(a.date))
    , [rides, filter]);

  const totalP = filtered.reduce((a, r) => a + rideProfit(r), 0);

  const save = (form) => {
    if (modal?.id) setRides(prev => prev.map(x => x.id === modal.id ? { ...form, id: modal.id } : x));
    else setRides(prev => [{ ...form, id: uid() }, ...prev]);
    setModal(null);
  };

  return (
    <div>
      {modal !== null && (
        <Modal title={modal?.id ? "Editar corrida" : "Nova corrida"} onClose={() => setModal(null)}>
          <IncomeForm type="ride" initial={modal?.id ? modal : EMPTY_RIDE} onSave={save} onClose={() => setModal(null)} />
        </Modal>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <FilterBar options={["Todas", ...PLAT_RIDE]} value={filter} onChange={setFilter} />
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {filtered.length > 0 && <span style={{ fontSize: 13, color: C.purple, fontWeight: 700 }}>{fmt(totalP)}</span>}
          <button onClick={() => setModal({})} style={{ ...accentBtn(), background: C.purple }}><Plus size={16} />Nova corrida</button>
        </div>
      </div>

      {filtered.length === 0
        ? <EmptyState icon={Navigation} title="Nenhuma corrida ainda" desc="Registre seus ganhos com Uber, 99, InDrive, Maxim e outras plataformas" action="Adicionar corrida" onAction={() => setModal({})} />
        : <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map(r => <EntryRow key={r.id} item={r} profit={rideProfit(r)} onEdit={() => setModal(r)} onDelete={() => setRides(prev => prev.filter(x => x.id !== r.id))} />)}
        </div>
      }
    </div>
  );
}

// ─── METAS TAB ────────────────────────────────────────────────────────────────
const EMPTY_GOAL = { name: "", category: "Manutenção", target: "", current: "", deadline: "", notes: "" };

function MetasTab({ goals, setGoals }) {
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_GOAL);
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const openNew = () => { setForm(EMPTY_GOAL); setModal("new"); };
  const openEdit = (g) => { setForm(g); setModal(g.id); };
  const close = () => { setModal(null); setForm(EMPTY_GOAL); };

  const save = () => {
    if (!form.name.trim() || !form.target) return;
    if (modal !== "new") {
      setGoals(prev => prev.map(g => g.id === modal ? { ...form, id: modal } : g));
    } else {
      setGoals(prev => [...prev, { ...form, id: uid(), completed: false, current: form.current || "0", createdAt: today() }]);
    }
    close();
  };

  const active = goals.filter(g => !g.completed);
  const done = goals.filter(g => g.completed);
  const totalTarget = active.reduce((a, g) => a + Number(g.target), 0);
  const totalSaved = active.reduce((a, g) => a + Number(g.current || 0), 0);

  const QUICK_GOALS = ["Trocar pneus", "Manutenção preventiva", "Reserva de emergência", "Viagem de férias", "Entrada no financiamento"];

  return (
    <div>
      {modal !== null && (
        <Modal title={modal === "new" ? "Nova meta financeira" : "Editar meta"} onClose={close}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <span style={lbl}>Nome da meta *</span>
              <input placeholder="Ex: Trocar pneus dianteiros" value={form.name} onChange={set("name")} style={inputStyle()} autoFocus />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <span style={lbl}>Categoria</span>
                <select value={form.category} onChange={set("category")} style={inputStyle()}>
                  {GOAL_CATS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <span style={lbl}>Valor alvo (R$) *</span>
                <input type="number" placeholder="0,00" value={form.target} onChange={set("target")} style={inputStyle()} />
              </div>
              <div>
                <span style={lbl}>Já tenho (R$)</span>
                <input type="number" placeholder="0,00" value={form.current} onChange={set("current")} style={inputStyle()} />
              </div>
              <div>
                <span style={lbl}>Prazo (opcional)</span>
                <input type="date" value={form.deadline} onChange={set("deadline")} style={inputStyle()} />
              </div>
            </div>
            <div>
              <span style={lbl}>Observações (opcional)</span>
              <input placeholder="Motivo, detalhe, lembrete..." value={form.notes} onChange={set("notes")} style={inputStyle()} />
            </div>
            {form.target && form.current && Number(form.target) > 0 && (
              <div style={{ background: `${C.blue}12`, border: `1px solid ${C.blue}30`, borderRadius: 10, padding: "10px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: C.muted }}>Progresso inicial</span>
                  <span style={{ fontWeight: 800, color: C.blue }}>{Math.min(100, (Number(form.current) / Number(form.target) * 100)).toFixed(0)}%</span>
                </div>
              </div>
            )}
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <button onClick={save} style={accentBtn({ flex: 1, justifyContent: "center" })}><CheckCircle2 size={16} />Salvar meta</button>
              <button onClick={close} style={{ ...ghostBtn(C.muted, { flex: 1, justifyContent: "center", padding: "10px" }), fontSize: 14, fontWeight: 500 }}>Cancelar</button>
            </div>
          </div>
        </Modal>
      )}

      {goals.length === 0 ? (
        <div>
          <div style={{ ...cardStyle({ textAlign: "center", padding: "52px 32px", marginBottom: 16 }) }}>
            <div style={{ width: 64, height: 64, borderRadius: 18, background: `${C.accent}15`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
              <Target size={30} color={C.accent} />
            </div>
            <div style={{ color: C.text, fontSize: 19, fontWeight: 800, marginBottom: 8 }}>Crie suas metas financeiras</div>
            <div style={{ color: C.muted, fontSize: 14, marginBottom: 28, maxWidth: 380, margin: "0 auto 28px" }}>
              Defina objetivos reais e acompanhe seu progresso. Nenhum dado inventado — só o que você criar.
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginBottom: 24 }}>
              {QUICK_GOALS.map(s => (
                <button key={s} onClick={() => { setForm({ ...EMPTY_GOAL, name: s }); setModal("new"); }} style={{
                  background: `${C.blue}18`, color: C.blue, border: `1px solid ${C.blue}25`,
                  borderRadius: 8, padding: "7px 14px", cursor: "pointer", fontSize: 12, fontWeight: 600
                }}>{s}</button>
              ))}
            </div>
            <button onClick={openNew} style={accentBtn({ margin: "0 auto" })}><Plus size={16} />Criar primeira meta</button>
          </div>
        </div>
      ) : (
        <div>
          {active.length > 0 && totalTarget > 0 && (
            <div style={{ ...cardStyle({ marginBottom: 18, padding: "14px 20px" }), display: "flex", gap: 20, alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 6, fontWeight: 600 }}>PROGRESSO GERAL — {active.length} METAS ATIVAS</div>
                <div style={{ height: 8, background: C.border, borderRadius: 99, marginBottom: 6 }}>
                  <div style={{ height: "100%", width: `${Math.min(100, (totalSaved / totalTarget) * 100)}%`, background: C.accent, borderRadius: 99, transition: "width 0.4s" }} />
                </div>
                <div style={{ fontSize: 12, color: C.muted }}>{fmt(totalSaved)} de {fmt(totalTarget)} · {Math.min(100, (totalSaved / totalTarget * 100)).toFixed(0)}%</div>
              </div>
              <button onClick={openNew} style={accentBtn({ flexShrink: 0 })}><Plus size={16} />Nova meta</button>
            </div>
          )}
          {active.length === 0 && <div style={{ marginBottom: 16, textAlign: "right" }}><button onClick={openNew} style={accentBtn()}><Plus size={16} />Nova meta</button></div>}

          {active.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, color: C.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Metas ativas</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {active.map(g => <GoalCard key={g.id} g={g}
                  onToggle={(id) => setGoals(prev => prev.map(x => x.id === id ? { ...x, completed: true } : x))}
                  onEdit={openEdit}
                  onDelete={(id) => setGoals(prev => prev.filter(x => x.id !== id))}
                  onAddProgress={(id, amt) => setGoals(prev => prev.map(x => x.id === id ? { ...x, current: Math.min(Number(x.target), Number(x.current || 0) + Number(amt)).toFixed(2) } : x))}
                />)}
              </div>
            </div>
          )}

          {done.length > 0 && (
            <div>
              <div style={{ fontSize: 11, color: C.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Concluídas ({done.length})</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {done.map(g => <GoalCard key={g.id} g={g}
                  onToggle={(id) => setGoals(prev => prev.map(x => x.id === id ? { ...x, completed: false } : x))}
                  onEdit={openEdit}
                  onDelete={(id) => setGoals(prev => prev.filter(x => x.id !== id))}
                  onAddProgress={() => {}}
                />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── RELATÓRIOS TAB ───────────────────────────────────────────────────────────
function RelatoriosTab({ deliveries, rides }) {
  const [period, setPeriod] = useState("mes");
  const now = new Date();

  const filterPeriod = (items) => items.filter(x => {
    const d = new Date(x.date + "T00:00:00");
    if (period === "semana") return (now - d) / 86400000 <= 7;
    if (period === "mes") return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    return true;
  });

  const fDels = filterPeriod(deliveries);
  const fRides = filterPeriod(rides);
  const all = [...fDels, ...fRides];

  const delP = fDels.reduce((a, d) => a + delProfit(d), 0);
  const rideP = fRides.reduce((a, r) => a + rideProfit(r), 0);
  const totalP = delP + rideP;
  const totalEarnings = all.reduce((a, x) => a + Number(x.earnings || 0), 0);
  const totalTips = all.reduce((a, x) => a + Number(x.tips || 0), 0);
  const totalFuel = all.reduce((a, x) => a + Number(x.fuel || 0), 0);
  const totalTolls = all.reduce((a, x) => a + Number(x.tolls || 0), 0);
  const totalFees = fRides.reduce((a, r) => a + Number(r.appFee || 0), 0);
  const totalHours = all.reduce((a, x) => a + Number(x.hours || 0), 0);
  const totalKm = all.reduce((a, x) => a + Number(x.km || 0), 0);

  const pieData = [
    { name: "Entregas", value: +delP.toFixed(2), fill: C.blue },
    { name: "Corridas", value: +rideP.toFixed(2), fill: C.purple },
  ].filter(x => x.value > 0);

  const platBreakdown = useMemo(() => {
    const map = {};
    fDels.forEach(d => {
      if (!map[d.platform]) map[d.platform] = { name: d.platform, type: "entrega", profit: 0, earnings: 0, hours: 0, km: 0, count: 0 };
      map[d.platform].profit += delProfit(d);
      map[d.platform].earnings += Number(d.earnings);
      map[d.platform].hours += Number(d.hours || 0);
      map[d.platform].km += Number(d.km || 0);
      map[d.platform].count++;
    });
    fRides.forEach(r => {
      if (!map[r.platform]) map[r.platform] = { name: r.platform, type: "corrida", profit: 0, earnings: 0, hours: 0, km: 0, count: 0 };
      map[r.platform].profit += rideProfit(r);
      map[r.platform].earnings += Number(r.earnings);
      map[r.platform].hours += Number(r.hours || 0);
      map[r.platform].km += Number(r.km || 0);
      map[r.platform].count++;
    });
    return Object.values(map).sort((a, b) => b.profit - a.profit);
  }, [fDels, fRides]);

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {[["semana", "Últimos 7 dias"], ["mes", "Este mês"], ["tudo", "Geral"]].map(([v, l]) => (
          <button key={v} onClick={() => setPeriod(v)} style={{
            background: period === v ? C.accent : C.card2, color: period === v ? "#000" : C.muted,
            border: `1px solid ${period === v ? C.accent : C.border}`, borderRadius: 8,
            padding: "8px 16px", cursor: "pointer", fontSize: 13, fontWeight: period === v ? 700 : 400
          }}>{l}</button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
        <MetricCard title="Lucro Líquido" value={fmt(totalP)} color={C.accent} icon={TrendingUp} />
        <MetricCard title="Ganho Bruto" value={fmt(totalEarnings)} color={C.blue} icon={DollarSign} />
        <MetricCard title="Gorjetas" value={fmt(totalTips)} color={C.amber} icon={Star} />
        <MetricCard title="Custos Totais" value={fmt(totalFuel + totalTolls + totalFees)} color={C.red} icon={TrendingDown} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
        {pieData.length > 0 && (
          <div style={cardStyle()}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 10 }}>Distribuição do lucro</div>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={52} outerRadius={80} dataKey="value" paddingAngle={3}>
                  {pieData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Pie>
                <Tooltip formatter={(v) => fmt(v)} contentStyle={{ background: C.card2, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 6 }}>
              {pieData.map(d => (
                <span key={d.name} style={{ fontSize: 12, color: C.muted, display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 8, height: 8, background: d.fill, borderRadius: 2 }} />
                  {d.name}: {fmt(d.value)}
                </span>
              ))}
            </div>
          </div>
        )}

        <div style={cardStyle()}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 14 }}>Resumo de custos</div>
          {[
            ["⛽ Combustível", totalFuel, C.red],
            ["🛣️ Pedágios", totalTolls, C.amber],
            ["📱 Taxas dos apps", totalFees, C.purple],
            ["🏅 Gorjetas recebidas", totalTips, C.accent],
          ].map(([n, v, col]) => (
            <div key={n} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: `1px solid ${C.border}` }}>
              <span style={{ fontSize: 13, color: C.muted }}>{n}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: col }}>{fmt(v)}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0 4px" }}>
            <span style={{ fontSize: 12, color: C.muted }}>Total trabalhado</span>
            <span style={{ fontSize: 12, color: C.muted }}>{totalHours.toFixed(0)}h · {totalKm.toFixed(0)} km</span>
          </div>
          {totalHours > 0 && <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, color: C.muted }}>Eficiência média</span>
            <span style={{ fontSize: 12, color: C.accent, fontWeight: 700 }}>R${(totalP / totalHours).toFixed(2)}/h</span>
          </div>}
        </div>
      </div>

      {platBreakdown.length > 0 && (
        <div style={cardStyle()}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 16 }}>Detalhamento por plataforma</div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                  {["Plataforma", "Tipo", "Dias", "Ganho bruto", "Lucro líquido", "R$/hora", "R$/km"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "6px 10px", color: C.muted, fontWeight: 600, fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {platBreakdown.map((p, i) => (
                  <tr key={p.name} style={{ borderBottom: `1px solid ${C.border}`, background: i === 0 ? `${C.accent}06` : "transparent" }}>
                    <td style={{ padding: "10px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <PlatDot platform={p.name} />
                        <span style={{ color: C.text, fontWeight: i === 0 ? 700 : 400 }}>{p.name}</span>
                        {i === 0 && <span style={{ fontSize: 10, color: C.amber }}>★ TOP</span>}
                      </div>
                    </td>
                    <td style={{ padding: "10px", color: C.muted }}>{p.type === "entrega" ? "📦" : "🚗"} {p.type}</td>
                    <td style={{ padding: "10px", color: C.muted }}>{p.count}</td>
                    <td style={{ padding: "10px", color: C.muted }}>{fmt(p.earnings)}</td>
                    <td style={{ padding: "10px", color: p.profit >= 0 ? C.accent : C.red, fontWeight: 700 }}>{fmt(p.profit)}</td>
                    <td style={{ padding: "10px", color: C.muted }}>{p.hours > 0 ? `R$${(p.profit / p.hours).toFixed(2)}` : "—"}</td>
                    <td style={{ padding: "10px", color: C.muted }}>{p.km > 0 ? `R$${(p.profit / p.km).toFixed(3)}` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {all.length === 0 && <EmptyState icon={FileText} title="Sem dados no período" desc="Selecione outro período ou adicione registros nas abas de entregas e corridas" />}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [deliveries, setDeliveries] = useState(DEMO_DEL);
  const [rides, setRides] = useState(DEMO_RIDES);
  const [goals, setGoals] = useState([]);

  const totalP = useMemo(() =>
    deliveries.reduce((a, d) => a + delProfit(d), 0) + rides.reduce((a, r) => a + rideProfit(r), 0)
    , [deliveries, rides]);

  const activeGoals = goals.filter(g => !g.completed).length;

  const TABS = [
    { id: "dashboard", label: "Início", icon: Home },
    { id: "entregas", label: "Entregas", icon: Package },
    { id: "corridas", label: "Corridas", icon: Navigation },
    { id: "metas", label: "Metas", icon: Target, badge: activeGoals > 0 ? activeGoals : null },
    { id: "relatorios", label: "Relatórios", icon: BarChart2 },
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', system-ui, sans-serif", color: C.text }}>
      {/* ── HEADER ── */}
      <div style={{ background: C.card, borderBottom: `1px solid ${C.border}`, position: "sticky", top: 0, zIndex: 90 }}>
        <div style={{ maxWidth: 940, margin: "0 auto", padding: "0 16px" }}>
          <div style={{ display: "flex", alignItems: "center", height: 54, gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: C.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Zap size={18} color="#000" fill="#000" />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15, color: C.text, letterSpacing: -0.3 }}>RotaLucro</div>
                <div style={{ fontSize: 10, color: C.muted, marginTop: -2 }}>Controle financeiro pro</div>
              </div>
            </div>
            <div style={{ flex: 1 }} />
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 10, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Lucro acumulado</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: totalP >= 0 ? C.accent : C.red, letterSpacing: -0.5 }}>{fmt(totalP)}</div>
            </div>
          </div>

          {/* TABS */}
          <div style={{ display: "flex", gap: 0, overflowX: "auto" }}>
            {TABS.map(t => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button key={t.id} onClick={() => setTab(t.id)} style={{
                  background: "transparent", border: "none", padding: "11px 14px",
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                  color: active ? C.accent : C.muted,
                  borderBottom: `2px solid ${active ? C.accent : "transparent"}`,
                  fontSize: 13, fontWeight: active ? 700 : 400, whiteSpace: "nowrap",
                  transition: "color 0.15s, border-color 0.15s", flexShrink: 0
                }}>
                  <Icon size={15} />
                  {t.label}
                  {t.badge && <span style={{ background: C.blue, color: "#fff", borderRadius: 99, padding: "1px 5px", fontSize: 10, fontWeight: 800 }}>{t.badge}</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ maxWidth: 940, margin: "0 auto", padding: "20px 16px 40px" }}>
        {tab === "dashboard" && <DashboardTab deliveries={deliveries} rides={rides} />}
        {tab === "entregas" && <EntregasTab deliveries={deliveries} setDeliveries={setDeliveries} />}
        {tab === "corridas" && <CorridasTab rides={rides} setRides={setRides} />}
        {tab === "metas" && <MetasTab goals={goals} setGoals={setGoals} />}
        {tab === "relatorios" && <RelatoriosTab deliveries={deliveries} rides={rides} />}
      </div>
    </div>
  );
}
