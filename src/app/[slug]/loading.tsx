export default function Loading() {
  return (
    <div>
      <div className="skeleton -mt-16 h-[17rem] md:-mt-[4.5rem] md:h-[24rem]" />
      <div className="relative mx-auto -mt-28 grid max-w-7xl gap-8 px-4 sm:px-6 md:-mt-36 md:grid-cols-[15rem_1fr] lg:grid-cols-[17rem_1fr]">
        <div className="skeleton mx-auto aspect-[2/3] w-44 rounded-[2rem] ring-4 ring-surface md:w-full" />
        <div className="space-y-4 md:pt-24">
          <div className="skeleton h-4 w-32 rounded-full" />
          <div className="skeleton h-10 w-3/4 rounded-full" />
          <div className="skeleton h-6 w-1/2 rounded-full" />
          <div className="skeleton h-24 rounded-3xl" />
          <div className="skeleton h-72 rounded-[var(--radius-mochi)]" />
        </div>
      </div>
    </div>
  );
}
