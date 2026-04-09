import json
from functools import lru_cache
from langchain_core.tools import tool

from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage

# ============================================================
# MOCK DATA 
# ============================================================
VEHICLE_TYPES = {
    "e34": "VF e34",
    "vf e34": "VF e34",
    "vf5": "VF5",
    "vf 5": "VF5",
    "vf8": "VF8",
    "vf 8": "VF8",
    "vf3": "VF3",
    "vf 3": "VF3",
    "sang trọng": "Sang trọng",
    "lux": "Sang trọng",
    "tiêu chuẩn": "Tiêu chuẩn"
}

@lru_cache(maxsize=100)
def llm_correction(loc: str):
    """Sử dụng LLM để mapping từ vựng bị STT nghe nhầm thành giá trị chuẩn thực tế, không phụ thuộc DB"""
    if not loc:
        return []

    # Bỏ hẳn vòng lặp check DB cứng ngắc. Phó mặc cho LLM.
    try:
        correction_llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
        system_prompt = """Bạn là một chuyên gia bản đồ học (Google Maps API) chuyên nắn sửa lỗi chính tả địa danh ở Việt Nam, đặc biệt là lỗi do nhận dạng giọng nói (Speech-to-Text).
Nhiệm vụ: Người dùng sẽ đưa cho bạn một địa danh. Địa danh này có thể đã bị bắt sai chính tả do lỗi phát âm vùng miền hoặc viết lóng. 
Hãy sửa nó thành TÊN ĐỊA CHỈ CHUẨN XÁC, chuẩn format chữ hoa/chữ thường như trên bản đồ thực tế. 
- Chỉ trả lời BẰNG MỘT CHUỖI NHỎ DUY NHẤT chứa tên địa điểm, TUYỆT ĐỐI không giải thích thêm.

Quy tắc xử lý:
1. Nếu địa danh người dùng cung cấp quá chung chung (chỉ ghi mỗi Tên Tỉnh, Tên Thành phố hoặc Tên Quận/Huyện, ví dụ: 'Thái Bình', 'Hà Nội', 'Quận 1', 'Nghệ An'), hãy trả về CHUỖI CỨNG: TOO_GENERAL
2. Nếu từ cụm đó hoàn toàn vô nghĩa và chắc chắn không phải là một địa điểm/địa chỉ, hãy trả về CHUỖI CỨNG: NOT_FOUND
3. Nếu hợp lệ (ví dụ: 'len mắc' -> 'Landmark 81', 'học viện bương chính viên thông' -> 'Học viện Công nghệ Bưu chính Viễn thông', 'bến xe mỹ đìn' -> 'Bến xe Mỹ Đình', 'ngõ 565 Nguyên Trái' -> 'Ngõ 565 Nguyễn Trãi'), trả về ĐÚNG CÁI TÊN ĐÓ.
"""

        response = correction_llm.invoke([
            SystemMessage(content=system_prompt),
            HumanMessage(content=loc)
        ])
        
        result_text = response.content.strip()
        
        if result_text == "TOO_GENERAL":
            return ["TOO_GENERAL"]
            
        if result_text != "NOT_FOUND":
            return [result_text]
        return []
        
    except Exception as e:
        print(f"LLM Post-processing error: {e}")
        return []

def correct_vehicle(v: str):
    if not v or v.lower() == "tùy chọn":
        return "Tùy chọn"
    v_lower = v.lower().strip()
    for key, val in VEHICLE_TYPES.items():
        if key in v_lower:
            return val
    return v # Giữ nguyên nếu không mapping được

@tool
def check_location(location: str) -> str:
    """
    Sử dụng công cụ này ĐỂ KIỂM TRA MỘT ĐỊA ĐIỂM (có thể là điểm đón hoặc điểm đến).
    Trả về tên địa điểm đã được chuẩn hóa hoặc lỗi.
    """
    matches = llm_correction(location)
    if matches and matches[0] == "TOO_GENERAL":
        return f'{{"status": "error", "message": "Địa điểm \'{location}\' quá chung chung. Vui lòng hỏi người dùng tên đường, số nhà hoặc địa danh cụ thể."}}'
    if not matches:
        return f'{{"status": "error", "message": "Không tìm thấy địa điểm nào giống với \'{location}\'. Vui lòng hỏi lại người dùng."}}'
    
    if len(matches) > 1:
        locations_list = ", ".join([f"'{m}'" for m in matches])
        return f'{{"status": "ambiguous", "message": "Địa điểm \'{location}\' tương ứng với nhiều kết quả: {locations_list}. Vui lòng hỏi lại."}}'
        
    return f'{{"status": "valid", "corrected_location": "{matches[0]}"}}'

@tool
def check_vehicle(vehicle_type: str) -> str:
    """
    Sử dụng công cụ này ĐỂ KIỂM TRA LOẠI XE mong muốn (VD: VF3, VF5, Sang trọng).
    Trả về loại xe chuẩn hóa hoặc lỗi nếu không hợp lệ.
    """
    final_vehicle = correct_vehicle(vehicle_type)
    if final_vehicle == "Tùy chọn" or not final_vehicle:
        return f'{{"status": "error", "message": "Bạn chưa chọn xe (hoặc tham số xe bị thiếu). Vui lòng hỏi người dùng muốn đi loại xe nào (ví dụ: VF3, VF5, Sang trọng...)"}}'
    return f'{{"status": "valid", "corrected_vehicle": "{final_vehicle}"}}'


@tool
def book_ride(origin: str, destination: str, vehicle_type: str = "Tùy chọn") -> str:
    """
    CHỈ gọi công cụ này NẾU công cụ validate_and_correct_info trả về status: "valid".
    Sử dụng các tham số đã được chuẩn hóa (corrected_origin, corrected_destination, corrected_vehicle_type) từ kết quả trước đó để đặt xe.
    """
    result_json = {
        "status": "success",
        "origin": origin,
        "destination": destination,
        "vehicle_type": vehicle_type,
        "message": f"Đặt chuyến thành công từ {origin} đến {destination} bằng loại xe {vehicle_type}."
    }
    
    return json.dumps(result_json, ensure_ascii=False)


@tool
def get_vehicle_info(query: str) -> str:
    """
    Sử dụng công cụ này ĐỂ TRẢ LỜI CÁC CÂU HỎI THƯỜNG GẶP (FAQ) VỀ THÔNG TIN CÁC LOẠI XE CỦA XANHSM.
    Truyền vào từ khóa về xe người dùng hỏi (ví dụ: 'VF3', 'chỗ ngồi', 'VF5').
    """
    query_lower = query.lower()
    if "vf3" in query_lower or "vf 3" in query_lower or "vinfast 3" in query_lower:
        info = "Xe VF 3 là xe cỡ nhỏ (mini car), thiết kế có 4 chỗ ngồi, phù hợp đi lại cá nhân quãng ngắn trong nội thành, giá cước rẻ nhất."
    elif "vf5" in query_lower or "vf 5" in query_lower or "e34" in query_lower or "tiêu chuẩn" in query_lower:
        info = "Xe VF 5 và VF e34 thuộc dòng XanhSM Tiêu chuẩn (GreenCar), có 5 chỗ ngồi, không gian rộng rãi thoải mái."
    elif "vf8" in query_lower or "vf9" in query_lower or "sang trọng" in query_lower or "lux" in query_lower:
        info = "Xe VF 8 và VF 9 thuộc dòng XanhSM Sang trọng (LuxuryCar), từ 5 đến 7 chỗ ngồi tùy mẫu, nội thất cao cấp, trải nghiệm hoàn toàn êm ái."
    else:
        info = "Dạ hệ thống XanhSM hiện có xe VF 3 (4 chỗ), VF 5 và VF e34 (5 chỗ tiêu chuẩn), VF 8 (5 chỗ VIP) và VF 9 (7 chỗ VIP)."
        
    result_json = {
        "status": "success",
        "info": info
    }
    return json.dumps(result_json, ensure_ascii=False)
