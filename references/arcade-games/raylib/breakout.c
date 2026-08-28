
#include <raylib.h>
#include <math.h>
#include "breakout.h"

#define SW 520
#define SH 760
#define CW 480
#define CH 640
#define OFFX ((SW - CW) / 2)
#define OFFY 100
#define COLS 8
#define ROWS 6
#define BW 50
#define BH 20
#define GAP 6
#define MARGIN_X ((CW - (COLS * BW + (COLS - 1) * GAP)) / 2)
#define PW 90
#define PH 12
#define PADDLE_Y (OFFY + CH - 40)
#define BALL_R 6
#define MAX_PARTICLES 300

typedef struct { Rectangle rect; Color color; bool visible; int row; } Brick;
typedef struct { float x, y, vx, vy, life, size; Color c; } Particle;

static const Color ROW_COLORS[] = {
    {244, 67, 54, 255}, {255, 152, 0, 255}, {255, 235, 59, 255},
    {76, 175, 80, 255}, {33, 150, 243, 255}, {156, 39, 176, 255}
};

static Brick bricks[COLS * ROWS];
static int score, lives, highScore, state; /* 0=menu,1=playing,2=over,3=win */
static float paddleX;
static float ballX, ballY, ballVx, ballVy;
static bool ballActive;
static Particle parts[MAX_PARTICLES];
static int pcount;

static void add_parts(float x, float y, Color c, int count) {
    for (int i = 0; i < count && pcount < MAX_PARTICLES; i++, pcount++) {
        Particle *p = &parts[pcount];
        p->x = x + GetRandomValue(0, BW);
        p->y = y + GetRandomValue(0, BH);
        p->vx = GetRandomValue(-100, 100) / 30.0f;
        p->vy = GetRandomValue(-100, 100) / 30.0f;
        p->life = 1.0f;
        p->size = GetRandomValue(15, 45) / 10.0f;
        p->c = c;
    }
}

static void init_bricks(void) {
    int idx = 0;
    for (int r = 0; r < ROWS; r++) {
        for (int c = 0; c < COLS; c++) {
            Brick *b = &bricks[idx++];
            b->rect.x = OFFX + MARGIN_X + c * (BW + GAP);
            b->rect.y = OFFY + 56 + r * (BH + GAP);
            b->rect.width = BW;
            b->rect.height = BH;
            b->color = ROW_COLORS[r % 6];
            b->visible = true;
            b->row = r;
        }
    }
}

static void reset_ball(void) {
    ballX = paddleX + PW / 2.0f;
    ballY = PADDLE_Y - BALL_R;
    ballVx = 0.0f;
    ballVy = 0.0f;
    ballActive = false;
}

static int remaining_bricks(void) {
    int n = 0;
    for (int i = 0; i < COLS * ROWS; i++) if (bricks[i].visible) n++;
    return n;
}

static void launch_ball(void) {
    if (ballActive) return;
    ballActive = true;
    float angle = -PI / 2.0f + (GetRandomValue(-15, 15) / 100.0f);
    float speed = 5.0f;
    ballVx = cosf(angle) * speed;
    ballVy = sinf(angle) * speed;
}

static void draw_rounded(float x, float y, float w, float h, float roundness, Color c) {
    DrawRectangleRounded((Rectangle){x, y, w, h}, roundness, 8, c);
}

int run_breakout(int current_highscore) {
    highScore = current_highscore;
    SetWindowSize(SW, SH);
    SetWindowTitle("Breakout");

    score = 0;
    lives = 3;
    state = 0;
    pcount = 0;
    paddleX = OFFX + (CW - PW) / 2.0f;
    init_bricks();
    reset_ball();

    while (!WindowShouldClose()) {
        float dt = GetFrameTime();
        float prevBallX = ballX;
        float prevBallY = ballY;

        if (state == 1) {
            /* paddle keyboard */
            if (IsKeyDown(KEY_LEFT) || IsKeyDown(KEY_A)) paddleX -= 7.0f;
            if (IsKeyDown(KEY_RIGHT) || IsKeyDown(KEY_D)) paddleX += 7.0f;

            /* paddle mouse */
            if (GetMouseY() > 0) {
                float mx = GetMouseX() - PW / 2.0f;
                if (mx >= OFFX && mx <= OFFX + CW - PW) paddleX = mx;
            }
            if (paddleX < OFFX) paddleX = OFFX;
            if (paddleX > OFFX + CW - PW) paddleX = OFFX + CW - PW;

            /* launch */
            if (!ballActive && (IsKeyPressed(KEY_SPACE) || IsMouseButtonPressed(MOUSE_LEFT_BUTTON))) {
                launch_ball();
            }

            if (!ballActive) {
                ballX = paddleX + PW / 2.0f;
                ballY = PADDLE_Y - BALL_R;
            } else {
                float speed = sqrtf(ballVx * ballVx + ballVy * ballVy);
                ballX += ballVx;
                ballY += ballVy;

                /* walls */
                if (ballX - BALL_R < OFFX) {
                    ballX = OFFX + BALL_R;
                    ballVx = fabsf(ballVx);
                } else if (ballX + BALL_R > OFFX + CW) {
                    ballX = OFFX + CW - BALL_R;
                    ballVx = -fabsf(ballVx);
                }
                if (ballY - BALL_R < OFFY) {
                    ballY = OFFY + BALL_R;
                    ballVy = fabsf(ballVy);
                }

                /* floor - lose life */
                if (ballY - BALL_R > OFFY + CH) {
                    lives--;
                    if (lives <= 0) state = 2;
                    else reset_ball();
                }

                /* paddle collision */
                Rectangle paddle = { paddleX, PADDLE_Y, PW, PH };
                if (CheckCollisionCircleRec((Vector2){ballX, ballY}, BALL_R, paddle) && ballVy > 0) {
                    float hit = (ballX - (paddleX + PW / 2.0f)) / (PW / 2.0f);
                    float maxAngle = PI / 3.0f;
                    float angle = hit * maxAngle;
                    if (speed < 10.0f) speed *= 1.01f;
                    ballVx = speed * sinf(angle);
                    ballVy = -speed * cosf(angle);
                    ballY = PADDLE_Y - BALL_R - 0.5f;
                }

                /* bricks */
                for (int i = 0; i < COLS * ROWS; i++) {
                    Brick *b = &bricks[i];
                    if (!b->visible) continue;
                    if (CheckCollisionCircleRec((Vector2){ballX, ballY}, BALL_R, b->rect)) {
                        b->visible = false;
                        score += (ROWS - b->row) * 10;
                        add_parts(b->rect.x, b->rect.y, b->color, 10);

                        int side = 0;
                        if (prevBallY - BALL_R <= b->rect.y) side = 1;
                        else if (prevBallY + BALL_R >= b->rect.y + b->rect.height) side = 2;
                        else if (prevBallX - BALL_R <= b->rect.x) side = 3;
                        else if (prevBallX + BALL_R >= b->rect.x + b->rect.width) side = 4;

                        if (side == 1 || side == 2) ballVy = -ballVy;
                        else if (side == 3 || side == 4) ballVx = -ballVx;
                        else { ballVx = -ballVx; ballVy = -ballVy; }

                        if (remaining_bricks() == 0) state = 3;
                        break;
                    }
                }
            }
        } else {
            if (IsKeyPressed(KEY_SPACE) || IsMouseButtonPressed(MOUSE_LEFT_BUTTON)) {
                score = 0; lives = 3; pcount = 0;
                init_bricks();
                paddleX = OFFX + (CW - PW) / 2.0f;
                reset_ball();
                state = 1;
            }
            if (IsKeyPressed(KEY_ESCAPE)) {
                break;
            }
        }

        /* particles */
        for (int i = pcount - 1; i >= 0; i--) {
            Particle *p = &parts[i];
            p->x += p->vx;
            p->y += p->vy;
            p->vy += 0.1f;
            p->life -= dt * 2.5f;
            if (p->life <= 0.0f) {
                parts[i] = parts[pcount - 1];
                pcount--;
            }
        }

        BeginDrawing();
        ClearBackground((Color){17, 17, 17, 255});

        /* HUD */
        DrawText(TextFormat("Pontos: %d", score), 24, 20, 20, WHITE);
        DrawText(TextFormat("Vidas: %d", lives), 190, 20, 20, WHITE);
        DrawText(TextFormat("Recorde: %d", score > highScore ? score : highScore), SW - 190, 20, 20, (Color){255, 235, 59, 255});

        /* canvas border */
        DrawRectangleLinesEx((Rectangle){OFFX - 2, OFFY - 2, CW + 4, CH + 4}, 3, (Color){233, 30, 99, 255});

        /* bricks */
        for (int i = 0; i < COLS * ROWS; i++) {
            Brick b = bricks[i];
            if (!b.visible) continue;
            draw_rounded(b.rect.x, b.rect.y, b.rect.width, b.rect.height, 0.15f, b.color);
            DrawRectangle((int)b.rect.x + 2, (int)b.rect.y + 2, (int)b.rect.width - 4, (int)b.rect.height / 2, (Color){255, 255, 255, 40});
        }

        /* paddle */
        draw_rounded(paddleX, PADDLE_Y, PW, PH, 0.3f, (Color){233, 30, 99, 255});
        DrawRectangle((int)paddleX + 2, (int)PADDLE_Y + 2, PW - 4, PH / 2 - 1, (Color){255, 255, 255, 50});

        /* ball */
        DrawCircle((int)ballX, (int)ballY, BALL_R, WHITE);

        /* particles */
        for (int i = 0; i < pcount; i++) {
            Particle p = parts[i];
            DrawCircle((int)p.x, (int)p.y, p.size * p.life, (Color){p.c.r, p.c.g, p.c.b, (unsigned char)(p.life * 255)});
        }

        /* overlay */
        if (state == 0) {
            DrawRectangle(0, 0, SW, SH, (Color){0, 0, 0, 220});
            const char *t = "Breakout";
            int tw = MeasureText(t, 50);
            DrawText(t, (SW - tw) / 2, SH / 2 - 80, 50, (Color){233, 30, 99, 255});
            const char *s1 = "Mouse / Setas: mover paddle";
            const char *s2 = "Espaco / Clique: lancar bola";
            int w1 = MeasureText(s1, 20);
            int w2 = MeasureText(s2, 20);
            DrawText(s1, (SW - w1) / 2, SH / 2 - 15, 20, WHITE);
            DrawText(s2, (SW - w2) / 2, SH / 2 + 15, 20, WHITE);
            const char *s3 = "Pressione ESPACO ou CLIQUE para comecar";
            int w3 = MeasureText(s3, 18);
            DrawText(s3, (SW - w3) / 2, SH / 2 + 60, 18, GRAY);
        } else if (state == 2 || state == 3) {
            DrawRectangle(0, 0, SW, SH, (Color){0, 0, 0, 200});
            const char *t = state == 3 ? "Voce Venceu!" : "Game Over";
            Color tc = state == 3 ? GREEN : (Color){244, 67, 54, 255};
            int tw = MeasureText(t, 44);
            DrawText(t, (SW - tw) / 2, SH / 2 - 70, 44, tc);
            const char *pts = TextFormat("Pontuacao: %d", score);
            tw = MeasureText(pts, 24);
            DrawText(pts, (SW - tw) / 2, SH / 2 - 10, 24, WHITE);
            const char *sub = "ESPACO/CLIQUE: novamente   ESC: voltar";
            tw = MeasureText(sub, 18);
            DrawText(sub, (SW - tw) / 2, SH / 2 + 40, 18, GRAY);
        }

        EndDrawing();
    }

    if (score > highScore) highScore = score;
    return highScore;
}
