
#include <stdio.h>
#include "scores.h"

void load_scores(GameScores *s) {
    s->snake = 0;
    s->breakout = 0;
    FILE *f = fopen(".arcade_scores", "r");
    if (!f) return;
    fscanf(f, "%d %d", &s->snake, &s->breakout);
    fclose(f);
}

void save_scores(const GameScores *s) {
    FILE *f = fopen(".arcade_scores", "w");
    if (!f) return;
    fprintf(f, "%d %d\n", s->snake, s->breakout);
    fclose(f);
}
