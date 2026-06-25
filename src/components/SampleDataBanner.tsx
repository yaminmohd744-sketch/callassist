/**
 * Shown when a screen is displaying built-in sample/demo data (because the user
 * has no real calls/leads yet) so it's never mistaken for their own data.
 */
export function SampleDataBanner({ label = 'Sample data' }: { label?: string }) {
  return (
    <div
      role="note"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 14px',
        margin: '0 0 16px',
        borderRadius: 'var(--border-radius-md, 14px)',
        border: '1px dashed var(--color-border-bright, rgba(0,0,0,0.28))',
        background: 'var(--color-bg-surface, #f7f7f7)',
        color: 'var(--color-text-secondary, rgba(0,0,0,0.55))',
        fontSize: 13,
        fontWeight: 600,
      }}
    >
      <span aria-hidden="true">◆</span>
      <span>{label} — this is example content. It’s replaced by your own once you complete a call.</span>
    </div>
  );
}
