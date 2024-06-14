use sudoku::{
    state::full_state::FullState,
    techniques::{hidden_subsets::HiddenPair, ReducingCandidates, Technique},
};

use super::{house_to_string, Color, Element, ElementType, GetHint, Hint, HintOption, Segment};

impl GetHint for HiddenPair {
    fn get_hint(&self) -> Option<Hint> {
        if <Self as Technique<FullState>>::appliable(&self) {
            let info = self.0.clone().unwrap();
            let option = <Self as ReducingCandidates<FullState>>::option(&self).unwrap();
            let mut visual_elements = vec![
                Element {
                    kind: ElementType::House(info.house),
                    color: Color::House1,
                },
                Element {
                    kind: ElementType::Candidate(
                        info.rem_cell_1.0,
                        info.rem_cell_1.1,
                        info.nums[0],
                    ),
                    color: Color::CandidateToReserve,
                },
                Element {
                    kind: ElementType::Candidate(
                        info.rem_cell_1.0,
                        info.rem_cell_1.1,
                        info.nums[1],
                    ),
                    color: Color::CandidateToReserve,
                },
                Element {
                    kind: ElementType::Candidate(
                        info.rem_cell_2.0,
                        info.rem_cell_2.1,
                        info.nums[0],
                    ),
                    color: Color::CandidateToReserve,
                },
                Element {
                    kind: ElementType::Candidate(
                        info.rem_cell_2.0,
                        info.rem_cell_2.1,
                        info.nums[1],
                    ),
                    color: Color::CandidateToReserve,
                },
                Element {
                    kind: ElementType::Cell(info.rem_cell_1.0, info.rem_cell_1.1),
                    color: Color::Cell1,
                },
                Element {
                    kind: ElementType::Cell(info.rem_cell_2.0, info.rem_cell_2.1),
                    color: Color::Cell1,
                },
            ];
            for num in info.rem_nums_1 {
                visual_elements.push(Element {
                    kind: ElementType::Candidate(info.rem_cell_1.0, info.rem_cell_1.1, num),
                    color: Color::CandidateToRemove,
                });
            }
            for num in info.rem_nums_2 {
                visual_elements.push(Element {
                    kind: ElementType::Candidate(info.rem_cell_2.0, info.rem_cell_2.1, num),
                    color: Color::CandidateToRemove,
                });
            }

            return Some(Hint {
                name: "Hidden Pair".into(),
                description: vec![
                    Segment {
                        text: house_to_string(info.house),
                        color: Color::House1,
                    },
                    Segment {
                        text: "中，".into(),
                        color: Color::TextDefault,
                    },
                    Segment {
                        text: info.nums[0].to_string(),
                        color: Color::CandidateToReserve,
                    },
                    Segment {
                        text: "和".into(),
                        color: Color::TextDefault,
                    },
                    Segment {
                        text: info.nums[1].to_string(),
                        color: Color::CandidateToReserve,
                    },
                    Segment {
                        text: "只能填在".into(),
                        color: Color::TextDefault,
                    },
                    Segment {
                        text: "这两格".into(),
                        color: Color::Cell1,
                    },
                    Segment {
                        text: "，所以".into(),
                        color: Color::TextDefault,
                    },
                    Segment {
                        text: "这两格".into(),
                        color: Color::Cell1,
                    },
                    Segment {
                        text: "也只可能填".into(),
                        color: Color::TextDefault,
                    },
                    Segment {
                        text: info.nums[0].to_string(),
                        color: Color::CandidateToReserve,
                    },
                    Segment {
                        text: "和".into(),
                        color: Color::TextDefault,
                    },
                    Segment {
                        text: info.nums[1].to_string(),
                        color: Color::CandidateToReserve,
                    },
                    Segment {
                        text: "，".into(),
                        color: Color::TextDefault,
                    },
                    Segment {
                        text: "其他的候选数字".into(),
                        color: Color::CandidateToRemove,
                    },
                    Segment {
                        text: "可以删去。".into(),
                        color: Color::TextDefault,
                    },
                ],
                visual_elements,
                option: HintOption::ReducingCandidates(option),
            });
        }
        None
    }
}
