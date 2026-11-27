import type { Metadata } from "next";
import Link from "next/link";
import { MochiFace } from "@/components/MochiLogo";
import { MochiFlavor, flavorTint } from "@/components/MochiFlavor";
import { FLAVORS } from "@/lib/staff";

/**
 * NỘI DUNG TRANG QUY ĐỊNH — nằm riêng trong file này, KHÔNG dùng chung với trang /gate.
 * Muốn sửa quy định hiển thị ở /quy-dinh thì sửa ngay bên dưới.
 */
const RULES_INTRO =
  "Chào mừng bạn ghé thăm tiệm. Để tiệm luôn giữ được sự ấm cúng, an toàn và duy trì “lò nướng” hoạt động lâu dài, vui lòng đọc kỹ và tuân thủ các quy tắc sau trước khi thưởng thức bánh:";

const RULES: { title: string; body: string; penalty?: string }[] = [
  {
    title: "Tuyệt đối bảo mật không gian tiệm",
    body: "Tiệm hoạt động hoàn toàn kín đáo. Nghiêm cấm khách hàng chụp ảnh màn hình, quay video hay chia sẻ công khai bất kỳ thông tin, hình ảnh hoặc “công thức bánh” nào của tiệm lên mạng xã hội, các diễn đàn, website hay blog khác.",
    penalty: "Chỉ cần chủ tiệm phát hiện dấu hiệu rò rỉ ra bên ngoài, tiệm sẽ lập tức đóng cửa vĩnh viễn và mời toàn bộ khách hàng ra khỏi tiệm không báo trước.",
  },
  {
    title: "Giao tiếp văn minh, tôn trọng lẫn nhau",
    body: "Không toxic, không bình luận tiêu cực ác ý, công kích cá nhân hay sử dụng ngôn từ thô tục, nhạy cảm bị cấm.",
    penalty: "Tài khoản vi phạm sẽ bị cấm cửa ngay lập tức mà không cần nhắc nhở.",
  },
  {
    title: "“Ăn bánh nhớ giữ lửa”",
    body: "Bánh ở tiệm được làm theo hình thức chia sẻ ngang hàng. Sau khi nhận bánh xong, vui lòng giữ nguyên “vỏ túi bánh” trong nhà ít nhất 24–48 giờ hoặc đạt tỷ lệ chia sẻ tối thiểu 1.0 để những vị khách đến sau cũng có thể thưởng thức trọn vẹn. Tránh tình trạng ăn xong vứt ngay.",
  },
  {
    title: "Không mang “công thức” đi nơi khác & không thương mại hóa",
    body: "Tuyệt đối không tự ý sao chép bánh gửi cho người lạ ngoài tiệm, không re-up lên các nền tảng xem trực tuyến công khai và nghiêm cấm mọi hành vi mua bán, trao đổi thương mại dưới mọi hình thức.",
  },
  {
    title: "Không bàn luận chính trị, tôn giáo và các vấn đề nhạy cảm",
    body: "Khu vực trò chuyện chỉ dành để đánh giá hương vị bánh, đề xuất món mới hoặc trao đổi kỹ thuật. Mọi chủ đề gây tranh cãi, kích động thù địch hoặc vi phạm pháp luật đều không được hoan nghênh.",
  },
  {
    title: "Quyền quyết định cao nhất thuộc về Chủ Tiệm",
    body: "Trong mọi tình huống phát sinh hoặc tranh chấp, quyết định của chủ tiệm là quyết định cuối cùng nhằm bảo vệ sự tồn vong của cả tiệm.",
  },
  {
    title: "30 ngày để ghé tiệm",
    body: "Khách hàng có 30 ngày để ghé tiệm, sau đó nếu không có lịch sử ghé qua thì khách hàng sẽ bị tước quyền vào tiệm. Trong vòng 2 năm, nếu khách hàng không còn mặn mà ghé tiệm nữa thì khách hàng sẽ được đem đi cấp đông.",
  },
];

export const metadata: Metadata = {
  title: "Quy định của tiệm",
  robots: { index: false, follow: false },
};

export default function RulesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-10 sm:px-6 md:pt-14">
      <header className="text-center">
        <MochiFace className="animate-wobble mx-auto h-20 w-20 drop-shadow-md" />
        <h1 className="mt-3 font-display text-3xl font-black md:text-4xl">Quy định của tiệm</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted md:text-base">{RULES_INTRO}</p>
      </header>

      <ol className="mt-10 space-y-4">
        {RULES.map((t, i) => {
          const flavor = FLAVORS[i % FLAVORS.length];
          return (
            <li key={t.title} className="shadow-mochi flex gap-3.5 rounded-[1.75rem] bg-surface p-4 ring-1 ring-line sm:gap-4 sm:p-6">
              <span
                aria-hidden
                className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl sm:h-14 sm:w-14"
                style={{ background: flavorTint(flavor) }}
              >
                <MochiFlavor flavor={flavor} className="h-9 w-9 sm:h-10 sm:w-10" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-extrabold uppercase tracking-wide text-sakura-deep">Điều {i + 1}</p>
                <h2 className="font-display text-lg font-black leading-snug sm:text-xl">{t.title}</h2>
                <p className="mt-1.5 text-[0.95rem] leading-relaxed [overflow-wrap:anywhere]">{t.body}</p>
                {t.penalty && (
                  <p className="mt-3 rounded-xl bg-sakura-deep/10 px-4 py-2.5 text-sm leading-relaxed">
                    <b className="text-sakura-deep">Hình phạt:</b> {t.penalty}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      <p className="mt-8 rounded-2xl bg-sakura/20 px-5 py-4 text-center text-sm font-bold leading-relaxed">{RULES_NOTE}</p>

      <div className="mt-8 text-center">
        <Link href="/" className="press inline-flex rounded-full bg-sakura-deep px-6 py-3 font-extrabold text-white shadow">
          Về cửa tiệm
        </Link>
      </div>
    </div>
  );
}
