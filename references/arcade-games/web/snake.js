const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const GRID_SIZE = 20;
const TILE_COUNT = canvas.width / GRID_SIZE;

let snake = [];
let food = null;
let velocity = { x: 0, y: 0 };
let nextVelocity = { x: 0, y: 0 };
let score = 0;
let highScore = parseInt(localStorage.getItem('snake_highscore')) || 0;
let gameLoop = null;
let gameRunning = false;
let speed = 100;
let particles = [];

const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('highscore');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreEl = document.getElementById('finalScore');

highScoreEl.textContent = highScore;

function initGame() {
    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];
    velocity = { x: 1, y: 0 };
    nextVelocity = { x: 1, y: 0 };
    score = 0;
    speed = 100;
    particles = [];
    scoreEl.textContent = '0';
    gameOverScreen.style.display = 'none';
    spawnFood();
    gameRunning = true;

    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(update, speed);
}

function spawnFood() {
    let valid = false;
    while (!valid) {
        food = {
            x: Math.floor(Math.random() * TILE_COUNT),
            y: Math.floor(Math.random() * TILE_COUNT)
        };
        valid = !snake.some(s => s.x === food.x && s.y === food.y);
    }
}

function update() {
    velocity = { ...nextVelocity };

    const head = {
        x: snake[0].x + velocity.x,
        y: snake[0].y + velocity.y
    };

    // Colisão com parede
    if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {
        gameOver();
        return;
    }

    // Colisão com próprio corpo
    if (snake.some(s => s.x === head.x && s.y === head.y)) {
        gameOver();
        return;
    }

    snake.unshift(head);

    // Comeu a comida
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreEl.textContent = score;
        spawnParticles(head.x * GRID_SIZE + GRID_SIZE / 2, head.y * GRID_SIZE + GRID_SIZE / 2);
        spawnFood();

        // Aumenta dificuldade
        if (speed > 50) {
            speed -= 2;
            clearInterval(gameLoop);
            gameLoop = setInterval(update, speed);
        }
    } else {
        snake.pop();
    }

    updateParticles();
    draw();
}

function draw() {
    // Fundo
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid sutil
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 1;
    for (let i = 0; i <= TILE_COUNT; i++) {
        ctx.beginPath();
        ctx.moveTo(i * GRID_SIZE, 0);
        ctx.lineTo(i * GRID_SIZE, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * GRID_SIZE);
        ctx.lineTo(canvas.width, i * GRID_SIZE);
        ctx.stroke();
    }

    // Partículas
    drawParticles();

    // Comida
    if (food) {
        const fx = food.x * GRID_SIZE;
        const fy = food.y * GRID_SIZE;

        // Brilho atrás da comida
        ctx.fillStyle = 'rgba(244, 67, 54, 0.3)';
        ctx.beginPath();
        ctx.arc(fx + GRID_SIZE / 2, fy + GRID_SIZE / 2, GRID_SIZE * 0.8, 0, Math.PI * 2);
        ctx.fill();

        // Maçã redonda
        ctx.fillStyle = '#f44336';
        ctx.beginPath();
        ctx.arc(fx + GRID_SIZE / 2, fy + GRID_SIZE / 2, GRID_SIZE * 0.35, 0, Math.PI * 2);
        ctx.fill();

        // Cabo da maçã
        ctx.strokeStyle = '#8bc34a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(fx + GRID_SIZE / 2 + 2, fy + 4);
        ctx.quadraticCurveTo(fx + GRID_SIZE / 2 + 5, fy - 2, fx + GRID_SIZE / 2 + 8, fy - 1);
        ctx.stroke();
    }

    // Snake
    snake.forEach((segment, index) => {
        const sx = segment.x * GRID_SIZE;
        const sy = segment.y * GRID_SIZE;
        const isHead = index === 0;

        if (isHead) {
            ctx.fillStyle = '#66bb6a';
            ctx.shadowColor = '#4caf50';
            ctx.shadowBlur = 10;
        } else {
            const brightness = 100 - Math.min(index * 2, 40);
            ctx.fillStyle = `hsl(122, 50%, ${brightness}%)`;
            ctx.shadowBlur = 0;
        }

        const padding = 1;
        roundRect(ctx, sx + padding, sy + padding, GRID_SIZE - padding * 2, GRID_SIZE - padding * 2, 4);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Olhos da cobra (cabeça)
        if (isHead) {
            ctx.fillStyle = '#fff';
            const eyeSize = 3;
            let eye1, eye2;

            if (velocity.x === 1) { // direita
                eye1 = { x: sx + 14, y: sy + 6 };
                eye2 = { x: sx + 14, y: sy + 14 };
            } else if (velocity.x === -1) { // esquerda
                eye1 = { x: sx + 6, y: sy + 6 };
                eye2 = { x: sx + 6, y: sy + 14 };
            } else if (velocity.y === -1) { // cima
                eye1 = { x: sx + 6, y: sy + 6 };
                eye2 = { x: sx + 14, y: sy + 6 };
            } else { // baixo
                eye1 = { x: sx + 6, y: sy + 14 };
                eye2 = { x: sx + 14, y: sy + 14 };
            }

            ctx.beginPath();
            ctx.arc(eye1.x, eye1.y, eyeSize, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(eye2.x, eye2.y, eyeSize, 0, Math.PI * 2);
            ctx.fill();

            // Pupilas
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(eye1.x + velocity.x, eye1.y + velocity.y, 1.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(eye2.x + velocity.x, eye2.y + velocity.y, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    // Borda do canvas
    ctx.strokeStyle = '#4caf50';
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
}

function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

function spawnParticles(x, y) {
    for (let i = 0; i < 12; i++) {
        particles.push({
            x,
            y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            life: 1.0,
            color: `hsl(${Math.random() * 60 + 10}, 100%, 60%)`
        });
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.04;
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

function drawParticles() {
    particles.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3 * p.life, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1;
}

function gameOver() {
    gameRunning = false;
    clearInterval(gameLoop);

    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snake_highscore', highScore);
        highScoreEl.textContent = highScore;
    }

    finalScoreEl.textContent = score;
    gameOverScreen.style.display = 'block';
}

function restartGame() {
    initGame();
}

// Controles
document.addEventListener('keydown', (e) => {
    if (!gameRunning) return;

    const key = e.key.toLowerCase();

    // Previne movimento 180 graus
    if ((key === 'arrowup' || key === 'w') && velocity.y === 0) {
        nextVelocity = { x: 0, y: -1 };
        e.preventDefault();
    } else if ((key === 'arrowdown' || key === 's') && velocity.y === 0) {
        nextVelocity = { x: 0, y: 1 };
        e.preventDefault();
    } else if ((key === 'arrowleft' || key === 'a') && velocity.x === 0) {
        nextVelocity = { x: -1, y: 0 };
        e.preventDefault();
    } else if ((key === 'arrowright' || key === 'd') && velocity.x === 0) {
        nextVelocity = { x: 1, y: 0 };
        e.preventDefault();
    }
});

// Controles touch / botões (para mobile)
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    e.preventDefault();
}, { passive: false });

canvas.addEventListener('touchend', (e) => {
    if (!gameRunning) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (Math.max(absDx, absDy) < 20) return;

    if (absDx > absDy) {
        if (dx > 0 && velocity.x === 0) nextVelocity = { x: 1, y: 0 };
        else if (dx < 0 && velocity.x === 0) nextVelocity = { x: -1, y: 0 };
    } else {
        if (dy > 0 && velocity.y === 0) nextVelocity = { x: 0, y: 1 };
        else if (dy < 0 && velocity.y === 0) nextVelocity = { x: 0, y: -1 };
    }
    e.preventDefault();
}, { passive: false });

// Inicia
draw(); // tela inicial
initGame();
