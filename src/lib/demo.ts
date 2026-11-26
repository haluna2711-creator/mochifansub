/**
 * Dữ liệu mẫu — chỉ dùng khi CHƯA cấu hình Supabase,
 * để bạn xem trước giao diện ngay sau khi deploy.
 */
import type { Release, Torrent } from "./types";

const now = Date.now();
const ago = (h: number) => new Date(now - h * 3600_000).toISOString();

function hash(seed: string) {
  let h = 0;
  let out = "";
  for (let i = 0; i < 40; i++) {
    h = (h * 31 + seed.charCodeAt(i % seed.length) + i) >>> 0;
    out += (h % 16).toString(16);
  }
  return out;
}

const base = (r: Partial<Release> & Pick<Release, "slug" | "title">, i: number): Release => ({
  id: `demo-${i}`,
  title_jp: null,
  synopsis: null,
  cover_url: null,
  banner_url: null,
  genres: [],
  year: 2026,
  season: "Thu",
  status: "ongoing",
  total_episodes: 12,
  featured: false,
  created_at: ago(400 + i * 10),
  updated_at: ago(i * 7 + 1),
  ...r,
});

type Seed = Partial<Release> & Pick<Release, "slug" | "title">;

const seeds: Seed[] = [
  {
    slug: "hoa-anh-dao-thang-tu",
    title: "Hoa Anh Đào Tháng Tư",
    title_jp: "四月の桜",
    synopsis:
      "Mùa xuân năm ấy, Hana chuyển tới một thị trấn nhỏ ven biển và gặp cậu bạn cùng lớp luôn mang theo chiếc máy ảnh cũ. Từng cánh anh đào rơi là một bức ảnh, từng bức ảnh là một kỷ niệm họ không muốn quên.",
    genres: ["Lãng mạn", "Học đường", "Đời thường"],
    season: "Xuân",
    featured: true,
  },
  {
    slug: "kiem-si-banh-gao",
    title: "Kiếm Sĩ Bánh Gạo",
    title_jp: "餅の剣士",
    synopsis:
      "Một thợ làm bánh mochi bình thường bỗng thừa hưởng thanh kiếm gỗ của ông nội — thanh kiếm có thể chém đôi yêu quái. Cuộc phiêu lưu ngọt ngào và đầy tiếng cười bắt đầu từ một tiệm bánh nhỏ ở Kyoto.",
    genres: ["Hành động", "Hài hước", "Phiêu lưu"],
    featured: true,
    total_episodes: 24,
  },
  {
    slug: "thu-vien-ngoi-sao",
    title: "Thư Viện Ngôi Sao",
    title_jp: "星の図書館",
    synopsis:
      "Ở rìa vũ trụ có một thư viện lưu giữ ký ức của mọi ngôi sao đã tắt. Người thủ thư cuối cùng phải tìm ra cuốn sách bị đánh cắp trước khi bầu trời đêm biến mất.",
    genres: ["Khoa học viễn tưởng", "Huyền ảo", "Bí ẩn"],
    featured: true,
    status: "completed",
  },
  {
    slug: "quan-tra-meo-den",
    title: "Quán Trà Mèo Đen",
    title_jp: "黒猫茶屋",
    synopsis: "Một quán trà chỉ mở cửa lúc nửa đêm, nơi chú mèo đen pha trà cho những vị khách đang lạc lối.",
    genres: ["Đời thường", "Huyền ảo", "Chữa lành"],
    status: "completed",
  },
  {
    slug: "ban-nhac-mua-ha",
    title: "Ban Nhạc Mùa Hạ",
    title_jp: "夏のバンド",
    synopsis: "Bốn cô gái, một nhà kho bỏ hoang và lễ hội âm nhạc cuối hè. Họ chỉ có 30 ngày để tập xong bài hát đầu tiên.",
    genres: ["Âm nhạc", "Học đường", "Hài hước"],
    season: "Hạ",
  },
  {
    slug: "ky-si-may-trang",
    title: "Kỵ Sĩ Mây Trắng",
    title_jp: "白雲の騎士",
    synopsis: "Trên những hòn đảo bay giữa trời, các kỵ sĩ cưỡi cá voi mây bảo vệ vương quốc khỏi cơn bão vĩnh cửu.",
    genres: ["Hành động", "Huyền ảo", "Phiêu lưu"],
    total_episodes: 13,
  },
  {
    slug: "nhat-ky-dau-bep-nho",
    title: "Nhật Ký Đầu Bếp Nhỏ",
    title_jp: "小さな料理人の日記",
    synopsis: "Cô bé 10 tuổi quyết tâm cứu nhà hàng của gia đình bằng những món ăn nấu từ công thức trong cuốn nhật ký của mẹ.",
    genres: ["Ẩm thực", "Đời thường", "Chữa lành"],
    status: "completed",
  },
  {
    slug: "thanh-pho-khong-ngu",
    title: "Thành Phố Không Ngủ",
    title_jp: "眠らない街",
    synopsis: "Tokyo năm 2099, nơi giấc mơ có thể mua bán. Một thám tử mất ngủ điều tra chuỗi vụ đánh cắp giấc mơ.",
    genres: ["Khoa học viễn tưởng", "Bí ẩn", "Hành động"],
    status: "upcoming",
    total_episodes: null,
  },
  {
    slug: "khu-vuon-cua-tho",
    title: "Khu Vườn Của Thỏ",
    title_jp: "うさぎの庭",
    synopsis: "Chú thỏ trắng nhỏ trồng một khu vườn trên mặt trăng để mời bạn bè đến ngắm trăng rằm.",
    genres: ["Chữa lành", "Đời thường"],
    status: "completed",
  },
  {
    slug: "ve-sinh-trong-gio",
    title: "Vệ Sĩ Trong Gió",
    title_jp: "風の護衛",
    synopsis: "Một samurai trẻ được giao nhiệm vụ hộ tống công chúa vượt qua dãy núi Phong Thần.",
    genres: ["Hành động", "Lịch sử", "Lãng mạn"],
  },
];

export const demoReleases: Release[] = seeds.map((r, i) => base(r, i));

/** Mỗi bộ phim chỉ có đúng 1 link torrent. */
export const demoTorrents: Torrent[] = demoReleases
  .filter((r) => r.status !== "upcoming")
  .map((r, ri) => {
    const done = r.status === "completed";
    const eps = done ? r.total_episodes ?? 12 : 6 - (ri % 3);
    const label = done ? `Trọn bộ 01-${String(eps).padStart(2, "0")}` : `Tập 01-${String(eps).padStart(2, "0")}`;
    return {
      id: `${r.id}-torrent`,
      release_id: r.id,
      label,
      episode: null,
      quality: "1080p",
      size: `${(eps * 1.3).toFixed(1)} GB`,
      sub_type: "Softsub",
      magnet: `magnet:?xt=urn:btih:${hash(r.slug)}&dn=${encodeURIComponent(`[Mochi] ${r.title} - ${label} [1080p]`)}`,
      torrent_url: null,
      created_at: r.updated_at,
    };
  });
