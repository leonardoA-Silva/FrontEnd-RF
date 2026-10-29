import { Link } from "react-router-dom";

export default function Brand({ footer = false }: { footer?: boolean }) {
  return (
    <Link to="/" aria-label="Reaproveita Franca — início" className={`home-brand ${footer ? "home-brand-footer" : ""}`}>
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <path d="M22 5a19 19 0 0 1 17 10M43 22a19 19 0 0 1-10 17M26 43A19 19 0 0 1 9 33M5 26A19 19 0 0 1 15 9" stroke="currentColor" strokeWidth="5" />
        <path d="m34 5 8 13-15-2 7-11ZM43 34l-13 8 2-15 11 7ZM14 43 6 30l15 2-7 11ZM5 14l13-8-2 15-11-7Z" fill="currentColor" />
      </svg>
      <span><strong>reaproveita.</strong><small>FRANCA</small></span>
    </Link>
  );
}
