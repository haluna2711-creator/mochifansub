import { AnimeGridSkeleton } from "@/components/AnimeCard";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
      <div className="skeleton h-10 w-64 rounded-full" />
      <div className="skeleton mt-6 h-14 max-w-2xl rounded-full" />
      <div className="skeleton mt-6 h-11 w-96 max-w-full rounded-full" />
      <div className="mt-12">
        <AnimeGridSkeleton count={18} />
      </div>
    </div>
  );
}
