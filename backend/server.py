import asyncio
import websockets
import json
import os
import base64
from fastapi import FastAPI, WebSocket
from dotenv import load_dotenv
from openai import AsyncOpenAI

from agent import graph

load_dotenv()
API_KEY = os.getenv("OPENAI_API_KEY")
openai_client = AsyncOpenAI(api_key=API_KEY)

app = FastAPI()

OPENAI_URL = "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview"

@app.websocket("/ws")
async def websocket_endpoint(client_ws: WebSocket):
    await client_ws.accept()
    
    # Store chat history per session to maintain context if agent asks clarification questions
    chat_history = []
    print("Mới kết nối WebSocket Frontend")

    WIT_TOKEN = os.getenv("WIT_AI_TOKEN")

    async def run_agent_and_respond(user_text: str):
        nonlocal chat_history
        chat_history.append(("human", user_text))
        
        print("-> Agent đang xử lý...")
        result = await asyncio.to_thread(graph.invoke, {"messages": chat_history})
        
        new_messages = result["messages"][len(chat_history):]
        
        for msg in new_messages:
            if msg.type == "tool":
                print(f"-> Gửi Tool Response ({msg.name}) về FE: {msg.content}")
                await client_ws.send_text(json.dumps({
                    "type": "tool_response",
                    "tool_name": msg.name,
                    "content": msg.content
                }, ensure_ascii=False))
            elif msg.type == "ai":
                if hasattr(msg, "tool_calls") and getattr(msg, "tool_calls"):
                    for tc in msg.tool_calls:
                        print(f"-> Gọi tool: {tc['name']}({tc['args']})")
                        await client_ws.send_text(json.dumps({
                            "type": "tool_call",
                            "tool_name": tc['name'],
                            "args": tc['args']
                        }, ensure_ascii=False))
                
                if msg.content:
                    print(f"-> Agent Response: {msg.content}")
                    await client_ws.send_text(json.dumps({
                        "type": "agent_response",
                        "text": msg.content
                    }, ensure_ascii=False))
        
        chat_history = list(result["messages"])

    try:
        while True:
            data_str = await client_ws.receive_text()
            try:
                msg_data = json.loads(data_str)
            except json.JSONDecodeError:
                continue
                
            if msg_data.get("type") == "audio":
                # Nhận audio dạng chuỗi base64 từ frontend
                audio_b64 = msg_data.get("data", "")
                if not audio_b64:
                    continue
                
                print("-> Đã nhận Audio từ Frontend, đang gửi lên Wit.ai để phân tích...")
                
                try:
                    # Tách phần metadata data:audio/webm;base64, nếu có
                    if "," in audio_b64:
                        audio_b64 = audio_b64.split(",")[1]
                        
                    audio_bytes = base64.b64decode(audio_b64)
                    
                    import httpx
                    import re
                    
                    # Gọi endpoint speech của Wit.ai giống file HTML của bạn
                    headers = {
                        "Authorization": f"Bearer {WIT_TOKEN}",
                        "Content-Type": "audio/wav",
                    }
                    
                    # Sử dụng httpx để request không block (hoặc asyncio.to_thread với requests)
                    async with httpx.AsyncClient() as client:
                        resp = await client.post(
                            "https://api.wit.ai/speech?v=20260409",
                            headers=headers,
                            content=audio_bytes,
                            timeout=30.0
                        )
                        
                        # Hackathon Trick: Moi cái chữ cuối cùng ra giống hệt mã JS của bạn
                        raw_text = resp.text
                        matches = re.findall(r'"text"\s*:\s*"([^"]+)"', raw_text)
                        
                        transcript = matches[-1] if matches else ""
                        transcript = transcript.strip()
                        
                        if transcript:
                            print(f"-> Trích xuất giọng nói (Wit.ai): {transcript}")
                            
                            # 1. Gửi tin nhắn text của user lại cho Frontend để nó render lên UI luôn
                            await client_ws.send_text(json.dumps({
                                "type": "user_message",
                                "text": transcript
                            }))
                            
                            # 2. Chạy agent logic
                            await run_agent_and_respond(transcript)
                        else:
                            print("-> Lỗi/Không nhận diện được giọng nói.")
                except Exception as e:
                    import traceback
                    traceback.print_exc()
                    print(f"Lỗi phần xử lý Audio/Agent: {repr(e)}")
            elif msg_data.get("type") == "text":
                transcript = msg_data.get("data", "").strip()
                if transcript:
                    print(f"-> Nhận Text từ FE: {transcript}")
                    await client_ws.send_text(json.dumps({
                        "type": "user_message",
                        "text": transcript
                    }))
                    await run_agent_and_respond(transcript)

    except websockets.exceptions.ConnectionClosed:
        print("Frontend ngắt kết nối WebSocket.")
    except Exception as e:
        print(f"Lỗi kết nối WS: {e}")