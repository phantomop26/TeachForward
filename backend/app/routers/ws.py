from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query
from typing import List, Dict
from ..deps import get_db
from sqlalchemy.orm import Session
from .. import models
import json

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        if user_id not in self.active:
            self.active[user_id] = []
        self.active[user_id].append(websocket)

    def disconnect(self, websocket: WebSocket, user_id: str):
        if user_id in self.active:
            try:
                self.active[user_id].remove(websocket)
                if not self.active[user_id]:
                    del self.active[user_id]
            except ValueError:
                pass

    async def send_to_user(self, user_id: str, message: str):
        if user_id in self.active:
            for conn in list(self.active[user_id]):
                try:
                    await conn.send_text(message)
                except:
                    pass

    async def broadcast(self, message: str):
        for user_id in list(self.active.keys()):
            await self.send_to_user(user_id, message)

manager = ConnectionManager()

@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    user_id: str = Query(...),
    db: Session = Depends(get_db)
):
    await manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            try:
                msg_data = json.loads(data)
                sender_id = int(user_id)
                receiver_id = msg_data.get("receiver_id")
                content = msg_data.get("content", data)
                
                msg = models.Message(sender_id=sender_id, receiver_id=receiver_id, content=content)
                db.add(msg)
                db.commit()
                
                response = json.dumps({
                    "sender_id": sender_id,
                    "content": content,
                    "timestamp": msg.created_at.isoformat()
                })
                
                if receiver_id:
                    await manager.send_to_user(str(receiver_id), response)
                    await manager.send_to_user(user_id, response)
                else:
                    await manager.broadcast(response)
            except json.JSONDecodeError:
                msg = models.Message(sender_id=int(user_id), content=data)
                db.add(msg)
                db.commit()
                await manager.broadcast(data)
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)