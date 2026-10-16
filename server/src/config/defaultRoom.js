// A gap between the two wall obstacles (y 220-320) acts as a door.
module.exports = {
  roomId: 'main',
  name: 'Infotact HQ',
  width: 1000,
  height: 600,
  obstacles: [
    { id: 'wall-top', x: 450, y: 0, w: 20, h: 220, label: 'Wall' },
    { id: 'wall-bottom', x: 450, y: 320, w: 20, h: 280, label: 'Wall' },
    { id: 'desks', x: 200, y: 300, w: 120, h: 50, label: 'Desks' },
    { id: 'meeting', x: 650, y: 100, w: 160, h: 90, label: 'Meeting table' },
    { id: 'lounge', x: 700, y: 420, w: 140, h: 50, label: 'Lounge' },
  ],
};
