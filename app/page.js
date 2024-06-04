'use client'

const poppins = Poppins({ subsets: ["latin"], weight: ["800"] })

import SudokuBoard from "@/components/sudoku_board";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { cn, difficultyDesc } from "@/lib/utils";
import { invoke } from "@tauri-apps/api/tauri";
import { ChevronDown, HelpCircle, Settings2 } from "lucide-react";
import { useTheme } from "next-themes";
import { Poppins } from "next/font/google";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [difficulty, setDifficulty] = useState(2);
  const [markingAssist, setMarkingAssist] = useState(false);

  useEffect(() => {
    invoke('get_difficulty').then((difficulty) => setDifficulty(difficulty));
    invoke('get_marking_assist').then((markingAssist) => setMarkingAssist(markingAssist));
  }, []);

  const randomPuzzle = [
    [4, 0, 8, 0, 0, 0, 0, 0, 9],
    [0, 0, 0, 4, 9, 0, 7, 0, 0],
    [0, 0, 0, 6, 8, 0, 0, 0, 0],
    [0, 0, 6, 8, 0, 0, 5, 0, 0],
    [8, 0, 1, 0, 4, 9, 0, 0, 0],
    [0, 0, 0, 0, 1, 6, 8, 0, 0],
    [0, 0, 0, 3, 7, 4, 9, 0, 0],
    [0, 0, 3, 9, 0, 0, 2, 0, 0],
    [9, 0, 0, 0, 6, 0, 0, 3, 7],
  ].map((row) => row.map((val) => ({ value: val, candidates: [], mutable: val == 0, valid: true })));

  const { theme, setTheme } = useTheme();

  return (
    <div className="w-screen h-screen relative flex flex-col gap-2 items-center justify-center overflow-hidden">
      <h1 className={cn(poppins, "text-5xl font-bold")}>
        <span>Sudox</span>
        <span className="text-primary">ide</span>
      </h1>
      <Button size="lg" asChild>
        <Link href={"/start"}> 开始</Link>
      </Button>
      <Drawer direction="right">
        <DrawerTrigger asChild >
          <Button variant="link" className="absolute right-0">
            <Settings2 />
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <div className="w-80 py-8 px-4 flex flex-col justify-center gap-4">
            <div className="flex flex-col justify-center gap-4 mb-4">
              <div className="flex justify-between">
                <Label className="font-bold">难度</Label>
                <Label>{difficultyDesc[difficulty]}</Label>
              </div>
              <Slider
                data-vaul-no-drag
                defaultValue={[difficulty]}
                onValueChange={([value]) => {
                  setDifficulty(value);
                  invoke('set_difficulty', { newDifficulty: value });
                }}
                max={5}
                step={1}
              />
            </div>
            <div className="flex justify-between items-center">
              <Popover>
                <PopoverTrigger asChild>
                  <div className="flex items-center gap-1 cursor-pointer">
                    <Label className="font-bold flex items-center gap-1">标记辅助<HelpCircle size={16} /></Label>
                  </div>
                </PopoverTrigger>
                <PopoverContent>
                  <p className="text-sm">开启标记辅助后，每个格子中的候选数会自动更新</p>
                </PopoverContent>
              </Popover>
              <Switch
                checked={markingAssist}
                onCheckedChange={(checked) => {
                  setMarkingAssist(checked);
                  invoke('set_marking_assist', { markingAssist: checked });
                }}
              />
            </div>
            <div className="flex justify-between items-center">
              <Label className="font-bold">颜色模式</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Label className="flex items-center cursor-pointer">{
                    { "light": "浅色", "dark": "深色", "system": "跟随系统" }[theme]
                  }<ChevronDown size={14}/>
                  </Label>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setTheme("light")}>
                    浅色
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("dark")}>
                    深色
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("system")}>
                    跟随系统
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      <div className="absolute z-[-10] left-[-120px] bottom-[-380px] brightness-75">
        <SudokuBoard board={randomPuzzle} />
      </div>
      <div className="absolute z-[-10] right-[-240px] top-[-320px] brightness-50">
        <SudokuBoard board={randomPuzzle} />
      </div>
    </div>
  );
}
