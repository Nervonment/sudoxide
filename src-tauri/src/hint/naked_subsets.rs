use sudoku::{
    state::full_state::FullState,
    techniques::{
        naked_subsets::{NakedPairBlock, NakedPairColumn, NakedPairInfo, NakedPairRow},
        Technique,
    },
};

use super::{
    house_to_house, house_to_string, Color, Element, ElementType, GetHint, Hint, HintOption,
    ReducingCandidatesOption, Segment,
};

fn naked_pair_to_hint(
    info: NakedPairInfo,
    option: sudoku::techniques::ReducingCandidatesOption,
) -> Hint {
    let mut visual_elements = vec![
        Element {
            kind: ElementType::House(house_to_house(info.house)),
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

    Hint {
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
        option: HintOption::ReducingCandidates(ReducingCandidatesOption::from(option)),
    }
}

pub struct NakedPair;
impl GetHint for NakedPair {
    fn get_hint(state: &FullState) -> Option<Hint> {
        let res = NakedPairBlock::check(state);
        if res.0.is_some() {
            return Some(
                naked_pair_to_hint(
                    res.0.clone().unwrap(),
                    <NakedPairBlock as Into<
                        Option<sudoku::techniques::ReducingCandidatesOption>,
                    >>::into(res)
                    .unwrap()
                    .into(),
                ),
            );
        }
        let res = NakedPairRow::check(state);
        if res.0.is_some() {
            return Some(naked_pair_to_hint(
                res.0.clone().unwrap(),
                <NakedPairRow as Into<Option<sudoku::techniques::ReducingCandidatesOption>>>::into(
                    res,
                )
                .unwrap()
                .into(),
            ));
        }
        let res = NakedPairColumn::check(state);
        if res.0.is_some() {
            return Some(
                naked_pair_to_hint(
                    res.0.clone().unwrap(),
                    <NakedPairColumn as Into<
                        Option<sudoku::techniques::ReducingCandidatesOption>,
                    >>::into(res)
                    .unwrap()
                    .into(),
                ),
            );
        }

        None
    }
}
