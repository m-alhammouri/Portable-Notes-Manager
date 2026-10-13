import { BookOpen, Leaf, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';

export function SideRail({ children }: { children?: ReactNode }) {
  return (
    <aside className="side-rail">
      <div className="brand-mark">
        <div className="brand-symbol">
          <BookOpen size={19} strokeWidth={2.1} />
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.03em' }}>Fieldnotes</div>
          <div style={{ marginTop: 2, color: 'hsl(var(--sidebar-foreground) / 0.59)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Student journal
          </div>
        </div>
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ padding: '16px 13px', border: '1px solid hsl(var(--sidebar-foreground) / 0.12)', borderRadius: 15, background: 'hsl(var(--sidebar-foreground) / 0.045)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'hsl(var(--sidebar-primary))', fontSize: 11, fontWeight: 700 }}>
          <Sparkles size={14} />
          A little room to notice
        </div>
        <p style={{ margin: '9px 0 0', color: 'hsl(var(--sidebar-foreground) / 0.67)', fontSize: 11, lineHeight: 1.65 }}>
          Small observations add up to meaningful support.
        </p>
      </div>
      <div style={{ marginTop: 18 }}>
        {children}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 25, color: 'hsl(var(--sidebar-foreground) / 0.55)', fontSize: 10 }}>
        <Leaf size={13} />
        Made for thoughtful teaching
      </div>
    </aside>
  );
}
