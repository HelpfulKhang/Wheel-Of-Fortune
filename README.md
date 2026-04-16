# 🎡 Wheel of Fortune - Controller Guide

## 📺 1. Hệ Thống & Chế Độ Hiển Thị
- `1` : Chuyển sang màn hình **Bảng Ô Chữ** (Puzzle Board).
- `2` : Chuyển sang màn hình **Vòng Quay** (Wheel).
- `I` : Kích hoạt nhạc Intro (`start.mp3`).
- `C` : Bật / Tắt nhạc nền Menu.
- `Shift Trái` : Chuyển đổi giao diện hiển thị của Scoreboard.

## 📂 2. Nạp Dữ Liệu (Data Loading)
- `4` : Nạp toàn bộ kịch bản Show (`puzzles.json`).
- `5` : Mở hộp thoại nạp cấu hình nón (`wheel.json`) theo vòng.
- `6`, `7`, `8`, `9` : Tải nhanh cấu hình nón cho Vòng 1, Vòng 2, Vòng 3 và Vòng 4.
- `0` : Tải nón vòng **Bonus** (Tự động xào giải thưởng và kiểm tra thẻ MDW của người chơi).

## 🔠 3. Bảng Ô Chữ (Puzzle Board)
- `➡` / `⬅` (Mũi tên Phải/Trái) : Chuyển đổi câu đố tiếp theo / trước đó.
- `⬆` (Mũi tên Lên) : Hiện Chủ đề (Category) và chạy hiệu ứng bừng sáng ô chữ.
- `⬇` (Mũi tên Xuống) : Ẩn Chủ đề.
- `T` : Kích hoạt / Dừng vòng **Tossup** (Lật chữ ngẫu nhiên mỗi 1.5s).
- `G` : Đoán chữ cái (Sẽ hiển thị prompt để nhập chữ, hệ thống tự động lật nếu đúng).
- `3` : Tự động lật các chữ cái cơ bản vòng Bonus: **R, S, T, L, N, E, Ê**.
- `Backspace` : **Giải đúng!** (Phát nhạc Solve, cộng điểm vào Tích lũy, reset điểm vòng và lật toàn bộ chữ).
- `=` : Lật toàn bộ chữ (Dùng khi không ai giải được, reset điểm vòng về 0).

## 🎡 4. Vòng Quay (Wheel Controls)
- `Space` : Nhấn giữ để gồng lực quay, nhả ra để quay nón.
- `Enter` : Chốt điểm từ ô nón hiện tại cho người chơi (Hoặc lật giá trị phong bì vòng Bonus).
- `Q` / `W` : Nhích nón sang Trái / Phải 1 ô (Nudge).
- `B` : **Bankrupt** (Phá sản, đưa điểm về 0 và chuyển lượt).
- `M` : Kích hoạt chuỗi hiệu ứng ô **Mystery** (Nhấn nhiều lần để: Chọn ô -> Lật ô đầu -> Lật ô cuối -> Reset).
- `D` : Lật thẻ **Million Dollar Wedge** (Cộng thẻ MDW vào kho đồ).
- `P` : Cướp điểm (**Power**).
- `S` : Nhặt thẻ **Wild Card** vào kho đồ.

## 🎵 5. Chế Độ Đặc Biệt & Nhạc Nền
- `F` : Kích hoạt **Final Spin**. 
  - *Nhấn lần 1:* Phát nhạc Final Spin.
  - *Nhấn lần 2:* Quay xong, chốt giá trị mỗi chữ cái (1000 + giá trị ô) & phát nhạc Speedup.
  - *Nhấn lần 3:* Tắt chế độ.
- `Shift Phải` : Bật nhạc suy nghĩ (Thinking Music). Nhấn liên tục để xoay vòng: `Think` ➔ `Think 1` ➔ `20s` ➔ `Tắt`.

---
*Developed for **HELPFULKHANG TV** - 2026*