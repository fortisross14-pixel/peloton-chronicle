import type { ReactNode } from 'react';

export function AlmanacPageHeader({
  kicker,
  title,
  subtitle,
  folio,
  aside,
}: {
  kicker: string;
  title: string;
  subtitle?: ReactNode;
  folio?: string;
  aside?: ReactNode;
}) {
  return (
    <section className="almanac-page-header mb-7">
      <div className="almanac-page-header__topline">
        <span>{kicker}</span>
        <span className="almanac-page-header__dots" aria-hidden="true" />
        {folio && <span>FOLIO {folio}</span>}
      </div>
      <div className="almanac-page-header__body">
        <div className="min-w-0">
          <h2 className="font-display font-black text-4xl sm:text-5xl leading-[0.95] text-balance">
            {title}
          </h2>
          {subtitle && (
            <div className="font-body italic text-sm sm:text-base opacity-70 mt-2 max-w-3xl">
              {subtitle}
            </div>
          )}
        </div>
        {aside && <div className="almanac-page-header__aside">{aside}</div>}
      </div>
    </section>
  );
}
