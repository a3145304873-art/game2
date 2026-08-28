
#include <raylib.h>
#include <stdlib.h>
#include "snake.h"

#define SCREEN 600
#define GRID 20
#define TILE 20
#define AREA (GRID * TILE)
#define OFF ((SCREEN - AREA) / 2)
#define MAX_LEN (GRID * GRID)
#define MAX_PARTICLES 200

typedef struct { int x, y; } Cell;
typedef struct { float x, y, vx, vy, life; Color c; } Particle;

static Cell snake[MAX_LEN];
static int len;
static Cell dir, nextDir;
static Cell food;
static int score;
static float moveTimer, moveInterval;
static Particle particles[MAX_PARTICLES];
static int pcount;
static int highScore;
static int state; /* 0=playing, 1=gameover */

static void spawn_food(void) {
    int valid;
    do {
        valid = 1;
        food.x = GetRandomValue(0, GRID - 1);
        food.y = GetRandomValue(0, GRID - 1);
        for (int i = 0; i < len; i++) {
            if (snake[i].x == food.x && snake[i].y == food.y) {
                valid = 0; break;
            }
        }
    } while (!valid);
}

static void add_particles(float x, float y, Color base) {
    for (int i = 0; i < 12 && pcount < MAX_PARTICLES; i++, pcount++) {
        Particle *p = &particles[pcount];
        p->x = x;
        p->y = y;
        p->vx = (GetRandomValue(-50, 50) / 25.0f);
        p->vy = (GetRandomValue(-50, 50) / 25.0f);
        p->life = 1.0f;
        p->c = (Color){ base.r, (unsigned char)(base.g + GetRandomValue(0,40)), base.b, 255 };
    }
}

int run_snake(int current_highscore) {
    highScore = current_highscore;
    SetWindowSize(SCREEN, SCREEN);
    SetWindowTitle("Snake");

    len = 3;
    snake[0] = (Cell){10, 10};
    snake[1] = (Cell){9, 10};
    snake[2] = (Cell){8, 10};
    dir = (Cell){1, 0};
    nextDir = (Cell){1, 0};
    score = 0;
    moveTimer = 0.0f;
    moveInterval = 0.12f;
    state = 0;
    pcount = 0;
    spawn_food();

    while (!WindowShouldClose()) {
        float dt = GetFrameTime();

        if (state == 0) {
            if ((IsKeyPressed(KEY_UP) || IsKeyPressed(KEY_W)) && dir.y == 0) nextDir = (Cell){0, -1};
            if ((IsKeyPressed(KEY_DOWN) || IsKeyPressed(KEY_S)) && dir.y == 0) nextDir = (Cell){0, 1};
            if ((IsKeyPressed(KEY_LEFT) || IsKeyPressed(KEY_A)) && dir.x == 0) nextDir = (Cell){-1, 0};
            if ((IsKeyPressed(KEY_RIGHT) || IsKeyPressed(KEY_D)) && dir.x == 0) nextDir = (Cell){1, 0};

            moveTimer += dt;
            if (moveTimer >= moveInterval) {
                moveTimer = 0.0f;
                dir = nextDir;
                Cell head = { snake[0].x + dir.x, snake[0].y + dir.y };

                if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID) {
                    state = 1;
                } else {
                    for (int i = 0; i < len; i++) {
                        if (snake[i].x == head.x && snake[i].y == head.y) {
                            state = 1; break;
                        }
                    }
                }

                if (state == 0) {
                    for (int i = len; i > 0; i--) snake[i] = snake[i - 1];
                    snake[0] = head;

                    if (head.x == food.x && head.y == food.y) {
                        score += 10;
                        len++;
                        float px = OFF + head.x * TILE + TILE * 0.5f;
                        float py = OFF + head.y * TILE + TILE * 0.5f;
                        Color pcolor = (Color){ 255, 100 + GetRandomValue(0, 80), 50, 255 };
                        add_particles(px, py, pcolor);
                        spawn_food();
                        if (moveInterval > 0.04f) moveInterval *= 0.97f;
                    }
                }
            }
        } else {
            if (IsKeyPressed(KEY_ENTER) || IsKeyPressed(KEY_R)) {
                len = 3;
                snake[0] = (Cell){10, 10};
                snake[1] = (Cell){9, 10};
                snake[2] = (Cell){8, 10};
                dir = (Cell){1, 0};
                nextDir = (Cell){1, 0};
                score = 0;
                moveInterval = 0.12f;
                state = 0;
                pcount = 0;
                spawn_food();
            }
            if (IsKeyPressed(KEY_ESCAPE) || IsKeyPressed(KEY_BACKSPACE)) {
                break;
            }
        }

        /* update particles */
        for (int i = pcount - 1; i >= 0; i--) {
            Particle *p = &particles[i];
            p->x += p->vx;
            p->y += p->vy;
            p->life -= dt * 2.5f;
            if (p->life <= 0.0f) {
                particles[i] = particles[pcount - 1];
                pcount--;
            }
        }

        BeginDrawing();
        ClearBackground((Color){17, 17, 17, 255});

        /* grid */
        for (int i = 0; i <= GRID; i++) {
            DrawLine(OFF + i * TILE, OFF, OFF + i * TILE, OFF + AREA, (Color){34, 34, 34, 255});
            DrawLine(OFF, OFF + i * TILE, OFF + AREA, OFF + i * TILE, (Color){34, 34, 34, 255});
        }

        /* border */
        DrawRectangleLinesEx((Rectangle){OFF - 3, OFF - 3, AREA + 6, AREA + 6}, 3, (Color){76, 175, 80, 255});

        /* particles */
        for (int i = 0; i < pcount; i++) {
            Particle p = particles[i];
            DrawCircle((int)p.x, (int)p.y, 3.5f * p.life, (Color){p.c.r, p.c.g, p.c.b, (unsigned char)(p.life * 255)});
        }

        /* food */
        if (state == 0) {
            float fx = OFF + food.x * TILE + TILE * 0.5f;
            float fy = OFF + food.y * TILE + TILE * 0.5f;
            DrawCircle((int)fx, (int)fy, TILE * 0.8f, (Color){244, 67, 54, 80});
            DrawCircle((int)fx, (int)fy, TILE * 0.35f, RED);
            DrawLine((int)fx + 2, (int)fy - (int)(TILE * 0.25f), (int)fx + 6, (int)fy - (int)(TILE * 0.6f), GREEN);
        }

        /* snake body */
        for (int i = 0; i < len; i++) {
            float sx = OFF + snake[i].x * TILE + 1;
            float sy = OFF + snake[i].y * TILE + 1;
            float sw = TILE - 2;
            float sh = TILE - 2;
            if (i == 0) {
                DrawRectangleRounded((Rectangle){sx, sy, sw, sh}, 0.3f, 6, (Color){102, 187, 106, 255});
            } else {
                int b = 100 - (i < 20 ? i * 2 : 40);
                unsigned char g = (unsigned char)(80 + b);
                DrawRectangleRounded((Rectangle){sx, sy, sw, sh}, 0.3f, 6, (Color){60, g, 60, 255});
            }
        }

        /* eyes */
        if (len > 0) {
            float sx = OFF + snake[0].x * TILE;
            float sy = OFF + snake[0].y * TILE;
            float e1x = 0, e1y = 0, e2x = 0, e2y = 0, pdx = 0, pdy = 0;
            if (dir.x == 1) {
                e1x = sx + 14; e1y = sy + 6;  e2x = sx + 14; e2y = sy + 14; pdx = 1; pdy = 0;
            } else if (dir.x == -1) {
                e1x = sx + 6;  e1y = sy + 6;  e2x = sx + 6;  e2y = sy + 14; pdx = -1; pdy = 0;
            } else if (dir.y == -1) {
                e1x = sx + 6;  e1y = sy + 6;  e2x = sx + 14; e2y = sy + 6;  pdx = 0; pdy = -1;
            } else {
                e1x = sx + 6;  e1y = sy + 14; e2x = sx + 14; e2y = sy + 14; pdx = 0; pdy = 1;
            }
            DrawCircle((int)e1x, (int)e1y, 3.0f, WHITE);
            DrawCircle((int)e2x, (int)e2y, 3.0f, WHITE);
            DrawCircle((int)(e1x + pdx), (int)(e1y + pdy), 1.5f, BLACK);
            DrawCircle((int)(e2x + pdx), (int)(e2y + pdy), 1.5f, BLACK);
        }

        /* HUD */
        DrawText(TextFormat("Pontos: %d", score), 20, 20, 20, WHITE);
        DrawText(TextFormat("Recorde: %d", score > highScore ? score : highScore), SCREEN - 170, 20, 20, (Color){255, 152, 0, 255});

        if (state == 1) {
            DrawRectangle(0, 0, SCREEN, SCREEN, (Color){0, 0, 0, 200});
            const char *t = "GAME OVER";
            int tw = MeasureText(t, 40);
            DrawText(t, (SCREEN - tw) / 2, SCREEN / 2 - 60, 40, RED);
            const char *pts = TextFormat("Pontuacao: %d", score);
            tw = MeasureText(pts, 24);
            DrawText(pts, (SCREEN - tw) / 2, SCREEN / 2 - 10, 24, WHITE);
            const char *sub = "ENTER: jogar novamente   ESC: voltar";
            tw = MeasureText(sub, 18);
            DrawText(sub, (SCREEN - tw) / 2, SCREEN / 2 + 40, 18, GRAY);
        }

        EndDrawing();
    }

    if (score > highScore) highScore = score;
    return highScore;
}
