'use client';

/**
 * Re-mounts on every route change, giving each page a native-like
 * slide-up + fade enter animation (see .page-transition in globals.css).
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-transition">{children}</div>;
}
