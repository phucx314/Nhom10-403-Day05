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

    async with websockets.connect(
        OPENAI_URL,
        additional_headers={
            "Authorization": f"Bearer {API_KEY}",
            "OpenAI-Beta": "realtime=v1"
        }
    ) as openai_ws:

        print("OpenAI WebSocket connected successfully!")

        # init session
        await openai_ws.send(json.dumps({
            "type": "session.update",
            "session": {
                "modalities": ["text"],
                "instructions": "Bạn là một hệ thống chuyển đổi giọng nói thành văn bản. Nhiệm vụ duy nhất của bạn là ghi lại những gì người dùng nói. TUYỆT ĐỐI KHÔNG được trả lời, không tư vấn, không giải thích thêm. Chỉ im lặng.",
                "input_audio_format": "pcm16",
                "input_audio_transcription": {
                    "model": "gpt-4o-transcribe",
                    "language": "vi"
                },
                "turn_detection": None
            }
        }))

        async def client_to_openai():
            try:
                while True:
                    data = await client_ws.receive_text()
                    await openai_ws.send(data)
            except Exception as e:
                print(f"Error reading from client: {e}")

        async def openai_to_client():
            nonlocal chat_history
            try:
                async for message in openai_ws:
                    print(f"From OpenAI: {message}")
                    await client_ws.send_text(message)
                    
                    try:
                        msg_data = json.loads(message)
                        # Intercept STT response completed
                        if msg_data.get("type") == "conversation.item.input_audio_transcription.completed":
                            transcript = msg_data.get("transcript", "").strip()
                            if transcript:
                                print(f"-> Trích xuất giọng nói (STT): {transcript}")
                                
                                # 1. Append user's transcript to history
                                chat_history.append(("human", transcript))
                                
                                # 2. Run graph calculation asynchronously so it doesn't block WS
                                print("-> Agent đang xử lý...")
                                result = await asyncio.to_thread(graph.invoke, {"messages": chat_history})
                                
                                # Extract new messages to send to FE
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
                                            
                                            # Synthesize Speech (TTS) using OpenAI API
                                            # try:
                                            #     tts_response = await openai_client.audio.speech.create(
                                            #         model="tts-1",
                                            #         voice="nova",
                                            #         input=msg.content
                                            #     )
                                            #     audio_base64 = base64.b64encode(tts_response.content).decode('utf-8')
                                                
                                            #     await client_ws.send_text(json.dumps({
                                            #         "type": "audio_playback",
                                            #         "audio_base64": audio_base64
                                            #     }, ensure_ascii=False))
                                            # except Exception as e:
                                            #     print(f"Lỗi khi gọi TTS: {e}")
                                
                                # 3. Cập nhật lại toàn bộ history bao gồm các lệnh gọi tool
                                chat_history = list(result["messages"])
                    except json.JSONDecodeError:
                        pass
                        
            except Exception as e:
                print(f"Error reading from OpenAI: {e}")

        await asyncio.gather(client_to_openai(), openai_to_client())