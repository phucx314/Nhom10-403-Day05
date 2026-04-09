# Prototype — AI Voice Booking cho XanhSM

## Mô tả
Tính năng đặt xe bằng giọng nói tích hợp trên ứng dụng XanhSM, hỗ trợ tiếp nhận yêu cầu bằng lời nói thay vì thao tác chạm. Hệ thống sử dụng Speech-to-Text (STT) kết hợp với LLM để phân tích và trích xuất tự động các thông tin cần thiết dưới dạng JSON (điểm đón, điểm khứ hồi/đến, loại xe) để điền vào form đặt xe.

## Level: Working prototype
- Giao diện (UI) giả lập ứng dụng XanhSM bằng NextJS, bao gồm nút thu âm giọng nói (micro), đoạn chat với AI assistant và màn hình xác nhận booking.
- Pipeline xử lý thực tế ở Backend tích hợp STT và LLM để nhận diện và bóc tách dữ liệu từ giọng nói.

## Links
- AI Spec, User Stories, Metrics, ROI: `spec-final.md`
- Kết quả test prompt thực tế (15 testcases): `testcases.md`
- Pitching / Demo Slides: `demo-slides.pdf`
- Code Frontend/Backend: (Xem trong repository / folder source code)

## Tools và API đã dùng
- **Frontend:** Xây dựng bằng React 19 (TypeScript) kết hợp Vite, cùng thư viện giao diện TailwindCSS và Motion để tạo lập UI giả lập XanhSM.
- **Backend/AI:** Pipeline kết hợp công cụ STT (chuyển đổi giọng nói thành văn bản) và LLM prompt engineering trích xuất form JSON.
  - **STT Model:** `gpt-4o-realtime-preview` / `gpt-4o-transcribe` (OpenAI Realtime API).
  - **LLM Agent Model:** `gpt-4o-mini` (LangChain + LangGraph).
- **Prompt:** System prompt yêu cầu trích xuất cấu trúc `{"origin": "...", "destination": "...", "vehicle_type": "..."}` và xử lý các trường hợp hội thoại thiếu thông tin, sai loại bỏ.

## Phân công nhóm

| Thành viên | Vai trò | Phụ trách | Output |
|-----------|---------|-----------|--------|
| **Bùi Quang Hải - 2A202600006** | P1 — Product Lead + P2 — UX Designer | Canvas final, Mini AI spec, User Stories 4 paths | `spec-final.md` phần 1, 2, 6 |
| **Nguyễn Văn Hiếu - 2A202600454** | P3 — Analyst | Eval metrics, Failure modes, ROI 3 kịch bản | `spec-final.md` phần 3, 4, 5 |
| **Vũ Trung Lập - 2A202600347 <br>& Lê Đức Hải - 2A202600470** | P4 — Tech Lead | Setup STT + LLM pipeline, prompt trích xuất JSON (origin, destination, vehicle_type) | Code backend AI + `prompt-tests.md` |
| **Tạ Vĩnh Phúc - 2A202600424** | P5 — Frontend Developer | UI giả lập app XanhSM (nút micro, màn hình xác nhận booking) | Code frontend (HTML/CSS/JS) |
| **Dương Mạnh Kiên - 2A202600048** | P6 — QA + Demo Lead | Tạo bộ test 15 câu, demo script, slides/poster, prototype-readme | `demo-slides.pdf` + `prototype-readme.md` |
