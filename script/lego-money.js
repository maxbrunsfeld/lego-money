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
  y: (groundTop + groundHeight / 2)
}

const treeStates = [];

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
        minifigState.y -= 5;
        break;
      case "down":
        minifigState.y += 5;
        break;
    }

    if (minifigState.y > groundBottom) {
      minifigState.y = groundBottom;
    } else if (minifigState.y < groundTop) {
      minifigState.y = groundTop;
    }
  }

  if (minifigState.x - xSpacing < viewPortX) {
    viewPortX = minifigState.x - xSpacing;
  }
  if (minifigState.x + minifigWidth + xSpacing > viewPortX + canvas.width) {
    viewPortX = minifigState.x + minifigWidth + xSpacing - canvas.width;
  }
}

function draw() {
  updateState();

  // Set canvas dimensions to window size
  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawGround();
  drawTrees();
  drawShop();
  drawMinifig();

  requestAnimationFrame(draw);
}

function drawShop() {
  const shop = level.shop;
  const shopY = groundBottom - shop.height - (shop.y * groundHeight) / 100;
  const shopWidth = (shop.height * shopImage.width) / shopImage.height;
  ctx.drawImage(shopImage, shop.x - viewPortX, shopY, shopWidth, shop.height);
}

function drawGround() {
  ctx.fillStyle = "#8B4513";
  ctx.fillRect(0, canvas.height - groundHeight, canvas.width, groundHeight);
}

function drawTrees() {
  // Place trees at random positions
  for (const tree of level.trees) {
    const treeImg = treeImages[tree.kind];
    const treeY = groundBottom - tree.height - (tree.y * groundHeight) / 100;
    const treeWidth = (tree.height * treeImg.width) / treeImg.height;
    ctx.drawImage(treeImg, tree.x - viewPortX, treeY, treeWidth, tree.height);
  }
}

function drawMinifig() {
  const x = minifigState.x - viewPortX;
  const y = minifigState.y - minifigHeight

  // Determine which row to use based on direction
  let sourceY = 0; // Default: facing left/right (top row)
  if (minifigState.direction === 'down') {
    sourceY = minifigHeight; // Second row
  } else if (minifigState.direction === 'up') {
    sourceY = minifigHeight * 2; // Third row
  }

  // Determine which column to use based on walking state
  let sourceX = 0; // Default: not walking (first column)
  if (minifigState.walking) {
    // If walking, use one of the animation frames (second or third column)
    sourceX = Math.floor(Date.now() / 250) % 2 + 1; // Alternates between columns 1 and 2
    sourceX *= minifigWidth;
  }

  ctx.save();

  if (minifigState.direction === 'right') {
    // Flip horizontally for right-facing direction
    ctx.scale(-1, 1);
    ctx.drawImage(
      minifigImage,
      sourceX, sourceY,                // Source position
      minifigWidth, minifigHeight,       // Source dimensions
      -x - minifigWidth, y,             // Adjust x position for flipped context
      minifigWidth, minifigHeight        // Destination dimensions
    );
  } else {
    // No flipping needed for other directions
    ctx.drawImage(
      minifigImage,
      sourceX, sourceY,           // Source position
      minifigWidth, minifigHeight,  // Source dimensions
      x, y,                       // Destination position
      minifigWidth, minifigHeight   // Destination dimensions
    );
  }

  ctx.restore();
}

// Start loading the trees
load();
