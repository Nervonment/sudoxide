use serde::Serialize;
use sudoku::state::full_state::FullState;
use sudoku::techniques::{DirectOption, House, ReducingCandidatesOption, Technique};

pub mod hidden_subsets;
pub mod locked_candidates;
pub mod naked_subsets;
pub mod singles;

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

pub trait To<T> {
    fn text_default(&self) -> T;
    fn house1(&self) -> T;
    fn house2(&self) -> T;
    fn cell1(&self) -> T;
    fn num_to_fill(&self) -> T;
    fn candidate_to_remove(&self) -> T;
    fn candidate_to_reserve(&self) -> T;
}

impl To<Segment> for String {
    fn text_default(&self) -> Segment {
        Segment {
            text: self.clone(),
            color: Color::TextDefault,
        }
    }
    fn house1(&self) -> Segment {
        Segment {
            text: self.clone(),
            color: Color::House1,
        }
    }
    fn house2(&self) -> Segment {
        Segment {
            text: self.clone(),
            color: Color::House2,
        }
    }
    fn cell1(&self) -> Segment {
        Segment {
            text: self.clone(),
            color: Color::Cell1,
        }
    }
    fn num_to_fill(&self) -> Segment {
        Segment {
            text: self.clone(),
            color: Color::NumToFill,
        }
    }
    fn candidate_to_remove(&self) -> Segment {
        Segment {
            text: self.clone(),
            color: Color::CandidateToRemove,
        }
    }
    fn candidate_to_reserve(&self) -> Segment {
        Segment {
            text: self.clone(),
            color: Color::CandidateToReserve,
        }
    }
}

impl To<Element> for House {
    fn text_default(&self) -> Element {
        Element {
            kind: ElementType::House(self.clone()),
            color: Color::TextDefault,
        }
    }
    fn house1(&self) -> Element {
        Element {
            kind: ElementType::House(self.clone()),
            color: Color::House1,
        }
    }
    fn house2(&self) -> Element {
        Element {
            kind: ElementType::House(self.clone()),
            color: Color::House2,
        }
    }
    fn cell1(&self) -> Element {
        Element {
            kind: ElementType::House(self.clone()),
            color: Color::Cell1,
        }
    }
    fn num_to_fill(&self) -> Element {
        Element {
            kind: ElementType::House(self.clone()),
            color: Color::NumToFill,
        }
    }
    fn candidate_to_remove(&self) -> Element {
        Element {
            kind: ElementType::House(self.clone()),
            color: Color::CandidateToRemove,
        }
    }
    fn candidate_to_reserve(&self) -> Element {
        Element {
            kind: ElementType::House(self.clone()),
            color: Color::CandidateToReserve,
        }
    }
}

impl To<Element> for (usize, usize) {
    fn text_default(&self) -> Element {
        Element {
            kind: ElementType::Cell(self.0, self.1),
            color: Color::TextDefault,
        }
    }
    fn house1(&self) -> Element {
        Element {
            kind: ElementType::Cell(self.0, self.1),
            color: Color::House1,
        }
    }
    fn house2(&self) -> Element {
        Element {
            kind: ElementType::Cell(self.0, self.1),
            color: Color::House2,
        }
    }
    fn cell1(&self) -> Element {
        Element {
            kind: ElementType::Cell(self.0, self.1),
            color: Color::Cell1,
        }
    }
    fn num_to_fill(&self) -> Element {
        Element {
            kind: ElementType::Cell(self.0, self.1),
            color: Color::NumToFill,
        }
    }
    fn candidate_to_remove(&self) -> Element {
        Element {
            kind: ElementType::Cell(self.0, self.1),
            color: Color::CandidateToRemove,
        }
    }
    fn candidate_to_reserve(&self) -> Element {
        Element {
            kind: ElementType::Cell(self.0, self.1),
            color: Color::CandidateToReserve,
        }
    }
}


impl To<Element> for (usize, usize, i8) {
    fn text_default(&self) -> Element {
        Element {
            kind: ElementType::Candidate(self.0, self.1, self.2),
            color: Color::TextDefault,
        }
    }
    fn house1(&self) -> Element {
        Element {
            kind: ElementType::Candidate(self.0, self.1, self.2),
            color: Color::House1,
        }
    }
    fn house2(&self) -> Element {
        Element {
            kind: ElementType::Candidate(self.0, self.1, self.2),
            color: Color::House2,
        }
    }
    fn cell1(&self) -> Element {
        Element {
            kind: ElementType::Candidate(self.0, self.1, self.2),
            color: Color::Cell1,
        }
    }
    fn num_to_fill(&self) -> Element {
        Element {
            kind: ElementType::Candidate(self.0, self.1, self.2),
            color: Color::NumToFill,
        }
    }
    fn candidate_to_remove(&self) -> Element {
        Element {
            kind: ElementType::Candidate(self.0, self.1, self.2),
            color: Color::CandidateToRemove,
        }
    }
    fn candidate_to_reserve(&self) -> Element {
        Element {
            kind: ElementType::Candidate(self.0, self.1, self.2),
            color: Color::CandidateToReserve,
        }
    }
}