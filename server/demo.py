import math
import json
import dataclasses
import asyncio
import websockets

@dataclasses.dataclass
class Vehicle:
  id: str
  lat: float
  lng: float
  alt: float
  hdg: float
  status: str
  type: str

vehicle_centres = [
  (51.52, -0.12),
  (51.505, -0.09),
  (51.505, -0.12),
]

vehicles = [
  Vehicle("1", *vehicle_centres[0], 400, 90, 'OK', 'multirotor'),
  Vehicle("2", *vehicle_centres[1], 400, 90, 'WARN', 'fixedwing'),
  Vehicle("3", *vehicle_centres[2], 400, 90, 'ERROR', 'fixedwing')
]

phase = 0

async def simulate():
  global phase
  global vehicles
  while True:
    for i, vehicle in enumerate(vehicles):
      vehicle.hdg = 90 + phase / math.pi * 180;
      (c_lat, c_lng) = vehicle_centres[i]
      vehicle.lat = c_lat + 0.01 * math.cos(phase);
      vehicle.lng = c_lng + 0.01 * math.sin(phase);
      phase = math.fmod( phase + 0.01,  (math.pi * 2))
    await asyncio.sleep(0.1)

async def handler(websocket: websockets.WebSocketCommonProtocol, path):
  print("Got connection")
  while True:
    payload = json.dumps(list(map(dataclasses.asdict, vehicles)))
    await websocket.send(payload)
    await asyncio.sleep(0.5)

if __name__ == "__main__":
  start_server = websockets.serve(handler, "localhost", 8000)

  asyncio.get_event_loop().run_until_complete(start_server)
  asyncio.get_event_loop().run_until_complete(simulate())
  asyncio.get_event_loop().run_forever()
