// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::atomic::AtomicU8;

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

fn main() {
    tauri::Builder::default()
        .manage(Difficulty(AtomicU8::new(2)))
        .invoke_handler(tauri::generate_handler![
            get_sudoku_puzzle,
            judge_sudoku,
            set_difficulty,
            get_difficulty
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
async fn get_sudoku_puzzle(difficulty: State<'_, Difficulty>) -> Result<[[i8; 9]; 9], ()> {
    let difficulty = difficulty.0.load(std::sync::atomic::Ordering::Relaxed);
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

struct Difficulty(AtomicU8);

#[tauri::command]
fn set_difficulty(new_difficulty: u8, difficulty: State<'_, Difficulty>) {
    let new_difficulty = if new_difficulty > 5 {
        5
    } else {
        new_difficulty
    };
    difficulty
        .0
        .store(new_difficulty, std::sync::atomic::Ordering::Relaxed);
}

#[tauri::command]
fn get_difficulty(difficulty: State<'_, Difficulty>) -> Result<u8, ()> {
    Ok(difficulty.0.load(std::sync::atomic::Ordering::Relaxed))
}
