use sudoku::{
    state::full_state::FullState,
    techniques::{
        singles::{HiddenSingle, NakedSingle},
        Direct, Technique,
    },
};

use super::{house_to_string, Color, Element, ElementType, GetHint, Hint, HintOption, Segment};

impl GetHint for HiddenSingle {
    fn get_hint(&self) -> Option<Hint> {
        if <Self as Technique<FullState>>::appliable(&self) {
            let info = self.0.clone().unwrap();
            let option = <Self as Direct<FullState>>::option(&self).unwrap();
            return Some(Hint {
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
                        kind: ElementType::House(info.house),
                        color: Color::House1,
                    },
                    Element {
                        kind: ElementType::Cell(info.fillable.0, info.fillable.1),
                        color: Color::Cell1,
                    },
                    Element {
                        kind: ElementType::Candidate(
                            info.fillable.0,
                            info.fillable.1,
                            info.fillable.2,
                        ),
                        color: Color::NumToFill,
                    },
                ],
                option: HintOption::Direct(option),
            });
        }
        None
    }
}

impl GetHint for NakedSingle {
    fn get_hint(&self) -> Option<Hint> {
        if <Self as Technique<FullState>>::appliable(&self) {
            let info = self.0.clone().unwrap();
            let option = <Self as Direct<FullState>>::option(&self).unwrap();
            return Some(Hint {
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
                option: HintOption::Direct(option),
            });
        }
        None
    }
}
