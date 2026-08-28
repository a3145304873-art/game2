use bevy::prelude::*;

use crate::{scores, AppState, GameScores};

const WIN_W: f32 = 800.0;
const WIN_H: f32 = 600.0;
const PADDLE_W: f32 = 100.0;
const PADDLE_H: f32 = 16.0;
const BALL_R: f32 = 8.0;
const BRICK_W: f32 = 64.0;
const BRICK_H: f32 = 24.0;
const COLS: i32 = 10;
const ROWS: i32 = 6;
const GAP: f32 = 4.0;

pub struct BreakoutPlugin;

impl Plugin for BreakoutPlugin {
    fn build(&self, app: &mut App) {
        app.add_systems(OnEnter(AppState::Breakout), setup_breakout)
            .add_systems(OnExit(AppState::Breakout), cleanup_breakout)
            .add_systems(
                Update,
                (paddle_input, ball_movement, collision_check, victory_check)
                    .run_if(in_state(AppState::Breakout)),
            );
    }
}

#[derive(Component)]
struct BreakoutEntity;

#[derive(Component)]
struct Paddle;

#[derive(Component)]
struct Brick;

#[derive(Component)]
struct ScoreText;

#[derive(Component)]
struct BreakoutBall {
    velocity: Vec2,
}

#[derive(Resource, Default)]
struct BreakoutGame {
    score: u32,
    high_score: u32,
    bricks_left: usize,
    game_over: bool,
    paddle_x: f32,
}

fn setup_breakout(mut commands: Commands, scores: Res<GameScores>) {
    commands.spawn((Camera2dBundle::default(), BreakoutEntity));

    let paddle_y = -WIN_H / 2.0 + 40.0;
    commands.spawn((
        SpriteBundle {
            sprite: Sprite {
                color: Color::srgb(0.5, 0.5, 0.5),
                custom_size: Some(Vec2::new(PADDLE_W, PADDLE_H)),
                ..default()
            },
            transform: Transform::from_xyz(0.0, paddle_y, 0.0),
            ..default()
        },
        Paddle,
        BreakoutEntity,
    ));

    let ball_vel = Vec2::new(220.0, 260.0);
    commands.spawn((
        SpriteBundle {
            sprite: Sprite {
                color: Color::srgb(1.0, 1.0, 1.0),
                custom_size: Some(Vec2::splat(BALL_R * 2.0)),
                ..default()
            },
            transform: Transform::from_xyz(0.0, paddle_y + PADDLE_H / 2.0 + BALL_R, 0.0),
            ..default()
        },
        BreakoutBall { velocity: ball_vel },
        BreakoutEntity,
    ));

    let start_x = -(COLS as f32 * (BRICK_W + GAP)) / 2.0 + BRICK_W / 2.0;
    let start_y = WIN_H / 2.0 - 80.0;
    let mut bricks_left = 0usize;
    for row in 0..ROWS {
        for col in 0..COLS {
            let x = start_x + col as f32 * (BRICK_W + GAP);
            let y = start_y - row as f32 * (BRICK_H + GAP);
            let r = row as f32 / ROWS as f32;
            let color = Color::srgb(0.5 + r * 0.5, 0.3 + (1.0 - r) * 0.5, 0.5);
            commands.spawn((
                SpriteBundle {
                    sprite: Sprite {
                        color,
                        custom_size: Some(Vec2::new(BRICK_W, BRICK_H)),
                        ..default()
                    },
                    transform: Transform::from_xyz(x, y, 0.0),
                    ..default()
                },
                Brick,
                BreakoutEntity,
            ));
            bricks_left += 1;
        }
    }

    commands.spawn((
        Text2dBundle {
            text: Text::from_section(
                "Score: 0",
                TextStyle {
                    font_size: 24.0,
                    color: Color::WHITE,
                    ..default()
                },
            )
            .with_justify(JustifyText::Left),
            transform: Transform::from_xyz(-WIN_W / 2.0 + 80.0, WIN_H / 2.0 - 30.0, 0.0),
            ..default()
        },
        ScoreText,
        BreakoutEntity,
    ));

    commands.insert_resource(BreakoutGame {
        score: 0,
        high_score: scores.breakout,
        bricks_left,
        game_over: false,
        paddle_x: 0.0,
    });
}

fn paddle_input(
    keys: Res<ButtonInput<KeyCode>>,
    mut paddle_query: Query<&mut Transform, With<Paddle>>,
    mut game: ResMut<BreakoutGame>,
    time: Res<Time>,
) {
    if game.game_over {
        return;
    }
    let mut dx = 0.0f32;
    if keys.pressed(KeyCode::ArrowLeft) || keys.pressed(KeyCode::KeyA) {
        dx -= 1.0;
    }
    if keys.pressed(KeyCode::ArrowRight) || keys.pressed(KeyCode::KeyD) {
        dx += 1.0;
    }
    let speed = 500.0;
    game.paddle_x += dx * speed * time.delta_seconds();
    let limit = WIN_W / 2.0 - PADDLE_W / 2.0;
    game.paddle_x = game.paddle_x.clamp(-limit, limit);

    for mut transform in &mut paddle_query {
        transform.translation.x = game.paddle_x;
    }
}

fn ball_movement(
    mut ball_query: Query<(&mut Transform, &mut BreakoutBall), Without<Brick>>,
    time: Res<Time>,
    mut game: ResMut<BreakoutGame>,
    mut next_state: ResMut<NextState<AppState>>,
    mut scores: ResMut<GameScores>,
) {
    if game.game_over {
        return;
    }
    let (mut transform, mut ball) = ball_query.single_mut();
    transform.translation += ball.velocity.extend(0.0) * time.delta_seconds();
    let pos = transform.translation.truncate();
    let r = BALL_R;

    // walls
    if pos.x < -WIN_W / 2.0 + r {
        transform.translation.x = -WIN_W / 2.0 + r;
        ball.velocity.x = ball.velocity.x.abs();
    }
    if pos.x > WIN_W / 2.0 - r {
        transform.translation.x = WIN_W / 2.0 - r;
        ball.velocity.x = -ball.velocity.x.abs();
    }
    if pos.y > WIN_H / 2.0 - r {
        transform.translation.y = WIN_H / 2.0 - r;
        ball.velocity.y = -ball.velocity.y.abs();
    }
    if pos.y < -WIN_H / 2.0 - r {
        end_game(&mut game, &mut next_state, &mut scores);
        return;
    }

    // paddle bounce
    let paddle_y = -WIN_H / 2.0 + 40.0;
    if ball.velocity.y < 0.0
        && pos.y - r <= paddle_y + PADDLE_H / 2.0
        && pos.x >= game.paddle_x - PADDLE_W / 2.0 - r
        && pos.x <= game.paddle_x + PADDLE_W / 2.0 + r
    {
        transform.translation.y = paddle_y + PADDLE_H / 2.0 + r;
        ball.velocity.y = ball.velocity.y.abs();
        let hit = (pos.x - game.paddle_x) / (PADDLE_W / 2.0);
        ball.velocity.x += hit * 120.0;
        ball.velocity.x = ball.velocity.x.clamp(-400.0, 400.0);
    }
}

fn collision_check(
    mut commands: Commands,
    mut ball_query: Query<(&Transform, &mut BreakoutBall)>,
    brick_query: Query<(Entity, &Transform), With<Brick>>,
    mut game: ResMut<BreakoutGame>,
    mut text_query: Query<&mut Text, With<ScoreText>>,
) {
    if game.game_over {
        return;
    }
    let (ball_transform, mut ball) = ball_query.single_mut();
    let ball_pos = ball_transform.translation.truncate();
    let r = BALL_R;

    for (entity, brick_transform) in &brick_query {
        let b_pos = brick_transform.translation.truncate();
        let half = Vec2::new(BRICK_W / 2.0, BRICK_H / 2.0);
        let closest = Vec2::new(
            ball_pos.x.clamp(b_pos.x - half.x, b_pos.x + half.x),
            ball_pos.y.clamp(b_pos.y - half.y, b_pos.y + half.y),
        );
        let diff = ball_pos - closest;
        if diff.length_squared() < r * r {
            if diff.x.abs() > diff.y.abs() {
                ball.velocity.x = -ball.velocity.x;
            } else {
                ball.velocity.y = -ball.velocity.y;
            }
            commands.entity(entity).despawn();
            game.score += 10;
            game.bricks_left -= 1;
            for mut text in &mut text_query {
                text.sections[0].value = format!("Score: {}", game.score);
            }
            break;
        }
    }
}

fn victory_check(
    mut game: ResMut<BreakoutGame>,
    mut next_state: ResMut<NextState<AppState>>,
    mut scores: ResMut<GameScores>,
) {
    if game.game_over {
        return;
    }
    if game.bricks_left == 0 {
        end_game(&mut game, &mut next_state, &mut scores);
    }
}

fn end_game(
    game: &mut BreakoutGame,
    next_state: &mut NextState<AppState>,
    scores: &mut GameScores,
) {
    game.game_over = true;
    if game.score > game.high_score {
        game.high_score = game.score;
        scores.breakout = game.high_score;
        scores::save_scores(scores.snake, scores.breakout);
    }
    next_state.set(AppState::Hub);
}

fn cleanup_breakout(
    mut commands: Commands,
    query: Query<Entity, With<BreakoutEntity>>,
) {
    for e in &query {
        commands.entity(e).despawn_recursive();
    }
    commands.remove_resource::<BreakoutGame>();
}
