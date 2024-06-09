use sudoku::{
    state::full_state::FullState,
    techniques::{
        singles::{
            HiddenSingleBlock, HiddenSingleColumn, HiddenSingleInfo, HiddenSingleRow,
            NakedSingleInfo,
        },
        Technique,
    },
};

use super::{
    house_to_house, house_to_string, Color, DirectOption, Element, ElementType, GetHint, Hint,
    HintOption, Segment,
};

fn hidden_single_to_hint(info: HiddenSingleInfo, option: sudoku::techniques::DirectOption) -> Hint {
    Hint {
        name: "Hidden Single".into(),
        description: vec![
            Segment {
                text: house_to_string(info.house),
                color: Color::House1,
            },
            Segment {
                text: "中只有".into(),
                color: Color::TextDefault,
            },
            Segment {
                text: "此格".into(),
                color: Color::Cell1,
            },
            Segment {
                text: "可以填".into(),
                color: Color::TextDefault,
            },
            Segment {
                text: format!("{}", info.fillable.2),
                color: Color::NumToFill,
            },
            Segment {
                text: "。".into(),
                color: Color::TextDefault,
            },
        ],
        visual_elements: vec![
            Element {
                kind: ElementType::House(house_to_house(info.house)),
                color: Color::House1,
            },
            Element {
                kind: ElementType::Cell(info.fillable.0, info.fillable.1),
                color: Color::Cell1,
            },
            Element {
                kind: ElementType::Candidate(info.fillable.0, info.fillable.1, info.fillable.2),
                color: Color::NumToFill,
            },
        ],
        option: HintOption::Direct(DirectOption::from(option)),
    }
}

pub struct HiddenSingle;
impl GetHint for HiddenSingle {
    fn get_hint(state: &FullState) -> Option<Hint> {
        let res = HiddenSingleBlock::check(state);
        if res.0.is_some() {
            let info = res.0;
            return info.map(|info| {
                hidden_single_to_hint(
                    info,
                    <HiddenSingleBlock as Into<Option<sudoku::techniques::DirectOption>>>::into(
                        res,
                    )
                    .unwrap(),
                )
            });
        }
        let res = HiddenSingleRow::check(state);
        if res.0.is_some() {
            let info = res.0;
            return info.map(|info| {
                hidden_single_to_hint(
                    info,
                    <HiddenSingleRow as Into<Option<sudoku::techniques::DirectOption>>>::into(res)
                        .unwrap(),
                )
            });
        }
        let res = HiddenSingleColumn::check(state);
        if res.0.is_some() {
            let info = res.0;
            return info.map(|info| {
                hidden_single_to_hint(
                    info,
                    <HiddenSingleColumn as Into<Option<sudoku::techniques::DirectOption>>>::into(
                        res,
                    )
                    .unwrap(),
                )
            });
        }
        None
    }
}

fn naked_single_to_hint(info: NakedSingleInfo, option: sudoku::techniques::DirectOption) -> Hint {
    Hint {
        name: "Naked Single".into(),
        description: vec![
            Segment {
                text: "此格".into(),
                color: Color::Cell1,
            },
            Segment {
                text: "只能填".into(),
                color: Color::TextDefault,
            },
            Segment {
                text: format!("{}", info.0 .2),
                color: Color::NumToFill,
            },
            Segment {
                text: "。".into(),
                color: Color::TextDefault,
            },
        ],
        visual_elements: vec![
            Element {
                kind: ElementType::Cell(info.0 .0, info.0 .1),
                color: Color::Cell1,
            },
            Element {
                kind: ElementType::Candidate(info.0 .0, info.0 .1, info.0 .2),
                color: Color::NumToFill,
            },
        ],
        option: HintOption::Direct(DirectOption::from(option)),
    }
}

pub struct NakedSingle;
impl GetHint for NakedSingle {
    fn get_hint(state: &FullState) -> Option<Hint> {
        let res = sudoku::techniques::singles::NakedSingle::check(state);
        if res.0.is_some() {
            let info = res.0;
            return info.map(|info| {
                naked_single_to_hint(
                    info,
                    <sudoku::techniques::singles::NakedSingle as Into<
                        Option<sudoku::techniques::DirectOption>,
                    >>::into(res)
                    .unwrap(),
                )
            });
        }
        None
    }
}
