
#include <raylib.h>
#include <stdio.h>
#include "scores.h"
#include "snake.h"
#include "breakout.h"

#define HUB_W 800
#define HUB_H 600

int main(void) {
    GameScores scores;
    load_scores(&scores);

    InitWindow(HUB_W, HUB_H, "Arcade Hub");
    SetTargetFPS(60);

    Rectangle snakeCard = { 100, 180, 260, 280 };
    Rectangle breakCard = { 440, 180, 260, 280 };

    while (!WindowShouldClose()) {
        Vector2 mouse = GetMousePosition();
        bool hoverSnake = CheckCollisionPointRec(mouse, snakeCard);
        bool hoverBreak = CheckCollisionPointRec(mouse, breakCard);

        if ((hoverSnake && IsMouseButtonReleased(MOUSE_LEFT_BUTTON)) || IsKeyPressed(KEY_ONE)) {
            scores.snake = run_snake(scores.snake);
            save_scores(&scores);
            SetWindowSize(HUB_W, HUB_H);
            SetWindowTitle("Arcade Hub");
        }
        if ((hoverBreak && IsMouseButtonReleased(MOUSE_LEFT_BUTTON)) || IsKeyPressed(KEY_TWO)) {
            scores.breakout = run_breakout(scores.breakout);
            save_scores(&scores);
            SetWindowSize(HUB_W, HUB_H);
            SetWindowTitle("Arcade Hub");
        }

        BeginDrawing();
        ClearBackground((Color){10, 10, 10, 255});

        /* title */
        const char *title = "ARCADE HUB";
        int tw = MeasureText(title, 50);
        DrawText(title, (HUB_W - tw) / 2, 60, 50, (Color){76, 175, 80, 255});
        const char *sub = "Escolha seu jogo";
        tw = MeasureText(sub, 22);
        DrawText(sub, (HUB_W - tw) / 2, 122, 22, (Color){120, 120, 120, 255});

        /* snake card */
        {
            Color bg = hoverSnake ? (Color){25, 35, 25, 255} : (Color){20, 20, 20, 255};
            Color border = hoverSnake ? (Color){76, 175, 80, 255} : (Color){40, 40, 40, 255};
            DrawRectangleRounded(snakeCard, 0.08f, 8, bg);
            DrawRectangleRoundedLines(snakeCard, 0.08f, 8, border);

            const char *t = "SNAKE";
            tw = MeasureText(t, 32);
            DrawText(t, (int)(snakeCard.x + (snakeCard.width - tw) / 2), (int)snakeCard.y + 30, 32, (Color){76, 175, 80, 255});

            const char *d = "Cobre a comida\ne evite as paredes";
            DrawText(d, (int)snakeCard.x + 24, (int)snakeCard.y + 85, 18, (Color){150, 150, 150, 255});

            DrawText(TextFormat("Recorde: %d", scores.snake), (int)snakeCard.x + 24, (int)snakeCard.y + 150, 18, (Color){255, 152, 0, 255});
            DrawText("[1] ou Clique", (int)(snakeCard.x + snakeCard.width - 130), (int)(snakeCard.y + snakeCard.height - 30), 16, (Color){80, 80, 80, 255});
        }

        /* breakout card */
        {
            Color bg = hoverBreak ? (Color){35, 20, 25, 255} : (Color){20, 20, 20, 255};
            Color border = hoverBreak ? (Color){233, 30, 99, 255} : (Color){40, 40, 40, 255};
            DrawRectangleRounded(breakCard, 0.08f, 8, bg);
            DrawRectangleRoundedLines(breakCard, 0.08f, 8, border);

            const char *t = "BREAKOUT";
            tw = MeasureText(t, 32);
            DrawText(t, (int)(breakCard.x + (breakCard.width - tw) / 2), (int)breakCard.y + 30, 32, (Color){233, 30, 99, 255});

            const char *d = "Destrua os tijolos\ne nao deixe cair";
            DrawText(d, (int)breakCard.x + 24, (int)breakCard.y + 85, 18, (Color){150, 150, 150, 255});

            DrawText(TextFormat("Recorde: %d", scores.breakout), (int)breakCard.x + 24, (int)breakCard.y + 150, 18, (Color){255, 235, 59, 255});
            DrawText("[2] ou Clique", (int)(breakCard.x + breakCard.width - 130), (int)(breakCard.y + breakCard.height - 30), 16, (Color){80, 80, 80, 255});
        }

        /* footer */
        const char *f = "Dados salvos em .arcade_scores";
        tw = MeasureText(f, 14);
        DrawText(f, (HUB_W - tw) / 2, HUB_H - 30, 14, (Color){60, 60, 60, 255});

        EndDrawing();
    }

    CloseWindow();
    return 0;
}
