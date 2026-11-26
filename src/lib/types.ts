export type ReleaseStatus = "ongoing" | "completed" | "upcoming";

export interface StaffMember {
  role: string;
  name: string;
}

export interface Release {
  id: string;
  slug: string;
  title: string;
  title_jp: string | null;
  synopsis: string | null;
  cover_url: string | null;
  banner_url: string | null;
  genres: string[];
  year: number | null;
  season: string | null;
  status: ReleaseStatus;
  total_episodes: number | null;
  featured: boolean;
  /** Nhân sự tham gia (chỉ có ở trang chi tiết / admin) */
  staff?: StaffMember[] | null;
  created_at: string;
  updated_at: string;
}

export interface Torrent {
  id: string;
  release_id: string;
  label: string;
  episode: number | null;
  quality: string | null;
  size: string | null;
  sub_type: string | null;
  magnet: string | null;
  torrent_url: string | null;
  created_at: string;
}

export interface ReleaseWithTorrents extends Release {
  torrents: Torrent[];
}

export interface TorrentWithRelease extends Torrent {
  release: Pick<Release, "slug" | "title" | "cover_url" | "title_jp"> | null;
}
