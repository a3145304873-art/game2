use bevy::prelude::*;

mod breakout;
mod hub;
mod scores;
mod snake;

#[derive(Clone, Copy, Default, Eq, PartialEq, Hash, Debug, States)]
pub enum AppState {
    #[default]
    Hub,
    Snake,
    Breakout,
}

#[derive(Resource)]
pub struct GameScores {
    pub snake: u32,
    pub breakout: u32,
}

fn main() {
    App::new()
        .add_plugins(DefaultPlugins.set(WindowPlugin {
            primary_window: Some(Window {
                title: "Arcade Hub".into(),
                resolution: (800.0, 600.0).into(),
                ..default()
            }),
            ..default()
        }))
        .insert_resource(ClearColor(Color::srgb(0.04, 0.04, 0.04)))
        .insert_resource(GameScores {
            snake: 0,
            breakout: 0,
        })
        .add_systems(Startup, init_scores)
        .init_state::<AppState>()
        .add_plugins((hub::HubPlugin, snake::SnakePlugin, breakout::BreakoutPlugin))
        .add_systems(Update, global_exit.run_if(not(in_state(AppState::Hub))))
        .run();
}

fn init_scores(mut scores: ResMut<GameScores>) {
    let loaded = scores::load_scores();
    scores.snake = loaded.snake;
    scores.breakout = loaded.breakout;
}

fn global_exit(keys: Res<ButtonInput<KeyCode>>, mut next_state: ResMut<NextState<AppState>>) {
    if keys.just_pressed(KeyCode::Escape) {
        next_state.set(AppState::Hub);
    }
}
