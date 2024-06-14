use serde::Serialize;
use sudoku::state::full_state::FullState;
use sudoku::techniques::{DirectOption, House, ReducingCandidatesOption, Technique};

pub mod singles;
pub mod locked_candidates;
pub mod hidden_subsets;
pub mod naked_subsets;

#[derive(Serialize)]
#[serde(remote = "DirectOption")]
pub struct DirectOptionDef(pub usize, pub usize, pub i8);

#[derive(Serialize)]
#[serde(remote = "ReducingCandidatesOption")]
pub struct ReducingCandidatesOptionDef(pub Vec<(Vec<(usize, usize)>, Vec<i8>)>);

#[derive(Serialize)]
pub enum HintOption {
    #[serde(with = "DirectOptionDef")]
    Direct(DirectOption),
    #[serde(with = "ReducingCandidatesOptionDef")]
    ReducingCandidates(ReducingCandidatesOption),
}

#[derive(Serialize)]
pub struct Hint {
    pub name: String,
    pub description: Vec<Segment>,
    pub visual_elements: Vec<Element>,
    pub option: HintOption,
}

pub trait GetHint: Technique<FullState> {
    fn get_hint(&self) -> Option<Hint>;
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
    #[serde(with = "HouseDef")]
    House(House),
    Cell(usize, usize),
    Candidate(usize, usize, i8),
}

#[derive(Serialize)]
#[serde(remote = "House")]
pub enum HouseDef {
    Row(usize),
    Column(usize),
    Block(usize),
}

fn house_to_string(house: House) -> String {
    match house {
        sudoku::techniques::House::Row(idx) => format!("第{}行", idx + 1),
        sudoku::techniques::House::Column(idx) => format!("第{}列", idx + 1),
        sudoku::techniques::House::Block(idx) => format!("第{}宫", idx + 1),
    }
}
