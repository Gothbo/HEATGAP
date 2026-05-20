"use client";

import { useEffect, useState } from "react";

interface DS { date: string; intake: { calories: number; meals: number }; workout: { calories: number; sessionNames: string[] }; deficit: number; }

const BMR = 1950;
const DAYS = 14;

function uid() {
  if (typeof window === "undefined") return "default";
  let u = localStorage.getItem("heatgap_uid");
  if (!u) { u = "user_" + Math.random().toString(36).slice(2, 10); localStorage.setItem("heatgap_uid", u); }
  return u;
}

function fmt(s: string) {
  const d = new Date(s + "T12:00:00");
  const diff = Math.round((Date.now() - d.getTime()) / 86400000);
  if (diff === 0) return "今天"; if (diff === 1) return "昨天"; if (diff === 2) return "前天";
  return (d.getMonth() + 1) + "/" + d.getDate();
}

export default function HistoryPage() {
  const [data, setData] = useState<DS[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = uid();
    const ps: Promise<DS>[] = [];
    for (let i = DAYS; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const ds = d.toISOString().split("T")[0];
      ps.push(fetch("/api/stats?userId=" + u + "&date=" + ds).then(r => r.json()));
    }
    Promise.all(ps).then(d => setData(d as DS[])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const avg = data.length ? Math.round(data.reduce((s, d) => s + d.deficit, 0) / data.length) : 0;

  return (
    <div className="page-enter">
      <div className="container">
        <nav className="nav">
          <a href="/" className="nav-brand" style={{ textDecoration: "none" }}>HeatGap</a>
          <div className="nav-links">
            <a href="/" className="nav-link">仪表盘</a>
            <a href="/food" className="nav-link">饮食<svg viewBox="0 0 12 12"><path d="M2 10L10 2M10 2H4M10 2V8"/></svg></a>
            <a href="/workout" className="nav-link">训练<svg viewBox="0 0 12 12"><path d="M2 10L10 2M10 2H4M10 2V8"/></svg></a>
            <a href="/history" className="nav-link active">历史</a>
          </div>
        </nav>
      </div>

      <div className="container">
        <div className="hero" style={{ marginBottom: 40 }}>
          <div className="hero-label">历史记录 &middot; 近 {DAYS + 1} 天</div>
          <h1 className="hero-title" style={{ fontSize: "clamp(28px, 4vw, 48px)", marginBottom: 16 }}>
            日均缺口 <strong>{avg > 0 ? "+" : ""}{avg} kcal</strong>
          </h1>
        </div>

        {loading ? (
          <div style={{ padding: "40px 0" }}><div className="spinner" /></div>
        ) : (
          <div className="section">
            <div className="section-header">
              <span className="section-title">每日明细</span>
              <span className="section-action">{DAYS + 1} 天</span>
            </div>
            {data.map((d, i) => {
              const maxVal = Math.max(d.intake.calories, BMR + d.workout.calories, 1);
              return (
                <div key={d.date} className="history-row">
                  <div className="history-date">{fmt(d.date)}</div>
                  <div className="history-bars">
                    <div className="history-bar intake" style={{ width: (d.intake.calories / maxVal) * 100 + "%" }} />
                    <div className="history-bar burned" style={{ width: ((BMR + d.workout.calories) / maxVal) * 100 + "%" }} />
                  </div>
                  <div className="history-deficit">{d.deficit > 0 ? "+" : ""}{d.deficit}</div>
                </div>
              );
            })}
          </div>
        )}

        {data.length > 0 && (
          <div className="section">
            <div className="section-header">
              <span className="section-title">图例</span>
            </div>
            <div className="data-row">
              <span className="data-label">摄入（浅色）</span>
              <span className="data-value" style={{ opacity: 0.3 }}>▬</span>
            </div>
            <div className="data-row">
              <span className="data-label">消耗（深色）</span>
              <span className="data-value" style={{ opacity: 0.6 }}>▬</span>
            </div>
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
            <a href="/workout" className="footer-link">训练 <svg viewBox="0 0 10 10"><path d="M1 9L9 1M9 1H4M9 1V6"/></svg></a>
          </div>
        </footer>
      </div>
    </div>
  );
}
