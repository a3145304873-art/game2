use bevy::prelude::*;

use crate::{AppState, GameScores};

pub struct HubPlugin;

impl Plugin for HubPlugin {
    fn build(&self, app: &mut App) {
        app.add_systems(OnEnter(AppState::Hub), setup_hub)
            .add_systems(OnExit(AppState::Hub), cleanup_hub)
            .add_systems(Update, (hub_keyboard, hub_buttons).run_if(in_state(AppState::Hub)));
    }
}

#[derive(Component)]
struct OnHubScreen;

#[derive(Component)]
struct SnakeBtn;

#[derive(Component)]
struct BreakoutBtn;

fn setup_hub(mut commands: Commands, scores: Res<GameScores>) {
    commands.spawn((Camera2dBundle::default(), OnHubScreen));

    commands
        .spawn((
            NodeBundle {
                style: Style {
                    width: Val::Percent(100.0),
                    height: Val::Percent(100.0),
                    flex_direction: FlexDirection::Column,
                    align_items: AlignItems::Center,
                    justify_content: JustifyContent::FlexStart,
                    padding: UiRect::all(Val::Px(40.0)),
                    ..default()
                },
                background_color: BackgroundColor(Color::srgb(0.04, 0.04, 0.04)),
                ..default()
            },
            OnHubScreen,
        ))
        .with_children(|parent| {
            parent.spawn(TextBundle::from_section(
                "ARCADE HUB",
                TextStyle {
                    font_size: 50.0,
                    color: Color::srgb(0.3, 0.69, 0.31),
                    ..default()
                },
            ));

            parent.spawn(TextBundle::from_section(
                "Escolha seu jogo",
                TextStyle {
                    font_size: 22.0,
                    color: Color::srgb(0.47, 0.47, 0.47),
                    ..default()
                },
            ));

            parent.spawn(NodeBundle {
                style: Style {
                    height: Val::Px(50.0),
                    ..default()
                },
                ..default()
            });

            parent
                .spawn(NodeBundle {
                    style: Style {
                        width: Val::Percent(100.0),
                        height: Val::Auto,
                        flex_direction: FlexDirection::Row,
                        justify_content: JustifyContent::Center,
                        column_gap: Val::Px(40.0),
                        ..default()
                    },
                    ..default()
                })
                .with_children(|row| {
                    row.spawn((
                        ButtonBundle {
                            style: Style {
                                width: Val::Px(260.0),
                                height: Val::Px(280.0),
                                flex_direction: FlexDirection::Column,
                                align_items: AlignItems::Center,
                                justify_content: JustifyContent::Center,
                                ..default()
                            },
                            background_color: BackgroundColor(Color::srgb(0.08, 0.12, 0.08)),
                            border_color: BorderColor(Color::srgb(0.3, 0.69, 0.31)),
                            ..default()
                        },
                        SnakeBtn,
                    ))
                    .with_children(|card| {
                        card.spawn(TextBundle::from_section(
                            "SNAKE",
                            TextStyle {
                                font_size: 32.0,
                                color: Color::srgb(0.3, 0.69, 0.31),
                                ..default()
                            },
                        ));
                        card.spawn(TextBundle::from_section(
                            "Coma a comida\ne evite as paredes",
                            TextStyle {
                                font_size: 18.0,
                                color: Color::srgb(0.59, 0.59, 0.59),
                                ..default()
                            },
                        ));
                        card.spawn(TextBundle::from_section(
                            format!("Recorde: {}", scores.snake),
                            TextStyle {
                                font_size: 18.0,
                                color: Color::srgb(1.0, 0.6, 0.0),
                                ..default()
                            },
                        ));
                    });

                    row.spawn((
                        ButtonBundle {
                            style: Style {
                                width: Val::Px(260.0),
                                height: Val::Px(280.0),
                                flex_direction: FlexDirection::Column,
                                align_items: AlignItems::Center,
                                justify_content: JustifyContent::Center,
                                ..default()
                            },
                            background_color: BackgroundColor(Color::srgb(0.35, 0.08, 0.15)),
                            border_color: BorderColor(Color::srgb(0.91, 0.12, 0.39)),
                            ..default()
                        },
                        BreakoutBtn,
                    ))
                    .with_children(|card| {
                        card.spawn(TextBundle::from_section(
                            "BREAKOUT",
                            TextStyle {
                                font_size: 32.0,
                                color: Color::srgb(0.91, 0.12, 0.39),
                                ..default()
                            },
                        ));
                        card.spawn(TextBundle::from_section(
                            "Destrua os tijolos\ne nao deixe cair",
                            TextStyle {
                                font_size: 18.0,
                                color: Color::srgb(0.59, 0.59, 0.59),
                                ..default()
                            },
                        ));
                        card.spawn(TextBundle::from_section(
                            format!("Recorde: {}", scores.breakout),
                            TextStyle {
                                font_size: 18.0,
                                color: Color::srgb(1.0, 0.92, 0.23),
                                ..default()
                            },
                        ));
                    });
                });
        });
}

fn hub_keyboard(
    keys: Res<ButtonInput<KeyCode>>,
    mut next_state: ResMut<NextState<AppState>>,
) {
    if keys.just_pressed(KeyCode::Digit1) || keys.just_pressed(KeyCode::Numpad1) {
        next_state.set(AppState::Snake);
    }
    if keys.just_pressed(KeyCode::Digit2) || keys.just_pressed(KeyCode::Numpad2) {
        next_state.set(AppState::Breakout);
    }
}

fn hub_buttons(
    mut interaction_query: Query<
        (&Interaction, Option<&SnakeBtn>, Option<&BreakoutBtn>),
        (Changed<Interaction>, With<Button>),
    >,
    mut next_state: ResMut<NextState<AppState>>,
) {
    for (interaction, snake, breakout) in &mut interaction_query {
        if *interaction == Interaction::Pressed {
            if snake.is_some() {
                next_state.set(AppState::Snake);
            } else if breakout.is_some() {
                next_state.set(AppState::Breakout);
            }
        }
    }
}

fn cleanup_hub(mut commands: Commands, query: Query<Entity, With<OnHubScreen>>) {
    for e in &query {
        commands.entity(e).despawn_recursive();
    }
}
