"use client";

import { useEffect, useState } from "react";

interface DS {
  date: string;
  intake: { calories: number; protein: number; fat: number; carbs: number; meals: number };
  workout: { calories: number; sessions: number; sessionNames: string[] };
  bmr: number; tdee: number; deficit: number; isOnTrack: boolean;
}

function uid() {
  if (typeof window === "undefined") return "default";
  let u = localStorage.getItem("heatgap_uid");
  if (!u) { u = "user_" + Math.random().toString(36).slice(2, 10); localStorage.setItem("heatgap_uid", u); }
  return u;
}

export default function Home() {
  const [s, setS] = useState<DS | null>(null);
  const [loading, setLoading] = useState(true);
  const [clock, setClock] = useState("");
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    setLoading(true);
    fetch("/api/stats?userId=" + uid() + "&date=" + today)
      .then(r => r.json()).then(setS).catch(() => setS(null)).finally(() => setLoading(false));
    const tick = () => {
      const n = new Date();
      setClock(n.toLocaleTimeString("zh-CN", { hour12: false }));
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="page-enter">
      <div className="container">
        <nav className="nav">
          <span className="nav-brand">HeatGap</span>
          <div className="nav-links">
            <a href="/" className="nav-link active">仪表盘</a>
            <a href="/food" className="nav-link">饮食<svg viewBox="0 0 12 12"><path d="M2 10L10 2M10 2H4M10 2V8"/></svg></a>
            <a href="/workout" className="nav-link">训练<svg viewBox="0 0 12 12"><path d="M2 10L10 2M10 2H4M10 2V8"/></svg></a>
            <a href="/history" className="nav-link">历史<svg viewBox="0 0 12 12"><path d="M2 10L10 2M10 2H4M10 2V8"/></svg></a>
          </div>
        </nav>
      </div>

      <div className="container">
        <div className="hero">
          <div className="hero-label">每日概览 &middot; <span id="clock">{clock || "—"}</span></div>
          <h1 className="hero-title">
            {loading ? "—" : s ? (
              s.deficit < 0
                ? <>今日热量缺口<br /><strong>{Math.abs(s.deficit)} kcal</strong></>
                : <>今日无缺口<br /><strong>{Math.abs(s.deficit)} kcal</strong></>
            ) : "暂无数据"}
          </h1>
          <div className="hero-meta">
            <span>基础代谢 {s?.bmr ?? 1950} kcal</span>
            <span>目标 &minus;500 kcal/天</span>
            <span>{s ? s.date : today}</span>
          </div>
        </div>
      </div>

      {!loading && s && (
        <div className="container">
          <div className="stat-grid">
            <div className="stat-cell">
              <div className="stat-number bold">{s.intake.calories}</div>
              <div className="stat-label">摄入热量</div>
            </div>
            <div className="stat-cell">
              <div className="stat-number">{s.workout.calories}</div>
              <div className="stat-label">训练消耗</div>
            </div>
            <div className="stat-cell">
              <div className="stat-number bold">{s.deficit > 0 ? "+" : ""}{s.deficit}</div>
              <div className="stat-label">热量缺口</div>
            </div>
          </div>

          <div className="section">
            <div className="section-header">
              <span className="section-title">营养素</span>
            </div>
            <div className="macro-row">
              <div className="macro-item">
                <div className="macro-number">{Math.round(s.intake.carbs)}</div>
                <div className="macro-label">碳水 &middot; g</div>
              </div>
              <div className="macro-item">
                <div className="macro-number">{Math.round(s.intake.protein)}</div>
                <div className="macro-label">蛋白质 &middot; g</div>
              </div>
              <div className="macro-item">
                <div className="macro-number">{Math.round(s.intake.fat)}</div>
                <div className="macro-label">脂肪 &middot; g</div>
              </div>
            </div>
          </div>

          <div className="section">
            <div className="section-header">
              <span className="section-title">状态</span>
            </div>
            <div className="data-row">
              <span className="data-label">今日进度</span>
              <span className="data-value">
                <span className={"status-dot" + (s.isOnTrack ? "" : " muted")} style={{ marginRight: 8 }} />
                {s.isOnTrack ? "在轨道上" : "需要调整"}
              </span>
            </div>
            <div className="data-row">
              <span className="data-label">总消耗</span>
              <span className="data-value">{s.tdee} kcal</span>
            </div>
            <div className="data-row">
              <span className="data-label">已记录餐数</span>
              <span className="data-value">{s.intake.meals}</span>
            </div>
            {s.workout.sessionNames.length > 0 && (
              <div className="data-row">
                <span className="data-label">今日训练</span>
                <span className="data-value">{s.workout.sessionNames.join(" / ")}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {loading && (
        <div className="container" style={{ padding: "80px 0", textAlign: "center" }}>
          <div className="spinner" style={{ margin: "0 auto" }} />
        </div>
      )}

      <div className="container">
        <footer className="footer">
          <div>
            <div className="footer-brand">HeatGap</div>
            <div className="footer-copy">&copy; {new Date().getFullYear()} &middot; 热量差追踪工具</div>
          </div>
          <div className="footer-links">
            <a href="/food" className="footer-link">饮食记录 <svg viewBox="0 0 10 10"><path d="M1 9L9 1M9 1H4M9 1V6"/></svg></a>
            <a href="/workout" className="footer-link">训练记录 <svg viewBox="0 0 10 10"><path d="M1 9L9 1M9 1H4M9 1V6"/></svg></a>
          </div>
        </footer>
      </div>
    </div>
  );
}
