"use client";

import { useEffect, useState, useRef } from "react";

interface Meal { id: string; foodName: string; weight: number; calories: number; protein: number; fat: number; carbs: number; }

function uid() {
  if (typeof window === "undefined") return "default";
  let u = localStorage.getItem("heatgap_uid");
  if (!u) { u = "user_" + Math.random().toString(36).slice(2, 10); localStorage.setItem("heatgap_uid", u); }
  return u;
}

export default function FoodPage() {
  const [input, setInput] = useState("");
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const ref = useRef<HTMLInputElement>(null);
  const today = new Date().toISOString().split("T")[0];
  const userId = uid();

  useEffect(() => { load(); ref.current?.focus(); }, []);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/meals?userId=" + userId + "&date=" + today);
      setMeals(Array.isArray(await r.json()) ? await r.json() : []);
    } catch { setMeals([]); }
    setLoading(false);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    setSaving(true); setMsg(null);
    try {
      const r = await fetch("/api/meals", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, input, date: today }),
      });
      const d = await r.json();
      if (r.ok) {
        if (d.unmatched?.length) setMsg({ ok: false, text: "无法识别: " + d.unmatched.join("、") });
        else setMsg({ ok: true, text: "已记录 " + (d.meals?.length || 0) + " 项 · " + d.totalCalories + " kcal" });
        setInput(""); load();
      } else setMsg({ ok: false, text: d.error || "记录失败" });
    } catch { setMsg({ ok: false, text: "网络错误" }); }
    setSaving(false);
  }

  async function del(id: string) {
    await fetch("/api/meals?id=" + id, { method: "DELETE" });
    load();
  }

  const cals = meals.reduce((s, m) => s + m.calories, 0);

  return (
    <div className="page-enter">
      <div className="container">
        <nav className="nav">
          <a href="/" className="nav-brand" style={{ textDecoration: "none" }}>HeatGap</a>
          <div className="nav-links">
            <a href="/" className="nav-link">仪表盘</a>
            <a href="/food" className="nav-link active">饮食</a>
            <a href="/workout" className="nav-link">训练<svg viewBox="0 0 12 12"><path d="M2 10L10 2M10 2H4M10 2V8"/></svg></a>
            <a href="/history" className="nav-link">历史<svg viewBox="0 0 12 12"><path d="M2 10L10 2M10 2H4M10 2V8"/></svg></a>
          </div>
        </nav>
      </div>

      <div className="container">
        <div className="hero" style={{ marginBottom: 40 }}>
          <div className="hero-label">饮食记录 &middot; {today}</div>
          <h1 className="hero-title" style={{ fontSize: "clamp(28px, 4vw, 48px)", marginBottom: 16 }}>
            {loading ? "—" : <>{cals} <strong>kcal</strong> 已摄入</>}
          </h1>
        </div>

        <form onSubmit={submit} style={{ marginBottom: 48 }}>
          <input ref={ref} type="text" value={input} onChange={e => setInput(e.target.value)}
            placeholder="例如: 250g熟米饭 100g鸡肉 1个鸡蛋"
            className="input-line" disabled={saving} />
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
            <button type="submit" className="btn-text" disabled={saving || !input.trim()}>
              {saving ? "保存中…" : "记录 →"}
            </button>
          </div>
        </form>

        {msg && (
          <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: msg.ok ? "var(--gray-400)" : "var(--black)", marginBottom: 24, padding: "8px 0", borderBottom: "1px solid var(--gray-200)" }}>
            {msg.text}
          </div>
        )}

        <div className="section">
          <div className="section-header">
            <span className="section-title">今日记录</span>
            <span className="section-action">{meals.length} 项</span>
          </div>
          {loading ? (
            <div style={{ padding: "40px 0" }}><div className="spinner" /></div>
          ) : meals.length === 0 ? (
            <div style={{ padding: "40px 0", fontFamily: "var(--mono)", fontSize: 13, color: "var(--gray-300)" }}>
              暂无记录，在上面输入食物
            </div>
          ) : (
            meals.map(m => (
              <div key={m.id} className="meal-entry">
                <div>
                  <div className="meal-name">{m.foodName}</div>
                  <div className="meal-detail">{m.weight}g · 蛋白质 {m.protein}g · 脂肪 {m.fat}g · 碳水 {m.carbs}g</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <span className="meal-cal">{m.calories}</span>
                  <button onClick={() => del(m.id)} className="btn-text" style={{ fontSize: 11 }}>删除</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="container">
        <footer className="footer">
          <div>
            <div className="footer-brand">HeatGap</div>
            <div className="footer-copy">&copy; {new Date().getFullYear()}</div>
          </div>
          <div className="footer-links">
            <a href="/" className="footer-link">仪表盘 <svg viewBox="0 0 10 10"><path d="M1 9L9 1M9 1H4M9 1V6"/></svg></a>
          </div>
        </footer>
      </div>
    </div>
  );
}
