use sudoku::{
    state::full_state::FullState,
    techniques::{
        naked_subsets::{NakedPair, NakedSubset},
        ReducingCandidates, Technique,
    },
};

use super::{house_to_string, Color, Element, ElementType, GetHint, Hint, HintOption, Segment};

impl GetHint for NakedPair {
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
                    kind: ElementType::Cell(info.cells[0].0, info.cells[0].1),
                    color: Color::Cell1,
                },
                Element {
                    kind: ElementType::Cell(info.cells[1].0, info.cells[1].1),
                    color: Color::Cell1,
                },
                Element {
                    kind: ElementType::Candidate(info.cells[0].0, info.cells[0].1, info.rem_num_1),
                    color: Color::CandidateToReserve,
                },
                Element {
                    kind: ElementType::Candidate(info.cells[0].0, info.cells[0].1, info.rem_num_2),
                    color: Color::CandidateToReserve,
                },
                Element {
                    kind: ElementType::Candidate(info.cells[1].0, info.cells[1].1, info.rem_num_1),
                    color: Color::CandidateToReserve,
                },
                Element {
                    kind: ElementType::Candidate(info.cells[1].0, info.cells[1].1, info.rem_num_2),
                    color: Color::CandidateToReserve,
                },
            ];
            for cell in info.rem_cells_1 {
                visual_elements.push(Element {
                    kind: ElementType::Candidate(cell.0, cell.1, info.rem_num_1),
                    color: Color::CandidateToRemove,
                });
            }
            for cell in info.rem_cells_2 {
                visual_elements.push(Element {
                    kind: ElementType::Candidate(cell.0, cell.1, info.rem_num_2),
                    color: Color::CandidateToRemove,
                });
            }

            return Some(Hint {
                name: "Naked Pair".into(),
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
                        text: "这两格".into(),
                        color: Color::Cell1,
                    },
                    Segment {
                        text: "只能填".into(),
                        color: Color::TextDefault,
                    },
                    Segment {
                        text: info.rem_num_1.to_string(),
                        color: Color::CandidateToReserve,
                    },
                    Segment {
                        text: "和".into(),
                        color: Color::TextDefault,
                    },
                    Segment {
                        text: info.rem_num_2.to_string(),
                        color: Color::CandidateToReserve,
                    },
                    Segment {
                        text: "，所以".into(),
                        color: Color::TextDefault,
                    },
                    Segment {
                        text: info.rem_num_1.to_string(),
                        color: Color::CandidateToReserve,
                    },
                    Segment {
                        text: "和".into(),
                        color: Color::TextDefault,
                    },
                    Segment {
                        text: info.rem_num_2.to_string(),
                        color: Color::CandidateToReserve,
                    },
                    Segment {
                        text: "也只可能填在".into(),
                        color: Color::TextDefault,
                    },
                    Segment {
                        text: "这两格".into(),
                        color: Color::Cell1,
                    },
                    Segment {
                        text: "，进而可以将".into(),
                        color: Color::TextDefault,
                    },
                    Segment {
                        text: info.rem_num_1.to_string(),
                        color: Color::CandidateToRemove,
                    },
                    Segment {
                        text: "和".into(),
                        color: Color::TextDefault,
                    },
                    Segment {
                        text: info.rem_num_2.to_string(),
                        color: Color::CandidateToRemove,
                    },
                    Segment {
                        text: "从其他的格子的候选数字中删去。".into(),
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

impl GetHint for NakedSubset {
    fn get_hint(&self) -> Option<Hint> {
        if <Self as Technique<FullState>>::appliable(&self) {
            let info = self.0.clone().unwrap();
            let option = <Self as ReducingCandidates<FullState>>::option(&self).unwrap();

            let nums_str: Vec<String> = info.nums.iter().map(|num| num.to_string()).collect();
            let nums_str = nums_str.join(" ");

            let mut visual_elements = vec![Element {
                kind: ElementType::House(info.house),
                color: Color::House1,
            }];

            visual_elements.extend(info.cells.iter().map(|(r, c)| Element {
                kind: ElementType::Cell(*r, *c),
                color: Color::Cell1,
            }));

            visual_elements.extend(info.nums.iter().flat_map(|num| {
                info.cells.iter().map(|(r, c)| Element {
                    kind: ElementType::Candidate(*r, *c, *num),
                    color: Color::CandidateToReserve,
                })
            }));

            visual_elements.extend(info.removes.iter().flat_map(|(cells, num)| {
                cells.iter().map(|(r, c)| Element {
                    kind: ElementType::Candidate(*r, *c, *num),
                    color: Color::CandidateToRemove,
                })
            }));

            return Some(Hint {
                name: match info.k {
                    3 => "Naked Triplet".into(),
                    4 => "Naked Quadruplet".into(),
                    _ => format!("Naked {}-Subset", info.k),
                },
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
                        text: format!("这{}格", info.k),
                        color: Color::Cell1,
                    },
                    Segment {
                        text: "只能填".into(),
                        color: Color::TextDefault,
                    },
                    Segment {
                        text: nums_str.clone(),
                        color: Color::CandidateToReserve,
                    },
                    Segment {
                        text: "，所以".into(),
                        color: Color::TextDefault,
                    },
                    Segment {
                        text: nums_str.clone(),
                        color: Color::CandidateToReserve,
                    },
                    Segment {
                        text: "也只可能填在".into(),
                        color: Color::TextDefault,
                    },
                    Segment {
                        text: format!("这{}格", info.k),
                        color: Color::Cell1,
                    },
                    Segment {
                        text: "，进而可以将".into(),
                        color: Color::TextDefault,
                    },
                    Segment {
                        text: nums_str,
                        color: Color::CandidateToRemove,
                    },
                    Segment {
                        text: "从其他的格子的候选数字中删去。".into(),
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
