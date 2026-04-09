# 🧪 Bộ Test Cases — AI Voice Agent XanhSM
**Nhóm:** Nhom10-403 | **QA Lead:** P6 | **Ngày test:** 09/04/2026

---

## Hướng dẫn ghi log

Sau mỗi test case, điền vào cột kết quả:
- **Pass/Fail:** Pass = đúng hoặc hỏi lại đúng chỗ | Fail = điền sai / không phản hồi
- **Ghi chú:** Hành vi bất thường, độ trễ, lỗi UI

---

## Phân loại test

| Loại | Số câu | Mục tiêu |
|------|--------|----------|
| 🟢 Happy path | 5 | Thông tin đầy đủ, rõ ràng |
| 🟡 Thiếu thông tin | 4 | AI phải hỏi lại đúng chỗ |
| 🟠 Mơ hồ / nhiều nghĩa | 3 | AI xử lý địa điểm không rõ |
| 🔴 Giọng vùng miền / nhiễu | 3 | STT nhận dạng giọng khác nhau |

---

## 🟢 Happy Path (5 câu)

> Kỳ vọng: AI trích xuất đủ thông tin (điểm đón, điểm đến, loại xe), không hỏi lại

---

### TC-01
**Input (giọng nói):**
> "Đặt xe từ 122 Cầu Giấy đến Landmark 81, cho tôi xe VF e34"

**Kỳ vọng UI:** Hiện card xác nhận, không hỏi lại

| Trường | Kỳ vọng | AI output thực tế | Pass/Fail |
|--------|---------|-------------------|-----------|
| origin | 122 Cầu Giấy | 122 Cầu Giấy | Pass |
| destination | Landmark 81 | Landmark 81 | Pass |
| vehicle_type | VF e34 | VF e34 | Pass |
| Hành động | Hiện card xác nhận | Dạ đã lên đơn, màn hình đang hiển thị chuyến đi... | Pass |

**Ghi chú:** Đặt xe thành công, trích xuất chính xác.

---

### TC-02
**Input (giọng nói):**
> "Cho tôi đặt một chuyến xe từ nhà tôi ở Hoàng Mai đến sân bay Nội Bài, loại xe 7 chỗ"

| Trường | Kỳ vọng | AI output thực tế | Pass/Fail |
|--------|---------|-------------------|-----------|
| origin | Hoàng Mai | Báo lỗi địa điểm quá chung chung | Fail |
| destination | Sân bay Nội Bài | Sân bay Nội Bài | Pass |
| vehicle_type | 7 chỗ | 7 chỗ | Pass |

**Ghi chú:** LLM đánh giá "Hoàng Mai" (Quận) là TOO_GENERAL nên AI sẽ từ chối và hỏi lại, làm đứt happy path.

---

### TC-03
**Input (giọng nói):**
> "Tôi cần đi từ Vinhomes Smart City sang Mỹ Đình, lấy xe máy điện"

| Trường | Kỳ vọng | AI output thực tế | Pass/Fail |
|--------|---------|-------------------|-----------|
| origin | Vinhomes Smart City | Vinhomes Smart City | Pass |
| destination | Mỹ Đình | Mỹ Đình | Pass |
| vehicle_type | xe máy điện | xe máy điện | Pass |

**Ghi chú:** Trích xuất tốt.

---

### TC-04
**Input (giọng nói):**
> "Book xe ô tô từ Hồ Gươm về khách sạn Sofitel"

| Trường | Kỳ vọng | AI output thực tế | Pass/Fail |
|--------|---------|-------------------|-----------|
| origin | Hồ Gươm | Hồ Gươm | Pass |
| destination | Khách sạn Sofitel | Khách sạn Sofitel | Pass |
| vehicle_type | ô tô | ô tô | Pass |

**Ghi chú:** Mặc dù "ô tô" không có trong từ điển map xe cứng, tool vẫn cho qua là hợp lệ.

---

### TC-05
**Input (giọng nói):**
> "Đặt VF e34 từ trường Đại học Bách Khoa đến bến xe Giáp Bát"

| Trường | Kỳ vọng | AI output thực tế | Pass/Fail |
|--------|---------|-------------------|-----------|
| origin | Đại học Bách Khoa | Trường Đại học Bách Khoa | Pass |
| destination | Bến xe Giáp Bát | Bến xe Giáp Bát | Pass |
| vehicle_type | VF e34 | VF e34 | Pass |

**Ghi chú:** Trích xuất chuẩn xác.

---

## 🟡 Thiếu thông tin (4 câu)

> Kỳ vọng: AI **hỏi lại đúng trường còn thiếu**, không tự điền bừa

---

### TC-06 — Thiếu điểm đón
**Input (giọng nói):**
> "Đặt xe đi Vincom Bà Triệu"

**Kỳ vọng:** AI hỏi lại điểm đón
> *"Bạn muốn được đón từ đâu ạ?"*

| Kiểm tra | Kỳ vọng | Thực tế | Pass/Fail |
|----------|---------|---------|-----------|
| AI hỏi lại? | Có | Có | Pass |
| Hỏi đúng trường? | origin | Điểm đón (origin) | Pass |
| AI tự điền origin? | Không | Không | Pass |

**Ghi chú:** Lời nhắc (system prompt) và logic báo lỗi hoạt động chuẩn.

---

### TC-07 — Thiếu điểm đến
**Input (giọng nói):**
> "Cho xe đến đón tôi ở 45 Nguyễn Huệ"

**Kỳ vọng:** AI hỏi lại điểm đến
> *"Bạn muốn đến đâu ạ?"*

| Kiểm tra | Kỳ vọng | Thực tế | Pass/Fail |
|----------|---------|---------|-----------|
| AI hỏi lại? | Có | Có | Pass |
| Hỏi đúng trường? | destination | Điểm đến (destination) | Pass |

**Ghi chú:** AI nhận diện đúng mục thiếu.

---

### TC-08 — Thiếu cả điểm đón lẫn loại xe
**Input (giọng nói):**
> "Tôi muốn đặt xe đi Hà Đông"

**Kỳ vọng:** AI hỏi lại điểm đón trước (ưu tiên thông tin quan trọng nhất)

| Kiểm tra | Kỳ vọng | Thực tế | Pass/Fail |
|----------|---------|---------|-----------|
| AI hỏi lại? | Có | Có | Pass |
| Hỏi đúng trường trước? | origin | Điểm đón (origin) | Pass |
| AI tự điền bừa? | Không | Không | Pass |

**Ghi chú:** Có khả năng hỏi song song hoặc ưu tiên thông tin thiết yếu.

---

### TC-09 — Không rõ loại xe
**Input (giọng nói):**
> "Đặt xe từ Giảng Võ đến Times City"

**Kỳ vọng:** AI hỏi loại xe hoặc đề xuất mặc định
> *"Bạn muốn dùng loại xe nào? VF e34, xe 7 chỗ, hay xe máy điện?"*

| Kiểm tra | Kỳ vọng | Thực tế | Pass/Fail |
|----------|---------|---------|-----------|
| AI hỏi hoặc đề xuất? | Có | Có | Pass |
| Tự điền vehicle_type? | Không (hoặc đề xuất để xác nhận) | Không | Pass |

**Ghi chú:** check_vehicle từ chối thông tin xe rỗng/sai, buộc AI phải hỏi lại người dùng.

---

## 🟠 Mơ hồ / nhiều nghĩa (3 câu)

> Kỳ vọng: AI nhận ra địa điểm không rõ và hỏi xác nhận, không tự chọn

---

### TC-10 — Địa điểm có nhiều chi nhánh
**Input (giọng nói):**
> "Đặt xe từ nhà đến Vincom"

**Kỳ vọng:** AI hỏi rõ Vincom nào
> *"Bạn muốn đến Vincom nào? Vincom Bà Triệu, Vincom Royal City, hay Vincom Times City?"*

| Kiểm tra | Kỳ vọng | Thực tế | Pass/Fail |
|----------|---------|---------|-----------|
| AI nhận ra mơ hồ? | Có | Không (Bug system) | Fail |
| Hỏi clarify? | Có | Không | Fail |
| Tự điền một Vincom bừa? | Không | Có (đặt luôn là Vincom) | Fail |

**Ghi chú:** BUG: Hàm `llm_correction` trong tools.py luôn chỉ trả về 1 chuỗi duy nhất, dẫn đến logic check `len(matches) > 1` (để kết luận ambiguous) vĩnh viễn không bao giờ xảy ra. AI sẽ tự chốt bừa 1 Vincom.

---

### TC-11 — Địa danh chung chung
**Input (giọng nói):**
> "Đưa tôi ra chợ"

**Kỳ vọng:** AI hỏi cụ thể chợ nào hoặc địa chỉ

| Kiểm tra | Kỳ vọng | Thực tế | Pass/Fail |
|----------|---------|---------|-----------|
| AI hỏi clarify? | Có | Có | Pass |
| Tự điền destination? | Không | Không | Pass |

**Ghi chú:** LLM phát hiện "chợ" là TOO_GENERAL hoặc NOT_FOUND và kích hoạt lỗi. AI hỏi bù thông tin đúng chuẩn.

---

### TC-12 — Tên địa điểm tiếng lóng / viết tắt
**Input (giọng nói):**
> "Đặt xe từ BK đến ĐH Ngoại Thương"

> *"BK" = Bách Khoa — AI cần nhận ra hoặc hỏi xác nhận*

| Kiểm tra | Kỳ vọng | Thực tế | Pass/Fail |
|----------|---------|---------|-----------|
| AI hiểu "BK" = Bách Khoa? | Có hoặc hỏi lại | Có (LLM sửa thành Bách Khoa) | Pass |
| destination nhận đúng? | ĐH Ngoại Thương | ĐH Ngoại Thương | Pass |

**Ghi chú:** LLM có System prompt dùng cho sửa lỗi tiếng lóng hoạt động tốt.

---

## 🔴 Giọng vùng miền / nhiễu (3 câu)

> Kỳ vọng: STT nhận dạng được, nếu sai thì AI phải hỏi xác nhận thay vì điền sai

> ⚠️ Lưu ý: Nếu không có người thật đọc giọng vùng miền, có thể **mô phỏng bằng text input** với cách viết đặc trưng

---

### TC-13 — Giọng miền Nam (mô phỏng)
**Input (text mô phỏng giọng Nam):**
> "Đặt xe từ Bình Dương dzìa Sài Gòn, xe 4 chỗ nha"

> *"dzìa" = "về", "Sài Gòn" = TP.HCM — test STT + NLU*

| Kiểm tra | Kỳ vọng | Thực tế | Pass/Fail |
|----------|---------|---------|-----------|
| origin nhận đúng? | Bình Dương | Bình Dương | Pass |
| destination nhận đúng? | Sài Gòn / TP.HCM | Sài Gòn | Pass |
| vehicle_type? | xe 4 chỗ | xe 4 chỗ | Pass |

**Ghi chú:** STT/LLM xử lý được tiếng địa phương "dzìa" thành "về".

---

### TC-14 — Câu nói nhanh, nuốt chữ
**Input (giọng nói nhanh):**
> "Đặt xe từ cầu giấy đến mỹ đình xe ef e ba tư"

> *"ef e ba tư" = cách đọc nhanh của "VF e34"*

| Kiểm tra | Kỳ vọng | Thực tế | Pass/Fail |
|----------|---------|---------|-----------|
| origin? | Cầu Giấy | Cầu Giấy | Pass |
| destination? | Mỹ Đình | Mỹ Đình | Pass |
| vehicle_type? | VF e34 (hoặc hỏi lại) | ef e ba tư (Không map được) | Fail |

**Ghi chú:** BUG LOGIC: `check_vehicle` không dùng LLM mà chỉ lookup từ điển tĩnh, nên không thể gỡ lỗi cho "ef e ba tư". Nó trả về chuỗi gốc và AI xem đó là hợp lệ luôn (FAIL).

---

### TC-15 — Có tiếng ồn / nói lại giữa chừng
**Input (giọng nói):**
> "Đặt xe từ... ừm... từ Nguyễn Trãi đến... đến Hồ Tây, cho tôi xe máy"

> *Test khả năng xử lý câu ngập ngừng, có filler words*

| Kiểm tra | Kỳ vọng | Thực tế | Pass/Fail |
|----------|---------|---------|-----------|
| Bỏ qua filler "ừm"? | Có | Có | Pass |
| origin? | Nguyễn Trãi | Nguyễn Trãi | Pass |
| destination? | Hồ Tây | Hồ Tây | Pass |
| vehicle_type? | xe máy điện | xe máy | Pass |

**Ghi chú:** Nhận dạng tốt và loại bỏ filter word thành công.

---

## 📊 Bảng tổng hợp kết quả

| TC | Loại | Pass | Fail | Ghi chú nhanh |
|----|------|------|------|---------------|
| TC-01 | Happy | x | | Lên đơn chuẩn xác |
| TC-02 | Happy | | x | Fallback lỗi vi "Hoàng Mai" là quận |
| TC-03 | Happy | x | | Trích xuất chuẩn |
| TC-04 | Happy | x | | Trích xuất chuẩn |
| TC-05 | Happy | x | | Trích xuất chuẩn |
| TC-06 | Thiếu info | x | | Hỏi thiếu origin chuẩn |
| TC-07 | Thiếu info | x | | Hỏi thiếu dest chuẩn |
| TC-08 | Thiếu info | x | | Hỏi thông tin chốt |
| TC-09 | Thiếu info | x | | Đề xuất xe khi chưa rõ |
| TC-10 | Mơ hồ | | x | Lỗi code báo không ra ambiguous |
| TC-11 | Mơ hồ | x | | Phản hồi địa điểm ảo |
| TC-12 | Mơ hồ | x | | Hiểu viết tắt "BK" |
| TC-13 | Vùng miền | x | | Hiểu giọng từ ngữ địa phương |
| TC-14 | Vùng miền | | x | Lỗi bắt lỗi xe dựa từ điển tĩnh |
| TC-15 | Vùng miền | x | | Lọc nhiễu filter từ "ừm" tốt |
| **Tổng** | | **12/15** | **3/15** | |

---

## 🚨 Bug log (điền khi phát hiện lỗi)

| # | TC liên quan | Mô tả lỗi | Mức độ | Đã báo P4/P5? |
|---|-------------|-----------|--------|---------------|
| 1 | TC-10 | Lỗi trong `llm_correction` tại `tools.py` luôn trả về 1 kết quả duy nhất. Do đó `len(matches) > 1` không bao giờ thành True để kích hoạt logic báo 'ambiguous' cho các địa chỉ mơ hồ (như Vincom). | 🔴 Critical | Đã báo |
| 2 | TC-14 | `check_vehicle` không dùng LLM mà xài từ điển `VEHICLE_TYPES` tĩnh. Khi STT bắt chữ phát âm ("ef e ba tư" thay vì VF e34), hệ thống không map được nhưng không chọc bắt lỗi mà vẫn pass qua. | 🟡 Major | Đã báo |

---

## ✅ Kết luận test

- **Pass rate:** 12/15 (80%)
- **Critical bugs:** 1
- **Đề xuất trước demo:** Cần gấp rút sửa lại dòng return trong `llm_correction` để hỗ trợ xuất ra mảng hoặc nhắc Prompt trả về mảng Json nếu có nhiều location trùng tên. Nâng cấp bộ Map của vehicle để bao gồm cả các cách đọc hiểu sai của STT hoặc dùng LLM để mapping vehicle.