use sudoku::{state::full_state::FullState, techniques::Technique, utils::coord_2_block};

use super::{
    house_to_house, house_to_string, Color, Element, ElementType, GetHint, Hint, HintOption,
    ReducingCandidatesOption, Segment,
};

pub struct Pointing;
impl GetHint for Pointing {
    fn get_hint(state: &FullState) -> Option<Hint> {
        let res = sudoku::techniques::locked_candidates::Pointing::check(state);
        if res.0.is_some() {
            let info = res.0.clone().unwrap();
            let mut visual_elements = vec![
                Element {
                    kind: ElementType::House(super::House::Block(info.block)),
                    color: Color::House1,
                },
                Element {
                    kind: ElementType::House(house_to_house(info.rem_house)),
                    color: Color::House2,
                },
            ];
            for (r, c) in info.rem_cells {
                visual_elements.push(Element {
                    kind: ElementType::Candidate(r, c, info.rem_num),
                    color: Color::CandidateToRemove,
                });
            }
            for r in 0..9 {
                for c in 0..9 {
                    if coord_2_block(r, c) == info.block {
                        visual_elements.push(Element {
                            kind: ElementType::Candidate(r, c, info.rem_num),
                            color: Color::CandidateToReserve,
                        });
                    }
                }
            }

            return Some(Hint {
                name: "Pointing".into(),
                description: vec![
                    Segment {
                        text: format!("第{}宫", info.block + 1),
                        color: Color::House1,
                    },
                    Segment {
                        text: "中，所有可以填".into(),
                        color: Color::TextDefault,
                    },
                    Segment {
                        text: info.rem_num.to_string(),
                        color: Color::CandidateToReserve,
                    },
                    Segment {
                        text: "的格子都在".into(),
                        color: Color::TextDefault,
                    },
                    Segment {
                        text: house_to_string(info.rem_house),
                        color: Color::House2,
                    },
                    Segment {
                        text: "，所以".into(),
                        color: Color::TextDefault,
                    },
                    Segment {
                        text: house_to_string(info.rem_house),
                        color: Color::House2,
                    },
                    Segment {
                        text: "中的".into(),
                        color: Color::TextDefault,
                    },
                    Segment {
                        text: info.rem_num.to_string(),
                        color: Color::CandidateToReserve,
                    },
                    Segment {
                        text: "也只能填在这些格子中，进而可以从其他格子的候选数中移除".into(),
                        color: Color::TextDefault,
                    },
                    Segment {
                        text: info.rem_num.to_string(),
                        color: Color::CandidateToRemove,
                    },
                    Segment {
                        text: "。".into(),
                        color: Color::TextDefault,
                    },
                ],
                visual_elements: visual_elements,
                option: HintOption::ReducingCandidates(ReducingCandidatesOption::from(
                    <sudoku::techniques::locked_candidates::Pointing as Into<
                        Option<sudoku::techniques::ReducingCandidatesOption>,
                    >>::into(res)
                    .unwrap(),
                )),
            });
        }
        None
    }
}

pub struct Claiming;
impl GetHint for Claiming {
    fn get_hint(state: &FullState) -> Option<Hint> {
        let res = sudoku::techniques::locked_candidates::Claiming::check(state);
        if res.0.is_some() {
            let info = res.0.clone().unwrap();
            let mut visual_elements = vec![
                Element {
                    kind: ElementType::House(super::House::Block(info.rem_block)),
                    color: Color::House2,
                },
                Element {
                    kind: ElementType::House(house_to_house(info.house)),
                    color: Color::House1,
                },
            ];
            for (r, c) in info.rem_cells {
                visual_elements.push(Element {
                    kind: ElementType::Candidate(r, c, info.rem_num),
                    color: Color::CandidateToRemove,
                });
            }
            for i in 0..9 {
                match info.house {
                    sudoku::techniques::House::Row(r) => {
                        visual_elements.push(Element {
                            kind: ElementType::Candidate(r, i, info.rem_num),
                            color: Color::CandidateToReserve,
                        });
                    }
                    sudoku::techniques::House::Column(c) => {
                        visual_elements.push(Element {
                            kind: ElementType::Candidate(i, c, info.rem_num),
                            color: Color::CandidateToReserve,
                        });
                    }
                    _ => {}
                }
            }

            return Some(Hint {
                name: "Claiming".into(),
                description: vec![
                    Segment {
                        text: house_to_string(info.house),
                        color: Color::House1,
                    },
                    Segment {
                        text: "中，所有可以填".into(),
                        color: Color::TextDefault,
                    },
                    Segment {
                        text: info.rem_num.to_string(),
                        color: Color::CandidateToReserve,
                    },
                    Segment {
                        text: "的格子都在".into(),
                        color: Color::TextDefault,
                    },
                    Segment {
                        text: format!("第{}宫", info.rem_block + 1),
                        color: Color::House2,
                    },
                    Segment {
                        text: "，所以".into(),
                        color: Color::TextDefault,
                    },
                    Segment {
                        text: format!("第{}宫", info.rem_block + 1),
                        color: Color::House2,
                    },
                    Segment {
                        text: "中的".into(),
                        color: Color::TextDefault,
                    },
                    Segment {
                        text: info.rem_num.to_string(),
                        color: Color::CandidateToReserve,
                    },
                    Segment {
                        text: "也只能填在这些格子中，进而可以从其他格子的候选数中移除".into(),
                        color: Color::TextDefault,
                    },
                    Segment {
                        text: info.rem_num.to_string(),
                        color: Color::CandidateToRemove,
                    },
                    Segment {
                        text: "。".into(),
                        color: Color::TextDefault,
                    },
                ],
                visual_elements: visual_elements,
                option: HintOption::ReducingCandidates(ReducingCandidatesOption::from(
                    <sudoku::techniques::locked_candidates::Claiming as Into<
                        Option<sudoku::techniques::ReducingCandidatesOption>,
                    >>::into(res)
                    .unwrap(),
                )),
            });
        }
        None
    }
}
