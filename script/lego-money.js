import level from './level.js';

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const groundHeight = canvas.height / 3;
const groundTop = canvas.height - groundHeight;
const groundBottom = canvas.height;
const xSpacing = 100;
let viewPortX = 0;

const treeImages = [];
let minifigImage;
let shopImage;
let minifigWidth;
let minifigHeight;

const minifigState = {
  direction: 'right',
  walking: false,
  x: 100,
  y: 50
}

document.addEventListener('keydown', (event) => {
  switch (event.key) {
    case 'ArrowUp':
    case 'w':
      minifigState.direction = 'up';
      break;
    case 'ArrowDown':
    case 's':
      minifigState.direction = 'down';
      break;
    case 'ArrowLeft':
    case 'a':
      minifigState.direction = 'left';
      break;
    case 'ArrowRight':
    case 'd':
      minifigState.direction = 'right';
      break;
    default:
      return;
  }

  minifigState.walking = true;
});

document.addEventListener('keyup', (event) => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 's', 'a', 'd'].includes(event.key)) {
    minifigState.walking = false;
  }
});

const treeNames = {
  "pine": "images/pine-tree.png",
  "apple": "images/apple-tree.png"
};

function load() {
  let loadedImages = 0;

  for (const treeKind in treeNames) {
    const img = new Image();
    img.onload = imageLoaded;
    img.src = treeNames[treeKind]
    treeImages[treeKind] = img
  }

  minifigImage = new Image();
  minifigImage.src = "images/minifig.png";
  minifigImage.onload = imageLoaded;

  shopImage = new Image();
  shopImage.src = "images/shop.png";
  shopImage.onload = imageLoaded;

  function imageLoaded() {
    loadedImages++;
    if (loadedImages === Object.keys(treeNames).length + 1 + 1) {
      minifigWidth = minifigImage.width / 3;
      minifigHeight = minifigImage.height / 3;
      start();
    }
  }
}

function start() {
  draw();
}

function updateState() {
  if (minifigState.walking) {
    switch (minifigState.direction) {
      case "left":
        minifigState.x -= 5;
        break;
      case "right":
      minifigState.x += 5;
        break;
      case "up":
        minifigState.y += 1;
        break;
      case "down":
        minifigState.y -= 1;
        break;
    }

    if (minifigState.y > 100) {
      minifigState.y = 100;
    } else if (minifigState.y < 0) {
      minifigState.y = 0;
    }
  }

  if (minifigState.x - xSpacing < viewPortX) {
    viewPortX = minifigState.x - xSpacing;
  }
  if (minifigState.x + minifigWidth + xSpacing > viewPortX + canvas.width) {
    viewPortX = minifigState.x + minifigWidth + xSpacing - canvas.width;
  }
}

let frameCount = 0;
function draw() {
  frameCount += 1;
  updateState();

  // Set canvas dimensions to window size
  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawGround();


  const sprites = []

  addMinifig(sprites)

  for (const tree of level.trees) {
    sprites.push({
      x: tree.x,
      y: tree.y,
      width: tree.width,
      height: tree.height,
      image: treeImages[tree.kind],
      sourceX: 0,
      sourceY: 0,
    });
  }
  sprites.push({
    x: level.shop.x,
    y: level.shop.y,
    width: level.shop.width,
    height: level.shop.height,
    sourceX: 0,
    sourceY: 0,
    image: shopImage,
  });

  sprites.sort((a, b) => b.y - a.y);

  for (const sprite of sprites) {
    drawSprite(sprite)
  }

  requestAnimationFrame(draw);
}

function drawGround() {
  ctx.fillStyle = "#8B4513";
  ctx.fillRect(0, canvas.height - groundHeight, canvas.width, groundHeight);
}

function addMinifig(sprites) {
  let row = 0;
  if (minifigState.direction === 'down') {
    row = 1;
  } else if (minifigState.direction === 'up') {
    row = 2;
  }

  let column = 0;
  if (minifigState.walking) {
    column = Math.floor(Date.now() / 250) % 2 + 1; // Alternates between columns 1 and 2
  }

  const flipX = minifigState.direction === 'right';

  sprites.push({
    x: minifigState.x,
    y: minifigState.y,
    width: minifigWidth,
    height: minifigHeight,
    column,
    row,
    rowCount: 3,
    columnCount: 3,
    flipX,
    image: minifigImage,
  });
}

function drawSprite(sprite) {
  const width = (sprite.height * sprite.image.width) / sprite.image.height;
  let x = sprite.x - viewPortX;
  const y = groundBottom - sprite.height - ((sprite.y * groundHeight) / 100);

  if (sprite.flipX) {
    ctx.save();
    ctx.scale(-1, 1);
    x = -1 * x - width;
  }

  let srcX = 0;
  let srcY = 0;
  let srcWidth = sprite.image.width;
  let srcHeight = sprite.image.height;
  if (sprite.rowCount) {
    srcHeight = sprite.image.height / sprite.rowCount;
    srcY = sprite.row * srcHeight;
  }
  if (sprite.columnCount) {
    srcWidth = sprite.image.width / sprite.columnCount;
    srcX = sprite.column * srcWidth;
  }

  ctx.drawImage(
    sprite.image,
    srcX, srcY,
    srcWidth, srcHeight,
    x, y,
    width, sprite.height
  );

  if (sprite.flipX) {
    ctx.restore();
  }
}

load();
