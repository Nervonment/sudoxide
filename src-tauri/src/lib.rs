use std::sync::{Arc, Mutex};

use serde::Serialize;
use sudoku::{
    game::generator::random_sudoku_puzzle_phishing,
    neo::{
        generator::random_sudoku_puzzle,
        judge::judge_sudoku as judge,
        puzzle::{SudokuPuzzleFull, SudokuPuzzleSimple},
        solver::{StochasticSolver, TechniquesSolver},
    },
};
use tauri::State;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(SettingsState(Default::default()))
        .invoke_handler(tauri::generate_handler![
            get_sudoku_puzzle,
            judge_sudoku,
            set_difficulty,
            get_difficulty,
            set_marking_assist,
            get_marking_assist,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[derive(Serialize)]
struct Settings {
    difficulty: u8,
    marking_assist: bool,
}

impl Default for Settings {
    fn default() -> Self {
        Self {
            difficulty: 2,
            marking_assist: false,
        }
    }
}

#[derive(Default)]
struct SettingsState(Arc<Mutex<Settings>>);

#[tauri::command]
async fn get_sudoku_puzzle(settings: State<'_, SettingsState>) -> Result<[[i8; 9]; 9], ()> {
    let difficulty = settings.0.lock().unwrap().difficulty;
    Ok(match difficulty {
        0 => random_sudoku_puzzle::<
            StochasticSolver<SudokuPuzzleSimple>,
            TechniquesSolver<SudokuPuzzleFull>,
        >(30, 0, 50),
        1 => random_sudoku_puzzle::<
            StochasticSolver<SudokuPuzzleSimple>,
            TechniquesSolver<SudokuPuzzleFull>,
        >(50, 50, 90),
        2 => random_sudoku_puzzle::<
            StochasticSolver<SudokuPuzzleSimple>,
            TechniquesSolver<SudokuPuzzleFull>,
        >(55, 90, 200),
        3 => random_sudoku_puzzle::<
            StochasticSolver<SudokuPuzzleSimple>,
            TechniquesSolver<SudokuPuzzleFull>,
        >(50, 200, 1000),
        4 => random_sudoku_puzzle::<
            StochasticSolver<SudokuPuzzleSimple>,
            TechniquesSolver<SudokuPuzzleFull>,
        >(45, 800, 10000),
        _ => random_sudoku_puzzle_phishing(),
    })
}

#[tauri::command]
async fn judge_sudoku(board: [[i8; 9]; 9]) -> (bool, [[bool; 9]; 9]) {
    let res = judge(&board);
    (res.1, res.2)
}

#[tauri::command]
fn set_difficulty(new_difficulty: u8, settings: State<'_, SettingsState>) {
    let new_difficulty = if new_difficulty > 5 {
        5
    } else {
        new_difficulty
    };
    settings.0.lock().unwrap().difficulty = new_difficulty;
}

#[tauri::command]
fn get_difficulty(settings: State<'_, SettingsState>) -> Result<u8, ()> {
    Ok(settings.0.lock().unwrap().difficulty)
}

#[tauri::command]
fn set_marking_assist(marking_assist: bool, settings: State<'_, SettingsState>) {
    settings.0.lock().unwrap().marking_assist = marking_assist;
}

#[tauri::command]
fn get_marking_assist(settings: State<'_, SettingsState>) -> Result<bool, ()> {
    Ok(settings.0.lock().unwrap().marking_assist)
}
