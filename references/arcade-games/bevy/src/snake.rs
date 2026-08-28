use bevy::prelude::*;
use rand::prelude::*;

use crate::{scores, AppState, GameScores};

const CELL_SIZE: f32 = 20.0;
const GRID_W: i32 = 40;
const GRID_H: i32 = 30;

pub struct SnakePlugin;

impl Plugin for SnakePlugin {
    fn build(&self, app: &mut App) {
        app.add_systems(OnEnter(AppState::Snake), setup_snake)
            .add_systems(OnExit(AppState::Snake), cleanup_snake)
            .add_systems(
                Update,
                (snake_input, snake_tick, snake_sync)
                    .run_if(in_state(AppState::Snake)),
            );
    }
}

#[derive(Component)]
struct SnakeEntity;

#[derive(Resource, Default)]
struct SnakeGame {
    head: (i32, i32),
    body: Vec<(i32, i32)>,
    dir: (i32, i32),
    next_dir: (i32, i32),
    food: (i32, i32),
    score: u32,
    timer: Timer,
    high_score: u32,
    game_over: bool,
    head_entity: Option<Entity>,
    body_entities: Vec<Entity>,
    food_entity: Option<Entity>,
    just_ate: bool,
}

fn setup_snake(mut commands: Commands, scores: Res<GameScores>) {
    commands.spawn((Camera2dBundle::default(), SnakeEntity));

    let head = (GRID_W / 2, GRID_H / 2);
    let body = vec![(head.0 - 1, head.1), (head.0 - 2, head.1)];
    let mut occ = body.clone();
    occ.push(head);
    let food = random_food(&occ);

    let head_ent = spawn_block(&mut commands, head, Color::srgb(0.3, 0.69, 0.31));
    let mut body_ents = Vec::new();
    for &pos in &body {
        body_ents.push(spawn_block(&mut commands, pos, Color::srgb(0.2, 0.5, 0.25)));
    }
    let food_ent = spawn_block(&mut commands, food, Color::srgb(1.0, 0.3, 0.3));

    commands.insert_resource(SnakeGame {
        head,
        body,
        dir: (1, 0),
        next_dir: (1, 0),
        food,
        score: 0,
        timer: Timer::from_seconds(0.12, TimerMode::Repeating),
        high_score: scores.snake,
        game_over: false,
        head_entity: Some(head_ent),
        body_entities: body_ents,
        food_entity: Some(food_ent),
        just_ate: false,
    });
}

fn spawn_block(commands: &mut Commands, pos: (i32, i32), color: Color) -> Entity {
    commands
        .spawn((
            SpriteBundle {
                sprite: Sprite {
                    color,
                    custom_size: Some(Vec2::splat(CELL_SIZE - 1.0)),
                    ..default()
                },
                transform: Transform::from_translation(grid_to_world(pos).extend(0.0)),
                ..default()
            },
            SnakeEntity,
        ))
        .id()
}

fn grid_to_world(pos: (i32, i32)) -> Vec2 {
    Vec2::new(
        pos.0 as f32 * CELL_SIZE - (GRID_W as f32 * CELL_SIZE) / 2.0 + CELL_SIZE / 2.0,
        pos.1 as f32 * CELL_SIZE - (GRID_H as f32 * CELL_SIZE) / 2.0 + CELL_SIZE / 2.0,
    )
}

fn random_food(occupied: &[(i32, i32)]) -> (i32, i32) {
    let mut rng = thread_rng();
    loop {
        let pos = (rng.gen_range(0..GRID_W), rng.gen_range(0..GRID_H));
        if !occupied.contains(&pos) {
            return pos;
        }
    }
}

fn snake_input(keys: Res<ButtonInput<KeyCode>>, mut game: ResMut<SnakeGame>) {
    if game.game_over {
        return;
    }
    let d = game.dir;
    if (keys.just_pressed(KeyCode::ArrowUp) || keys.just_pressed(KeyCode::KeyW)) && d.1 == 0 {
        game.next_dir = (0, 1);
    }
    if (keys.just_pressed(KeyCode::ArrowDown) || keys.just_pressed(KeyCode::KeyS)) && d.1 == 0 {
        game.next_dir = (0, -1);
    }
    if (keys.just_pressed(KeyCode::ArrowLeft) || keys.just_pressed(KeyCode::KeyA)) && d.0 == 0 {
        game.next_dir = (-1, 0);
    }
    if (keys.just_pressed(KeyCode::ArrowRight) || keys.just_pressed(KeyCode::KeyD)) && d.0 == 0 {
        game.next_dir = (1, 0);
    }
}

fn snake_tick(
    mut game: ResMut<SnakeGame>,
    time: Res<Time>,
    mut next_state: ResMut<NextState<AppState>>,
    mut scores: ResMut<GameScores>,
) {
    game.timer.tick(time.delta());
    if !(game.timer.just_finished() && !game.game_over) {
        return;
    }

    game.dir = game.next_dir;
    let new_head = (game.head.0 + game.dir.0, game.head.1 + game.dir.1);

    // wall or self collision
    if new_head.0 < 0
        || new_head.0 >= GRID_W
        || new_head.1 < 0
        || new_head.1 >= GRID_H
        || game.body.contains(&new_head)
    {
        game.game_over = true;
        if game.score > game.high_score {
            game.high_score = game.score;
            scores.snake = game.high_score;
            scores::save_scores(scores.snake, scores.breakout);
        }
        next_state.set(AppState::Hub);
        return;
    }

    let old_head = game.head;
    game.body.push(old_head);
    game.head = new_head;

    if game.head == game.food {
        game.score += 1;
        game.just_ate = true;
        let mut occ = game.body.clone();
        occ.push(game.head);
        game.food = random_food(&occ);
    } else {
        game.just_ate = false;
        game.body.remove(0);
    }
}

fn snake_sync(
    mut commands: Commands,
    mut game: ResMut<SnakeGame>,
    mut transforms: Query<&mut Transform>,
) {
    if game.game_over {
        return;
    }

    // ensure body entity count matches
    let current = game.body_entities.len();
    let needed = game.body.len();
    if current < needed {
        let pos = game.body[game.body.len() - 1];
        for _ in 0..(needed - current) {
            game.body_entities.push(spawn_block(
                &mut commands,
                pos,
                Color::srgb(0.2, 0.5, 0.25),
            ));
        }
    } else if current > needed {
        for _ in 0..(current - needed) {
            if let Some(e) = game.body_entities.pop() {
                commands.entity(e).despawn();
            }
        }
    }

    // update head
    if let Some(e) = game.head_entity {
        if let Ok(mut t) = transforms.get_mut(e) {
            t.translation = grid_to_world(game.head).extend(0.0);
        }
    }

    // update body
    for (idx, &pos) in game.body.iter().enumerate() {
        if let Some(&e) = game.body_entities.get(idx) {
            if let Ok(mut t) = transforms.get_mut(e) {
                t.translation = grid_to_world(pos).extend(0.0);
            }
        }
    }

    // update food
    if let Some(e) = game.food_entity {
        if let Ok(mut t) = transforms.get_mut(e) {
            t.translation = grid_to_world(game.food).extend(0.0);
        }
    }
}

fn cleanup_snake(mut commands: Commands, query: Query<Entity, With<SnakeEntity>>) {
    for e in &query {
        commands.entity(e).despawn_recursive();
    }
    commands.remove_resource::<SnakeGame>();
}
