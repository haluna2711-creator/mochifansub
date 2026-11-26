import { AnimeGridSkeleton } from "@/components/AnimeCard";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6">
      <div className="skeleton h-[25rem] rounded-[2rem] md:h-[27rem] md:rounded-[2.5rem]" />
      <div className="mt-14 skeleton h-8 w-48 rounded-full" />
      <div className="mt-6">
        <AnimeGridSkeleton count={12} />
      </div>
    </div>
  );
}
