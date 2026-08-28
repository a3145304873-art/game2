const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const highScoreEl = document.getElementById('highscore');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlayTitle');
const overlayText = document.getElementById('overlayText');
const overlayBtn = document.getElementById('overlayBtn');

const COL_COUNT = 8;
const BRICK_W = 50;
const BRICK_H = 20;
const BRICK_GAP = 6;
const MARGIN_X = (canvas.width - (COL_COUNT * BRICK_W + (COL_COUNT - 1) * BRICK_GAP)) / 2;
const TOP_OFFSET = 60;
const ROW_COUNT = 6;

const PADDLE_W = 90;
const PADDLE_H = 12;
const PADDLE_Y = canvas.height - 40;
const BALL_RADIUS = 6;

const COLORS = ['#f44336', '#ff9800', '#ffeb3b', '#4caf50', '#2196f3', '#9c27b0'];

let state = 'MENU';
let score = 0;
let lives = 3;
let highScore = parseInt(localStorage.getItem('breakout_highscore')) || 0;
let particles = [];

let paddle = { x: (canvas.width - PADDLE_W) / 2, y: PADDLE_Y };
let ball = { x: canvas.width / 2, y: PADDLE_Y - BALL_RADIUS, dx: 0, dy: 0, active: false, speed: 5 };
let bricks = [];
let keys = {};

highScoreEl.textContent = highScore;

function initBricks() {
    bricks = [];
    for (let r = 0; r < ROW_COUNT; r++) {
        for (let c = 0; c < COL_COUNT; c++) {
            bricks.push({
                x: MARGIN_X + c * (BRICK_W + BRICK_GAP),
                y: TOP_OFFSET + r * (BRICK_H + BRICK_GAP),
                w: BRICK_W,
                h: BRICK_H,
                color: COLORS[r % COLORS.length],
                visible: true,
                row: r
            });
        }
    }
}

function initGame() {
    score = 0;
    lives = 3;
    scoreEl.textContent = '0';
    livesEl.textContent = '3';
    initBricks();
    resetBall();
    particles = [];
    state = 'PLAYING';
    overlay.style.display = 'none';
    requestAnimationFrame(loop);
}

function resetBall() {
    ball.x = paddle.x + PADDLE_W / 2;
    ball.y = paddle.y - BALL_RADIUS;
    ball.dx = 0;
    ball.dy = 0;
    ball.active = false;
}

function launchBall() {
    if (ball.active || state !== 'PLAYING') return;
    ball.active = true;
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.5;
    ball.dx = Math.cos(angle) * ball.speed;
    ball.dy = Math.sin(angle) * ball.speed;
}

function rectCircleColliding(circle, rect) {
    const distX = Math.abs(circle.x - rect.x - rect.w / 2);
    const distY = Math.abs(circle.y - rect.y - rect.h / 2);

    if (distX > (rect.w / 2 + circle.r)) return false;
    if (distY > (rect.h / 2 + circle.r)) return false;
    if (distX <= (rect.w / 2)) return true;
    if (distY <= (rect.h / 2)) return true;

    const dx = distX - rect.w / 2;
    const dy = distY - rect.h / 2;
    return (dx * dx + dy * dy <= (circle.r * circle.r));
}

function spawnParticles(x, y, color, count = 8) {
    for (let i = 0; i < count; i++) {
        particles.push({
            x: x + Math.random() * BRICK_W,
            y: y + Math.random() * BRICK_H,
            vx: (Math.random() - 0.5) * 5,
            vy: (Math.random() - 0.5) * 5,
            life: 1.0,
            color: color,
            size: Math.random() * 3 + 2
        });
    }
}

function update() {
    if (state !== 'PLAYING') return;

    // Movimento paddle (teclado)
    if (keys['ArrowLeft'] || keys['a']) {
        paddle.x -= 7;
    }
    if (keys['ArrowRight'] || keys['d']) {
        paddle.x += 7;
    }
    paddle.x = Math.max(0, Math.min(canvas.width - PADDLE_W, paddle.x));

    // Bola presa no paddle
    if (!ball.active) {
        ball.x = paddle.x + PADDLE_W / 2;
        ball.y = paddle.y - BALL_RADIUS;
        return;
    }

    ball.x += ball.dx;
    ball.y += ball.dy;

    // Paredes laterais
    if (ball.x - BALL_RADIUS < 0) {
        ball.x = BALL_RADIUS;
        ball.dx = Math.abs(ball.dx);
    } else if (ball.x + BALL_RADIUS > canvas.width) {
        ball.x = canvas.width - BALL_RADIUS;
        ball.dx = -Math.abs(ball.dx);
    }

    // Teto
    if (ball.y - BALL_RADIUS < 0) {
        ball.y = BALL_RADIUS;
        ball.dy = Math.abs(ball.dy);
    }

    // Chão (perde vida)
    if (ball.y - BALL_RADIUS > canvas.height) {
        lives--;
        livesEl.textContent = lives;
        if (lives <= 0) {
            gameOver(false);
        } else {
            resetBall();
        }
        return;
    }

    // Colisão paddle
    const paddleCircle = { x: ball.x, y: ball.y, r: BALL_RADIUS };
    if (rectCircleColliding(paddleCircle, { x: paddle.x, y: paddle.y, w: PADDLE_W, h: PADDLE_H })) {
        const hitPoint = (ball.x - (paddle.x + PADDLE_W / 2)) / (PADDLE_W / 2);
        const maxBounceAngle = Math.PI / 3;
        const bounceAngle = hitPoint * maxBounceAngle;
        const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
        ball.dx = speed * Math.sin(bounceAngle);
        ball.dy = -speed * Math.cos(bounceAngle);
        ball.y = paddle.y - BALL_RADIUS - 1;

        // Aumenta levemente a velocidade a cada bounce no paddle (até um limite)
        if (speed < 9) {
            ball.dx *= 1.01;
            ball.dy *= 1.01;
        }
    }

    // Colisão bricks
    for (let b of bricks) {
        if (!b.visible) continue;
        if (rectCircleColliding(paddleCircle, b)) {
            b.visible = false;
            score += (ROW_COUNT - b.row) * 10;
            scoreEl.textContent = score;
            spawnParticles(b.x, b.y, b.color);

            // Determinar de qual lado a bola bateu (aproximado)
            const overlapLeft = (ball.x + BALL_RADIUS) - b.x;
            const overlapRight = (b.x + b.w) - (ball.x - BALL_RADIUS);
            const overlapTop = (ball.y + BALL_RADIUS) - b.y;
            const overlapBottom = (b.y + b.h) - (ball.y - BALL_RADIUS);

            const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

            if (minOverlap === overlapLeft || minOverlap === overlapRight) {
                ball.dx = -ball.dx;
            } else {
                ball.dy = -ball.dy;
            }

            // Verifica vitória
            if (bricks.every(bk => !bk.visible)) {
                gameOver(true);
            }
            break; // só quebra um tijolo por frame
        }
    }

    // Partículas
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1; // gravidade sutil
        p.life -= 0.025;
        if (p.life <= 0) particles.splice(i, 1);
    }
}

function draw() {
    // Fundo
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Bricks
    bricks.forEach(b => {
        if (!b.visible) return;
        ctx.fillStyle = b.color;
        roundRect(ctx, b.x, b.y, b.w, b.h, 3);
        ctx.fill();
        // brilho topo
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        roundRect(ctx, b.x, b.y, b.w, b.h / 2, 3);
        ctx.fill();
    });

    // Paddle
    ctx.fillStyle = '#e91e63';
    ctx.shadowColor = '#e91e63';
    ctx.shadowBlur = 12;
    roundRect(ctx, paddle.x, paddle.y, PADDLE_W, PADDLE_H, 4);
    ctx.fill();
    ctx.shadowBlur = 0;
    // brilho paddle
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    roundRect(ctx, paddle.x + 2, paddle.y + 2, PADDLE_W - 4, PADDLE_H / 2, 3);
    ctx.fill();

    // Bola
    ctx.fillStyle = '#fff';
    ctx.shadowColor = '#fff';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Partículas
    particles.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Borda
    ctx.strokeStyle = '#e91e63';
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

function showOverlay(title, text, btnText) {
    overlayTitle.textContent = title;
    overlayText.textContent = text;
    overlayBtn.textContent = btnText;
    overlay.style.display = 'block';
}

function startGame() {
    initGame();
}

function gameOver(win) {
    state = win ? 'WIN' : 'GAMEOVER';
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('breakout_highscore', highScore);
        highScoreEl.textContent = highScore;
    }
    showOverlay(
        win ? 'Você Venceu! 🎉' : 'Game Over!',
        `Pontuação: ${score}`,
        'Jogar Novamente'
    );
}

function loop() {
    if (state === 'PLAYING') {
        update();
        draw();
        requestAnimationFrame(loop);
    }
}

// Eventos
document.addEventListener('keydown', e => {
    keys[e.key] = true;
    if (e.key === ' ' || e.key === 'Spacebar') {
        if (state === 'PLAYING' && !ball.active) {
            launchBall();
            e.preventDefault();
        } else if (state === 'MENU') {
            startGame();
            e.preventDefault();
        }
    }
});

document.addEventListener('keyup', e => {
    keys[e.key] = false;
});

canvas.addEventListener('mousemove', e => {
    if (state !== 'PLAYING') return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    paddle.x = mouseX - PADDLE_W / 2;
    paddle.x = Math.max(0, Math.min(canvas.width - PADDLE_W, paddle.x));
});

canvas.addEventListener('click', () => {
    if (state === 'PLAYING' && !ball.active) {
        launchBall();
    }
});

// Tela inicial
showOverlay('Breakout', 'Use o mouse ou setas para mover. Clique ou espaço para lançar.', 'Jogar');

draw();
