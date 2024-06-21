use sudoku::{
    state::full_state::FullState,
    techniques::{
        fish::{FishInfo, Jellyfish, Swordfish, XWing},
        ReducingCandidates, ReducingCandidatesOption, Technique,
    },
};

use super::{house_to_string, GetHint, Hint, HintOption, To};

fn fish_info_to_hint(info: FishInfo, option: ReducingCandidatesOption) -> Hint {
    Hint {
        name: match info.size {
            2 => "X-Wing",
            3 => "Swordfish",
            4 => "Jellyfish",
            _ => "Fish",
        }
        .into(),
        description: vec![
            "在".text_default(),
            info.base_set
                .iter()
                .map(|house| house_to_string(*house))
                .collect::<Vec<_>>()
                .join(" ")
                .house1(),
            "中，所有可以填".text_default(),
            info.candidate.to_string().candidate_to_reserve(),
            "的格子都在".text_default(),
            "它们".house1(),
            "与".text_default(),
            info.cover_set
                .iter()
                .map(|house| house_to_string(*house))
                .collect::<Vec<_>>()
                .join(" ")
                .house2(),
            "的".text_default(),
            "交叉区域".cell1(),
            "中。无论".text_default(),
            info.candidate.to_string().candidate_to_reserve(),
            "在".text_default(),
            "交叉区域".cell1(),
            "中如何排列，".text_default(),
            info.cover_set
                .iter()
                .map(|house| house_to_string(*house))
                .collect::<Vec<_>>()
                .join(" ")
                .house2(),
            "中的".text_default(),
            info.candidate.to_string().candidate_to_reserve(),
            "都只能填在".text_default(),
            "交叉区域".cell1(),
            "中，进而可以从其他格子的候选数中移除".text_default(),
            info.candidate.to_string().candidate_to_remove(),
            "。".text_default(),
        ],
        visual_elements: vec![
            info.base_set
                .iter()
                .map(|house| house.house1())
                .collect::<Vec<_>>(),
            info.cover_set
                .iter()
                .map(|house| house.house2())
                .collect::<Vec<_>>(),
            info.overlap
                .iter()
                .map(|cell| cell.cell1())
                .collect::<Vec<_>>(),
            info.overlap
                .iter()
                .map(|(r, c)| (*r, *c, info.candidate).candidate_to_reserve())
                .collect::<Vec<_>>(),
            info.rem_cells
                .iter()
                .map(|(r, c)| (*r, *c, info.candidate).candidate_to_remove())
                .collect::<Vec<_>>(),
        ]
        .concat(),
        option: HintOption::ReducingCandidates(option),
    }
}

impl GetHint for XWing {
    fn get_hint(&self) -> Option<super::Hint> {
        if <Self as Technique<FullState>>::appliable(&self) {
            let info = self.0.clone().unwrap();
            let option = <Self as ReducingCandidates<FullState>>::option(&self).unwrap();
            return Some(fish_info_to_hint(info, option));
        }
        None
    }
}

impl GetHint for Swordfish {
    fn get_hint(&self) -> Option<super::Hint> {
        if <Self as Technique<FullState>>::appliable(&self) {
            let info = self.0.clone().unwrap();
            let option = <Self as ReducingCandidates<FullState>>::option(&self).unwrap();
            return Some(fish_info_to_hint(info, option));
        }
        None
    }
}

impl GetHint for Jellyfish {
    fn get_hint(&self) -> Option<super::Hint> {
        if <Self as Technique<FullState>>::appliable(&self) {
            let info = self.0.clone().unwrap();
            let option = <Self as ReducingCandidates<FullState>>::option(&self).unwrap();
            return Some(fish_info_to_hint(info, option));
        }
        None
    }
}
