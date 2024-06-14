// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use app::hint::{GetHint, Hint};
use serde::Serialize;
use std::sync::{Arc, Mutex};
use sudoku::{
    generator::{
        random_sudoku_puzzle_easy, random_sudoku_puzzle_extraeasy, random_sudoku_puzzle_extrahard,
        random_sudoku_puzzle_hard, random_sudoku_puzzle_normal, random_sudoku_puzzle_ultimate,
    },
    judge::judge_sudoku as judge,
    solver::{advanced::AdvancedSolver, Solver},
    state::full_state::FullState,
    techniques::{
        hidden_subsets::HiddenPair,
        locked_candidates::{Claiming, Pointing},
        naked_subsets::{NakedPair, NakedSubset},
        singles::{HiddenSingle, NakedSingle},
    },
    Grid,
};
use tauri::State;

fn main() {
    tauri::Builder::default()
        .manage(SettingsState(Default::default()))
        .invoke_handler(tauri::generate_handler![
            get_sudoku_puzzle,
            judge_sudoku,
            set_difficulty,
            get_difficulty,
            set_marking_assist,
            get_marking_assist,
            set_begin_with_marks,
            get_begin_with_marks,
            get_hint
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[derive(Serialize)]
struct Settings {
    difficulty: u8,
    marking_assist: bool,
    begin_with_marks: bool,
}

impl Default for Settings {
    fn default() -> Self {
        Self {
            difficulty: 1,
            marking_assist: true,
            begin_with_marks: false,
        }
    }
}

#[derive(Default)]
struct SettingsState(Arc<Mutex<Settings>>);

#[tauri::command]
async fn get_sudoku_puzzle(settings: State<'_, SettingsState>) -> Result<[[i8; 9]; 9], ()> {
    let difficulty = settings.0.lock().unwrap().difficulty;
    Ok(match difficulty {
        0 => random_sudoku_puzzle_extraeasy().0,
        1 => random_sudoku_puzzle_easy().0,
        2 => random_sudoku_puzzle_normal().0,
        3 => random_sudoku_puzzle_hard().0,
        4 => random_sudoku_puzzle_extrahard().0,
        _ => random_sudoku_puzzle_ultimate().0,
    })
}

#[tauri::command]
async fn judge_sudoku(grid: [[i8; 9]; 9]) -> (bool, [[bool; 9]; 9]) {
    let res = judge(&sudoku::Grid(grid));
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

#[tauri::command]
fn set_begin_with_marks(begin_with_marks: bool, settings: State<'_, SettingsState>) {
    settings.0.lock().unwrap().begin_with_marks = begin_with_marks;
}

#[tauri::command]
fn get_begin_with_marks(settings: State<'_, SettingsState>) -> Result<bool, ()> {
    Ok(settings.0.lock().unwrap().begin_with_marks)
}

#[derive(Serialize)]
pub enum GetHintResult {
    Success,
    WrongFill,
    WrongMark,
}

#[tauri::command]
fn get_hint(grid: [[i8; 9]; 9], candidates: [[[bool; 10]; 9]; 9]) -> (Option<Hint>, GetHintResult) {
    let mut solver: AdvancedSolver<FullState> = AdvancedSolver::from(Grid(grid));
    if !solver.have_unique_solution() {
        return (None, GetHintResult::WrongFill);
    }

    let state = FullState::new(Grid(grid), candidates);
    let mut solver: AdvancedSolver<FullState> = AdvancedSolver::from(state.clone());
    if !solver.have_unique_solution() {
        return (None, GetHintResult::WrongMark);
    }

    let techniques: [&mut dyn GetHint; 7] = [
        &mut NakedSingle::default(),
        &mut HiddenSingle::default(),
        &mut Pointing::default(),
        &mut Claiming::default(),
        &mut NakedPair::default(),
        &mut HiddenPair::default(),
        &mut NakedSubset::default(),
    ];

    for technique in techniques {
        technique.analyze(&state);
        if technique.appliable() {
            return (technique.get_hint(), GetHintResult::Success);
        }
    }

    (None, GetHintResult::Success)
}
