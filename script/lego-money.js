const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const groundHeight = canvas.height / 3;
const groundTop = canvas.height - groundHeight;
const groundBottom = canvas.height;
let viewPortX = 0;

const treeImages = [];
let loadedImages = 0;
let minifigImage;

const minifigState = {
  direction: 'right',
  walking: false,
  x: 100,
  y: (groundTop + groundHeight / 2)
}

const treeStates = [];

document.addEventListener('keydown', (event) => {
  minifigState.walking = true;
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
  }
  draw();
});

document.addEventListener('keyup', (event) => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 's', 'a', 'd'].includes(event.key)) {
    minifigState.walking = false;
  }
  draw();
});

const treeNames = ["pine-tree.png", "apple-tree.png"];
function load() {
  for (let i = 0; i < treeNames.length; i++) {
    const treeName = treeNames[i];
    const img = new Image();
    img.onload = imageLoaded;
    img.src = `images/${treeName}`; // Assuming tree images are named tree1.png, tree2.png, etc.
    treeImages.push(img);
  }

  minifigImage = new Image();
  minifigImage.src = "images/minifig.png";
  minifigImage.onload = imageLoaded;

  function imageLoaded() {
    loadedImages++;
    if (loadedImages === treeNames.length + 1) {
      start();
    }
  }
}

function start() {
  for (let i = 0; i < 15; i++) {
    const treeImg = treeImages[Math.floor(Math.random() * treeImages.length)];
    const maxTreeHeight = canvas.height * 0.5;
    const minTreeHeight = canvas.height * 0.1;
    const treeHeight =
      minTreeHeight + Math.random() * (maxTreeHeight - minTreeHeight);
    const treeWidth = (treeImg.width * treeHeight) / treeImg.height;
    const x = Math.random() * canvas.width;
    const minTreeY = canvas.height - groundHeight - treeHeight;
    const maxTreeY = canvas.height - treeHeight;
    const y = minTreeY + Math.random() * (maxTreeY - minTreeY);
    treeStates.push({
      x,
      y,
      image: treeImg,
      height: treeHeight,
      width: treeWidth,
    })
  }

  draw();
}

function draw() {
  if (minifigState.walking) {
    switch (minifigState.direction) {
      case "left":
        minifigState.x -= 0.1;
        break;
      case "right":
      minifigState.x += 0.1;
        break;
      case "up":
        minifigState.y -= 0.1;
        break;
      case "down":
        minifigState.y += 0.1;
        break;
    }

    if (minifigState.y > groundBottom) {
      minifigState.y = groundBottom;
    } else if (minifigState.y < groundTop) {
      minifigState.y = groundTop;
    }
  }

  // Set canvas dimensions to window size
  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawTrees();
  drawMinifig();

  requestAnimationFrame(draw);
}

function drawTrees() {
  // Draw ground
  ctx.fillStyle = "#8B4513"; // Brown
  ctx.fillRect(0, canvas.height - groundHeight, canvas.width, groundHeight);

  // Place trees at random positions
  for (const tree of treeStates) {
    ctx.drawImage(tree.image, tree.x, tree.y, tree.width, tree.height);
  }
}

function drawMinifig() {
  // Assuming the sprite sheet has a 3x3 grid of images
  // Extract only the top-left sprite
  const spriteWidth = minifigImage.width / 3;
  const spriteHeight = minifigImage.height / 3;

  const x = minifigState.x;
  const y = minifigState.y - spriteHeight

  console.log(minifigImage, spriteWidth, spriteHeight)

  // Determine which row to use based on direction
  let sourceY = 0; // Default: facing left/right (top row)
  if (minifigState.direction === 'down') {
    sourceY = spriteHeight; // Second row
  } else if (minifigState.direction === 'up') {
    sourceY = spriteHeight * 2; // Third row
  }

  // Determine which column to use based on walking state
  let sourceX = 0; // Default: not walking (first column)
  if (minifigState.walking) {
    // If walking, use one of the animation frames (second or third column)
    sourceX = Math.floor(Date.now() / 250) % 2 + 1; // Alternates between columns 1 and 2
    sourceX *= spriteWidth;
  }

  ctx.save();

  if (minifigState.direction === 'right') {
    // Flip horizontally for right-facing direction
    ctx.scale(-1, 1);
    ctx.drawImage(
      minifigImage,
      sourceX, sourceY,                // Source position
      spriteWidth, spriteHeight,       // Source dimensions
      -x - spriteWidth, y,             // Adjust x position for flipped context
      spriteWidth, spriteHeight        // Destination dimensions
    );
  } else {
    // No flipping needed for other directions
    ctx.drawImage(
      minifigImage,
      sourceX, sourceY,           // Source position
      spriteWidth, spriteHeight,  // Source dimensions
      x, y,                       // Destination position
      spriteWidth, spriteHeight   // Destination dimensions
    );
  }

  ctx.restore();
}

// Start loading the trees
load();
