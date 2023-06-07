const len = 200;
const groups = [0, 1, 2, 3, 4];
export const scatterData = [];

let i = 0;
while (i < len) {
  const x = Math.random() * 100;
  const y = Math.random() * 100;

  const group = groups[Math.floor(Math.random() * groups.length)];

  scatterData.push({ x, y, index: i, group });

  i++;
}
