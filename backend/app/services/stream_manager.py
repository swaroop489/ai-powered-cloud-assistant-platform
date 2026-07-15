import asyncio
from typing import Dict, List

class LogStreamManager:
    """
    Manages real-time log streaming subscribers using asyncio Queues.
    """
    def __init__(self):
        # Maps deployment_id -> List of active queues (clients)
        self.active_connections: Dict[str, List[asyncio.Queue]] = {}

    async def connect(self, deployment_id: str) -> asyncio.Queue:
        """
        Create a new queue for a client connection.
        """
        queue = asyncio.Queue()
        if deployment_id not in self.active_connections:
            self.active_connections[deployment_id] = []
        self.active_connections[deployment_id].append(queue)
        return queue

    async def disconnect(self, deployment_id: str, queue: asyncio.Queue):
        """
        Remove a client queue.
        """
        if deployment_id in self.active_connections:
            if queue in self.active_connections[deployment_id]:
                self.active_connections[deployment_id].remove(queue)
            
            # Clean up empty lists
            if not self.active_connections[deployment_id]:
                del self.active_connections[deployment_id]

    async def broadcast(self, deployment_id: str, message: str):
        """
        Push a message to all active clients for this deployment.
        """
        if deployment_id in self.active_connections:
            for queue in self.active_connections[deployment_id]:
                await queue.put(message)

stream_manager = LogStreamManager()
