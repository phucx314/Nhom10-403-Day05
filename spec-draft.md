# SPEC draft — Nhom10-403

## Track: XanhSM

## Problem statement

Trải nghiệm đặt xe hiện tại trên app XanhSM mất quá nhiều thao tác (~1 phút: mở app → nhập
điểm đón → gõ điểm đến → chọn loại xe → xác nhận). Gây khó khăn đặc biệt cho người lớn tuổi,
người khiếm thị, hoặc người dùng đang bận tay. AI Voice Agent cho phép user nhấn giữ 1 nút
và nói: "Đặt mình chiếc VF e34 từ nhà ra Landmark 81" → AI tự trích xuất thông tin và nhảy
thẳng đến màn hình xác nhận, giảm 80% thời gian thao tác.

## Canvas draft

|         | Value                                                                                                                              | Trust                                                                                                                                                                                       | Feasibility                                                                                                                                                   |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Trả lời | User đặc biệt (người lớn tuổi, khiếm thị, bận tay). Pain: thao tác nhiều bước, mất 1 phút. AI rút xuống 10 giây qua voice command. | Nếu AI nghe nhầm địa điểm ("Nguyễn Trãi" HN vs HCM) → đặt sai cuốc, mất tiền & thời gian. Mitigation: luôn hiện Card xác nhận "GoXanh từ [A] đến [B], 50k, đúng không?" trước khi trừ tiền. | Voice → STT API → LLM (trích xuất JSON: origin, destination, vehicle_type) → UI Mock. Latency <2.5s. Risk: triệu chứng mô tả mơ hồ, nhiều địa điểm trùng tên. |

**Auto hay aug?** Augmentation — AI là thư ký điền form hộ, user quyết định cuối cùng bấm "Gọi Xe".

**Learning signal:** Nếu LLM điền sai điểm đón/điểm đến và user tự sửa lại trên UI xác nhận
→ hệ thống ghi nhận correction thành từ điển cá nhân/từ đồng nghĩa
(VD: "Cầu Giấy" → "122 Cầu Giấy") để cải thiện cho lần đặt sau.

## Hướng đi chính

- Prototype: Web App giả lập giao diện XanhSM có nút Micro. User nói → AI trích xuất intent → nhảy đến màn hình Booking Map chờ xác nhận
- Eval: Entity Extraction Accuracy ≥ 90%, chú trọng Recall địa điểm (thà hỏi lại chứ không ép địa điểm sai)
- Main failure mode:
  - Mơ hồ tham số: "Bắt xe tới Vincom" → thiếu điểm khởi hành hoặc nhiều Vincom → Agent hỏi lại "Bạn muốn đi Vincom nào?"
  - Nhận diện sai: "Ngã tư Sở" → "Ngã tư Nở" → không tìm thấy trên Map → báo lỗi thân thiện + gợi ý nhập tay hoặc nói lại

## Phân công

| Thành viên | Vai trò | Phụ trách | Output |
|-----------|---------|-----------|--------|
| **Bùi Quang Hải - 2A202600006** | P1 — Product Lead + P2 — UX Designer | Canvas final, Mini AI spec, User Stories 4 paths | `spec-final.md` phần 1, 2, 6 |
| **Nguyễn Văn Hiếu - 2A202600454** | P3 — Analyst | Eval metrics, Failure modes, ROI 3 kịch bản | `spec-final.md` phần 3, 4, 5 |
| **Vũ Trung Lập - 2A202600347 <br>& Lê Đức Hải - 2A202600470** | P4 — Tech Lead | Setup STT + LLM pipeline, prompt trích xuất JSON (origin, destination, vehicle_type) | Code backend AI + `prompt-tests.md` |
| **Tạ Vĩnh Phúc - 2A202600424** | P5 — Frontend Developer | UI giả lập app XanhSM (nút micro, màn hình xác nhận booking) | Code frontend (HTML/CSS/JS) |
| **Dương Mạnh Kiên - 2A202600048** | P6 — QA + Demo Lead | Tạo bộ test 15 câu, demo script, slides/poster, prototype-readme | `demo-slides.pdf` + `prototype-readme.md` |
