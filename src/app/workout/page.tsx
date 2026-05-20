"use client";

import { useEffect, useState } from "react";

interface Exercise { id: string; name: string; sets: number; reps: string; met: number; rpe: string | null; }
interface WorkoutDay { id: string; name: string; exercises: Exercise[]; }
interface Session { id: string; day: WorkoutDay; totalCalories: number; exerciseLogs: { id: string; exercise: Exercise; weight: number; sets: number; reps: string; calories: number }[]; }

function uid() {
  if (typeof window === "undefined") return "default";
  let u = localStorage.getItem("heatgap_uid");
  if (!u) { u = "user_" + Math.random().toString(36).slice(2, 10); localStorage.setItem("heatgap_uid", u); }
  return u;
}

export default function WorkoutPage() {
  const [plan, setPlan] = useState<{ days: WorkoutDay[] } | null>(null);
  const [day, setDay] = useState<WorkoutDay | null>(null);
  const [weights, setWeights] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const userId = uid();
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    Promise.all([
      fetch("/api/workouts/plans").then(r => r.json()),
      fetch("/api/workouts/sessions?userId=" + userId + "&date=" + today).then(r => r.json()),
    ]).then(([p, s]) => {
      setPlan(p);
      if (p?.days?.length) setDay(p.days[0]);
      const ss = Array.isArray(s) ? s : [];
      if (ss.length) setSession(ss[0]);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const submit = async () => {
    if (!day) return;
    setSaving(true); setMsg(null);
    const ew: Record<string, number> = {};
    day.exercises.forEach(ex => { const w = parseFloat(weights[ex.id] || "0"); ew[ex.id] = w > 0 ? w : 0; });
    try {
      const r = await fetch("/api/workouts/sessions", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, dayId: day.id, date: today, exerciseWeights: ew }),
      });
      const d = await r.json();
      if (r.ok) { setSession(d); setMsg({ ok: true, text: "已记录 · 消耗 " + d.totalCalories + " kcal" }); }
      else setMsg({ ok: false, text: d.error || "记录失败" });
    } catch { setMsg({ ok: false, text: "网络错误" }); }
    setSaving(false);
  };

  const remove = async () => {
    if (!session) return;
    await fetch("/api/workouts/sessions?id=" + session.id, { method: "DELETE" });
    setSession(null); setMsg({ ok: true, text: "已删除训练记录" });
  };

  return (
    <div className="page-enter">
      <div className="container">
        <nav className="nav">
          <a href="/" className="nav-brand" style={{ textDecoration: "none" }}>HeatGap</a>
          <div className="nav-links">
            <a href="/" className="nav-link">仪表盘</a>
            <a href="/food" className="nav-link">饮食<svg viewBox="0 0 12 12"><path d="M2 10L10 2M10 2H4M10 2V8"/></svg></a>
            <a href="/workout" className="nav-link active">训练</a>
            <a href="/history" className="nav-link">历史<svg viewBox="0 0 12 12"><path d="M2 10L10 2M10 2H4M10 2V8"/></svg></a>
          </div>
        </nav>
      </div>

      <div className="container">
        <div className="hero" style={{ marginBottom: 40 }}>
          <div className="hero-label">训练记录 &middot; {today}</div>
          <h1 className="hero-title" style={{ fontSize: "clamp(28px, 4vw, 48px)", marginBottom: 16 }}>
            {loading ? "—" : session ? <>消耗 <strong>{session.totalCalories} kcal</strong></> : <>记录今日<strong>训练</strong></>}
          </h1>
        </div>

        {loading ? (
          <div style={{ padding: "40px 0" }}><div className="spinner" /></div>
        ) : session ? (
          <div className="section">
            <div className="section-header">
              <span className="section-title">{session.day.name}</span>
              <span className="section-action" style={{ cursor: "pointer" }} onClick={remove}>删除记录</span>
            </div>
            {session.exerciseLogs.map(log => (
              <div key={log.id} className="exercise-row" style={{ alignItems: "center" }}>
                <div>
                  <div className="exercise-name">{log.exercise.name}</div>
                  <div className="exercise-meta">{log.weight > 0 ? log.weight + "kg × " : ""}{log.sets} 组</div>
                </div>
                <div className="exercise-weight">{log.calories} kcal</div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {plan && (
              <div className="chip-group" style={{ marginBottom: 40, maxWidth: 400 }}>
                {plan.days.map(d => (
                  <button key={d.id} className={"chip" + (day?.id === d.id ? " active" : "")} onClick={() => setDay(d)}>
                    {d.name}
                  </button>
                ))}
              </div>
            )}

            {day && (
              <div className="section">
                <div className="section-header">
                  <span className="section-title">{day.name} · {day.exercises.length} 个动作</span>
                </div>
                {day.exercises.map(ex => (
                  <div key={ex.id} className="exercise-row">
                    <div style={{ flex: 1 }}>
                      <div className="exercise-name">{ex.name}</div>
                      <div className="exercise-meta">{ex.sets} 组 × {ex.reps} 次{ex.rpe ? " · RPE " + ex.rpe : ""}</div>
                    </div>
                    <div style={{ width: 100 }}>
                      <input type="number" step="0.5" placeholder="重量 kg"
                        value={weights[ex.id] || ""}
                        onChange={e => setWeights(p => ({ ...p, [ex.id]: e.target.value }))}
                        style={{ width: "100%", padding: "6px 0", border: "none", borderBottom: "1px solid var(--gray-300)", fontFamily: "var(--mono)", fontSize: 13, background: "transparent", outline: "none", textAlign: "right" }} />
                    </div>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
                  <button className="btn-text" onClick={submit} disabled={saving}>
                    {saving ? "保存中…" : "记录训练 →"}
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {msg && (
          <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: msg.ok ? "var(--gray-400)" : "var(--black)", marginTop: 24, padding: "8px 0", borderBottom: "1px solid var(--gray-200)" }}>
            {msg.text}
          </div>
        )}
      </div>

      <div className="container">
        <footer className="footer">
          <div>
            <div className="footer-brand">HeatGap</div>
            <div className="footer-copy">&copy; {new Date().getFullYear()}</div>
          </div>
          <div className="footer-links">
            <a href="/" className="footer-link">仪表盘 <svg viewBox="0 0 10 10"><path d="M1 9L9 1M9 1H4M9 1V6"/></svg></a>
            <a href="/food" className="footer-link">饮食 <svg viewBox="0 0 10 10"><path d="M1 9L9 1M9 1H4M9 1V6"/></svg></a>
          </div>
        </footer>
      </div>
    </div>
  );
}
