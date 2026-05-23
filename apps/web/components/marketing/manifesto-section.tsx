export function ManifestoSection() {
  return (
    <section className="bg-linear-to-b from-[--tf-surface] to-[--tf-bg] px-6 py-28">
      <div className="mx-auto grid w-full max-w-7xl gap-14 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        <div>
          <p className="font-mono text-[11px] tracking-[0.18em] text-[--tf-text-3] uppercase">
            A small note
          </p>
          <p className="mt-5 max-w-[14ch] font-display text-5xl leading-[1.03] text-foreground md:text-6xl">
            We do not think leave software should feel like
            <em className="text-[--tf-iris]"> HR software</em>.
          </p>
        </div>

        <div className="max-w-2xl space-y-5 text-base leading-relaxed text-[--tf-text-2]">
          <p>
            Most products in this category were built for HR departments and
            inherited their language. TeamFore is built for the engineering
            manager planning Friday&apos;s sprint.
          </p>
          <p>
            The vocabulary is yours: standups, capacity, who is around. The
            interface is calm enough to open every morning and quiet enough to
            disappear when you do not need it.
          </p>
          <p className="pt-2 text-sm text-[--tf-text-3]">
            - Vivek and the TeamFore team
          </p>
        </div>
      </div>
    </section>
  );
}
