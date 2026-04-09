# SPEC — AI Product Hackathon

**Nhóm:** 10 
**Track:** ☐ VinFast · ☐ Vinmec · ☐ VinUni-VinSchool · ☑ XanhSM · ☐ Open
<br>
**Problem statement:**  
Trải nghiệm đặt xe trên app Xanh SM hiện tại yêu cầu nhiều thao tác (mở app → nhập điểm đón/đến → chọn xe → xác nhận), gây khó khăn cho người lớn tuổi hoặc khi bận tay, trong khi AI Voice Agent cho phép chỉ cần nói điểm đến để tự động điền thông tin và chuyển thẳng đến bước xác nhận, giúp giảm đáng kể thời gian và công sức.

---

## 1. AI Product Canvas
### Canvas
|   | Value | Trust | Feasibility |
|---|-------|-------|-------------|
| **Core** | **User:** Người lớn tuổi có con cháu đi làm xa hoặc bận rộn, không thể tự lái xe nên cần đặt xe để di chuyển, trong khi việc đi bộ của họ cũng chậm và gặp nhiều khó khăn.<br><br>**Pain:** Người lớn tuổi thường không thành thạo trong việc sử dụng thiết bị điện tử, khiến việc đặt xe thủ công trở nên phức tạp và tốn thời gian; đồng thời thị lực kém cũng khiến họ khó quan sát và thao tác trên giao diện điện thoại.<br><br>**Value:** Người dùng chỉ cần nói điểm đến → hệ thống nhận diện giọng nói (kể cả giọng địa phương / người lớn tuổi) → hiển thị điểm đón & điểm đến rõ ràng → người dùng bấm 1 nút lớn để xác nhận đặt xe. | **Khi sai:** Người dùng thấy địa điểm hiển thị chưa đúng (do AI nghe sai phát âm)<br>**Explain:** Hệ thống hiển thị lý do (ví dụ: “nghe ‘Bạch Mai’ do âm gần giống”, “chọn địa điểm phổ biến gần bạn”).<br>**Sửa:** Cho phép sửa nhanh bằng 1 chạm, chọn lại từ danh sách gợi ý lớn, dễ nhìn hoặc hỏi lại. | **Cost:** Free, AI tích hợp sẵn trong ứng dụng.<br>**Latency:** <2.5s.<br>**Risk:** AI hiểu sai giọng nói (người lớn tuổi, giọng địa phương) → sai điểm đến → cần xác nhận rõ & hỗ trợ nói lại/gợi ý. |
| **Then chốt** | **Augmentation** — cost of reject = 0. Nếu automation → địa điểm sai, tự đặt xe = mất tiền và trải nghiệm tệ. | **4-path:** xem User Stories dưới. | **recision-first + Clarification:** — Ưu tiên chính xác, nhưng khi không chắc → hỏi lại thay vì đoán |

> **[Annotation]** Giảm thao tác đặt xe cho người lớn tuổi (nói → 1 chạm xác nhận). Trust: Minh bạch & kiểm soát — hiển thị rõ, giải thích, cho phép sửa nhanh; không tự động đặt xe (augmentation). Feasibility: Latency thấp (<2.5s), chi phí AI phù hợp; risk: hiểu sai địa điểm → giảm thiểu bằng xác nhận & gợi ý.

### Learning signal

| # | Câu hỏi | Trả lời |
|---|---------|---------|
| 1 | Correction đi vào đâu? | User sửa điểm đón/điểm đến trên UI xác nhận → lưu vào correction log → cập nhật từ điển cá nhân / mapping địa điểm (VD: “Cầu Giấy” → “122 Cầu Giấy”) → cải thiện cho các lần đặt sau |
| 2 | Thu signal gì? | Implicit: tỷ lệ user chấp nhận điểm AI gợi ý. Explicit: user sửa lại địa điểm / chọn lại từ gợi ý. Correction: mapping giọng nói → địa điểm đúng. Alert: khi tỷ lệ sửa tăng bất thường |
| 3 | Data loại nào? | User-specific + Real-time. Giá trị cao vì mỗi người có cách gọi địa điểm khác nhau (VD: “nhà”, “chỗ cũ”, “cổng sau”) mà model chung không học được |

---
<br>

## 2. User stories — 4 paths

**Feature:** Đặt xe bằng giọng nói với hỗ trợ nhận diện accent.  
**Trigger:** User nói điểm đến → AI phân tích giọng nói + ngữ cảnh (vị trí hiện tại) → gợi ý điểm đón & điểm đến (kèm độ tin cậy) → hiển thị để user xác nhận hoặc sửa.

| Path | Diễn biến |
|------|----------|
| Happy | User nói “Đến Bệnh viện Bạch Mai” → AI nhận diện đúng (95%) → hiển thị điểm đón & điểm đến + lý do → nút xác nhận lớn → user bấm đặt xe |
| Low-confidence | User nói “ra Vincom” → AI không chắc (60%) → hiển thị 2–3 địa điểm gần + % → user chọn đúng địa điểm |
| Failure | User nói “đến Cầu Giấy” → AI hiểu thành địa chỉ khác (80%) → hiển thị sai → user không nhận ra, vẫn đặt xe → hậu quả: xe đến sai điểm, mất thời gian & chi phí |
| Correction | User sửa lại địa điểm hoặc bấm “nói lại” → hệ thống ghi nhận:  cách phát âm thực tế của user,  địa điểm đúng được chọn,  ngữ cảnh (vị trí, thời gian). → Dữ liệu này được dùng để:  cải thiện ranking các địa điểm gợi ý cho user đó, điều chỉnh ngưỡng tự tin — nếu pattern tương tự xuất hiện, hệ thống sẽ ưu tiên hỏi lại thay vì tự đoán,  cải thiện model nhận diện giọng nói theo accent theo thời gian. |


### Transition flow giữa các path (Voice Booking)

- **Happy → Failure:**  
User nói điểm đến → AI hiển thị đúng → user tin tưởng và xác nhận → sau đó phát hiện sai (do nghe nhầm accent) → xe đến sai điểm → trải nghiệm xấu (delayed failure)

- **Low-confidence → Happy:**  
AI không chắc (giọng địa phương / phát âm không rõ) → hiển thị nhiều gợi ý → user chọn đúng → hệ thống học → lần sau tăng độ tự tin & ưu tiên đúng địa điểm

- **Failure → Correction → Happy:**  
AI hiểu sai → user sửa lại hoặc nói lại → hệ thống ghi nhận (accent + lựa chọn đúng) → cải thiện ranking & chiến lược hỏi lại → lần sau nhận đúng ngay

- **Failure → Low-confidence:**  
AI từng đoán sai ở pattern tương tự → lần sau giảm độ tự tin → chuyển sang hỏi lại / hiển thị nhiều lựa chọn thay vì auto chọn

- **Failure → Bỏ dùng (Churn):**  
User phải sửa nhiều lần (do giọng khó nhận diện) → mất kiên nhẫn → không dùng voice nữa hoặc rời app

### Edge case

| Edge case | Dự đoán AI sẽ xử lý thế nào | UX nên phản ứng ra sao |
|-----------|----------------------------|------------------------|
| Input bằng ngôn ngữ khác (VD: nói tiếng Anh) | AI có thể nhận diện sai hoặc không map đúng địa điểm | Hiển thị thông báo “Không nhận diện rõ” + nút “Nói lại” + gợi ý địa điểm gần |
| Giọng địa phương / phát âm không rõ | AI map sai sang địa điểm gần âm nhất | Hiển thị nhiều lựa chọn + % độ tin cậy + đọc lại bằng giọng nói để user kiểm tra |
| Input mơ hồ (VD: “về nhà”, “ra chỗ cũ”) | AI không xác định được địa điểm cụ thể | Hỏi lại: “Bạn muốn đến đâu?” + gợi ý địa điểm quen (nhà, cơ quan) |
| Input quá ngắn (VD: “Bách”) | AI không đủ thông tin → nhiều khả năng sai | Hiển thị danh sách gợi ý (Bách Khoa, Bách Hóa…) + yêu cầu chọn |
| Input có nhiễu (ồn, nhiều người nói) | AI nhận sai hoặc cắt thiếu nội dung | Hiển thị kết quả + nút “Nói lại” rõ ràng + gợi ý dùng trong môi trường yên tĩnh |
| Input cố tình gây lỗi / nói linh tinh | AI không map được hoặc trả kết quả ngẫu nhiên | Không đặt xe → yêu cầu nhập lại / nói lại + fallback chọn tay |

### Câu 1. Nếu user sửa AI nhiều lần liên tiếp, UI có nên thay đổi?

Có.  
→ Nếu user phải sửa ≥2–3 lần liên tiếp (do giọng nói khó nhận diện):

- Giảm mức tự động:
  - Không auto chọn 1 địa điểm
  - Luôn hiển thị nhiều gợi ý
- Tăng hỗ trợ:
  - Nút “Nói lại” lớn hơn
  - Ưu tiên danh sách địa điểm quen (nhà, bệnh viện, chợ gần)
- Có thể tạm thời chuyển sang “mode an toàn”:
  - Luôn yêu cầu xác nhận rõ trước khi đặt

→ Mục tiêu: **giảm sai lặp lại & tránh user mất kiên nhẫn**

---

### Câu2. User mới vs user cũ: có cần khác nhau?

Có.

- **User mới:**
  - AI chưa hiểu giọng → nhiều Low-confidence
  - → Hiển thị nhiều gợi ý + hỏi lại thường xuyên
  - → Tránh auto chọn

- **User cũ (đã có history):**
  - Có dữ liệu accent & địa điểm quen
  - → Ưu tiên gợi ý cá nhân hóa
  - → Có thể tăng độ tự tin (ít hỏi lại hơn)

→ Mục tiêu: **cold start = an toàn, lâu dài = cá nhân hóa**

---

### Câu 3. Nếu 2 user sửa AI theo 2 hướng ngược nhau, hệ thống ưu tiên ai?

→ Không “chọn 1 trong 2”, mà **cá nhân hóa theo từng user**:

- Mỗi user có:
  - Từ điển riêng (cách gọi địa điểm)
  - Pattern giọng nói riêng
- Model chung chỉ học:
  - Khi nào nên hỏi lại
  - Pattern phổ biến

→ Ví dụ:
- User A: “Cầu Giấy” = 122 Cầu Giấy  
- User B: “Cầu Giấy” = khu vực chung  
→ Hệ thống giữ 2 cách hiểu riêng biệt

→ Mục tiêu: **tránh overfit theo số đông, giữ đúng ngữ cảnh cá nhân**
<br><br>

---
## 6. Mini AI spec 
### Mini AI Spec (Voice-based Ride Booking for Elderly)

Ứng dụng giải quyết bài toán đặt xe cho người lớn tuổi — nhóm người gặp khó khăn khi sử dụng smartphone do thao tác phức tạp, thị lực kém và không quen nhập liệu. Đặc biệt, họ thường cần di chuyển nhưng không thể tự lái xe, trong khi việc đi bộ cũng chậm và bất tiện.

Giải pháp là một hệ thống đặt xe bằng giọng nói, nơi người dùng chỉ cần nói điểm đến. AI sẽ nhận diện giọng nói (bao gồm cả giọng địa phương và phát âm không rõ), kết hợp với vị trí hiện tại để đề xuất điểm đón và điểm đến. Người dùng chỉ cần bấm một nút lớn để xác nhận đặt xe.

Hệ thống được thiết kế theo hướng augmentation (hỗ trợ, không tự động hoàn toàn) — AI không tự đặt xe mà luôn hiển thị kết quả để người dùng xác nhận. Điều này giúp giảm rủi ro khi nhận diện sai, đặc biệt quan trọng với nhóm người dùng dễ bị ảnh hưởng bởi lỗi hệ thống.

Về chất lượng, hệ thống theo hướng precision-first cho hành động đặt xe (đã hiển thị thì phải đáng tin), nhưng vẫn đảm bảo đủ recall để không bỏ sót ý định của người dùng. Khi không chắc chắn (do giọng địa phương hoặc phát âm khó), AI sẽ chuyển sang chế độ hỏi lại hoặc hiển thị nhiều lựa chọn thay vì tự đoán.

Rủi ro chính của hệ thống là hiểu sai giọng nói, dẫn đến chọn sai điểm đến. Điều này có thể gây hậu quả thực tế như đặt nhầm xe, mất thời gian và chi phí, đặc biệt với người lớn tuổi. Vì vậy, hệ thống tập trung vào việc xác nhận rõ ràng, cho phép sửa nhanh, và hỗ trợ nói lại dễ dàng.

Về dữ liệu, hệ thống xây dựng một data flywheel dựa trên hành vi người dùng. Khi người dùng sửa lại địa điểm hoặc nói lại, hệ thống ghi nhận cách phát âm thực tế, lựa chọn đúng, và ngữ cảnh sử dụng. Dữ liệu này được dùng để: