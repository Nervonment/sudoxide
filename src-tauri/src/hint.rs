use serde::Serialize;
use sudoku::state::full_state::FullState;
// use sudoku::techniques::{DirectOption, ReducingCandidatesOption};

pub mod singles;
pub mod locked_candidates;
pub mod hidden_subsets;

#[derive(Serialize)]
pub struct DirectOption(pub usize, pub usize, pub i8);
impl From<sudoku::techniques::DirectOption> for DirectOption {
    fn from(value: sudoku::techniques::DirectOption) -> Self {
        Self(value.0, value.1, value.2)
    }
}

#[derive(Serialize)]
pub struct ReducingCandidatesOption(pub Vec<(Vec<(usize, usize)>, Vec<i8>)>);
impl From<sudoku::techniques::ReducingCandidatesOption> for ReducingCandidatesOption {
    fn from(value: sudoku::techniques::ReducingCandidatesOption) -> Self {
        Self(value.0)
    }
}

#[derive(Serialize)]
pub enum HintOption {
    Direct(DirectOption),
    ReducingCandidates(ReducingCandidatesOption),
}

#[derive(Serialize)]
pub struct Hint {
    pub name: String,
    pub description: Vec<Segment>,
    pub visual_elements: Vec<Element>,
    pub option: HintOption,
}

pub trait GetHint {
    fn get_hint(state: &FullState) -> Option<Hint>;
}

#[derive(Serialize)]
pub struct Segment {
    pub text: String,
    pub color: Color,
}

#[derive(Serialize)]
pub struct Element {
    pub kind: ElementType,
    pub color: Color,
}

#[derive(Serialize)]
pub enum Color {
    TextDefault,
    House1,
    House2,
    Cell1,
    NumToFill,
    CandidateToReserve,
    CandidateToRemove,
}

#[derive(Serialize)]
pub enum ElementType {
    House(House),
    Cell(usize, usize),
    Candidate(usize, usize, i8),
}

#[derive(Serialize)]
pub enum House {
    Row(usize),
    Column(usize),
    Block(usize),
}

fn house_to_string(house: sudoku::techniques::House) -> String {
    match house {
        sudoku::techniques::House::Row(idx) => format!("第{}行", idx + 1),
        sudoku::techniques::House::Column(idx) => format!("第{}列", idx + 1),
        sudoku::techniques::House::Block(idx) => format!("第{}宫", idx + 1),
    }
}

fn house_to_house(house: sudoku::techniques::House) -> House {
    match house {
        sudoku::techniques::House::Row(idx) => House::Row(idx),
        sudoku::techniques::House::Column(idx) => House::Column(idx),
        sudoku::techniques::House::Block(idx) => House::Block(idx),
    }
}
