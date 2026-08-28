
#ifndef SCORES_H
#define SCORES_H

typedef struct {
    int snake;
    int breakout;
} GameScores;

void load_scores(GameScores *s);
void save_scores(const GameScores *s);

#endif
