/**
 * NỘI QUY TIỆM BÁNH — sửa ở đây.
 * Dùng chung cho hộp "đồng ý" lúc đăng ký (trang /gate) và trang /quy-dinh,
 * nên chỉ cần sửa một chỗ là cả hai cùng đổi.
 */

export const TERMS_TITLE = "Nội quy tiệm bánh";
export const TERMS_INTRO =
  "Chào mừng bạn ghé thăm tiệm. Để tiệm luôn giữ được sự ấm cúng, an toàn và duy trì “lò nướng” hoạt động lâu dài, vui lòng đọc kỹ và tuân thủ các quy tắc sau trước khi thưởng thức bánh:";
export const TERMS: { title: string; body: string; penalty?: string }[] = [
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
export const TERMS_NOTE =
  "Lưu ý nhỏ: Khi khách hàng bước vào tiệm và nhận bánh đồng nghĩa với việc đã đồng ý với toàn bộ quy tắc trên.";
