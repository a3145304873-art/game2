#[derive(Default)]
pub struct ScoreData {
    pub snake: u32,
    pub breakout: u32,
}

#[cfg(not(target_arch = "wasm32"))]
pub fn load_scores() -> ScoreData {
    if let Ok(content) = std::fs::read_to_string(".arcade_scores") {
        let parts: Vec<&str> = content.split_whitespace().collect();
        if parts.len() == 2 {
            return ScoreData {
                snake: parts[0].parse().unwrap_or(0),
                breakout: parts[1].parse().unwrap_or(0),
            };
        }
    }
    ScoreData::default()
}

#[cfg(not(target_arch = "wasm32"))]
pub fn save_scores(snake: u32, breakout: u32) {
    let _ = std::fs::write(".arcade_scores", format!("{} {}\n", snake, breakout));
}

#[cfg(target_arch = "wasm32")]
pub fn load_scores() -> ScoreData {
    let mut data = ScoreData::default();
    if let Some(window) = web_sys::window() {
        if let Ok(Some(storage)) = window.local_storage() {
            data.snake = storage
                .get_item("snake_highscore")
                .ok()
                .flatten()
                .and_then(|v| v.parse().ok())
                .unwrap_or(0);
            data.breakout = storage
                .get_item("breakout_highscore")
                .ok()
                .flatten()
                .and_then(|v| v.parse().ok())
                .unwrap_or(0);
        }
    }
    data
}

#[cfg(target_arch = "wasm32")]
pub fn save_scores(snake: u32, breakout: u32) {
    if let Some(window) = web_sys::window() {
        if let Ok(Some(storage)) = window.local_storage() {
            let _ = storage.set_item("snake_highscore", &snake.to_string());
            let _ = storage.set_item("breakout_highscore", &breakout.to_string());
        }
    }
}
