export default function Loading() {
  return (
    <main
      role="status"
      aria-busy="true"
      aria-label="در حال بارگذاری"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '28px',
        background:
          'radial-gradient(ellipse at 50% 0%, var(--brand-black-soft) 0%, var(--brand-black) 70%)',
      }}
    >
      {/* Premium spinning gold ring loader */}
      <div
        aria-hidden="true"
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          background:
            'conic-gradient(from 0deg, transparent 0deg, var(--brand-gold) 120deg, var(--brand-gold-light) 240deg, transparent 360deg)',
          animation: 'spinBorder 1s linear infinite',
        }}
      >
        <div
          style={{
            width: '58px',
            height: '58px',
            borderRadius: '50%',
            background: 'var(--brand-black)',
          }}
        />
      </div>

      <span
        style={{
          color: 'var(--text-muted)',
          fontSize: '0.9rem',
          fontWeight: 500,
          letterSpacing: '0.02em',
        }}
      >
        در حال بارگذاری…
      </span>
    </main>
  );
}
