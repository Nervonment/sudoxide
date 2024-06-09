'use client'

const poppins = Poppins({ subsets: ["latin"], weight: ["800"] })

import SudokuGrid from "@/components/sudoku_grid";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { cn, difficultyDesc } from "@/lib/utils";
import { getVersion } from "@tauri-apps/api/app";
import { invoke } from "@tauri-apps/api/tauri";
import { checkUpdate, installUpdate } from "@tauri-apps/api/updater";
import { ChevronDown, HelpCircle, Loader2, Settings2 } from "lucide-react";
import { useTheme } from "next-themes";
import { Poppins } from "next/font/google";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [difficulty, setDifficulty] = useState(2);
  const [markingAssist, setMarkingAssist] = useState(false);
  const [appVersion, setAppversion] = useState("");
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [updateManifest, setUpdateManifest] = useState({});
  const [updating, setUpdating] = useState(false);
  const [updateFailed, setUpdateFailed] = useState(false);

  useEffect(() => {
    invoke('get_difficulty').then((difficulty) => setDifficulty(difficulty));
    invoke('get_marking_assist').then((markingAssist) => setMarkingAssist(markingAssist));
  }, []);

  useEffect(() => {
    getVersion().then(setAppversion);
    checkUpdate().then(({ shouldUpdate, manifest }) => {
      if (shouldUpdate) {
        setUpdateManifest(manifest);
        setUpdateDialogOpen(true);
      }
    })
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
            <div className="font-bold text-lg">
              设置
            </div>
            <Separator />
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
                  <p className="text-sm">开启标记辅助后，开局时会标记上所有的候选数字</p>
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
                  }<ChevronDown size={14} />
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
            <div className="flex-1 flex justify-center items-end">
              <Label className="text-muted-foreground">版本：v{appVersion}</Label>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      <AlertDialog
        defaultOpen={false}
        open={updateDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              版本更新
            </AlertDialogTitle>
            {updateManifest ?
              <AlertDialogDescription>
                <p>发现新版本v{updateManifest.version}。更新内容：</p>
                <br />
                <p>{updateManifest.body}</p>
                <br />
                <p>是否立即更新？</p>
                {
                  updateFailed ?
                    <>
                      <br />
                      <p className="text-destructive">
                        更新失败，请前往
                        <button
                          className="underline bg-none border-none"
                          onClick={() => window.open("https://github.com/Nervonment/sudoxide/releases")}
                        >
                          发布页面
                        </button>
                        手动下载更新。
                      </p>
                    </>
                    : <></>
                }
              </AlertDialogDescription> : <></>
            }
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setUpdateDialogOpen(false);
                setUpdateFailed(false);
                setUpdating(false);
              }}
            >
              稍后再说
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={updating}
              className="flex items-center"
              onClick={() => {
                setUpdating(true);
                installUpdate()
                  .catch(() => {
                    setUpdateFailed(true);
                  });
              }}
            >
              {
                updating ?
                  <>更新中<Loader2 size={14} className="turn" /> </> : <>立即更新</>
              }
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="absolute z-[-10] left-[-120px] bottom-[-380px] brightness-75">
        <SudokuGrid grid={randomPuzzle} />
      </div>
      <div className="absolute z-[-10] right-[-240px] top-[-320px] brightness-50">
        <SudokuGrid grid={randomPuzzle} />
      </div>
    </div>
  );
}
