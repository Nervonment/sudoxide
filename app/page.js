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
import { SettingsContext } from "@/lib/SettingsContext";
import useSettings from "@/lib/useSettings";
import { cn, difficultyDesc } from "@/lib/utils";
import { getVersion } from "@tauri-apps/api/app";
import { checkUpdate, installUpdate } from "@tauri-apps/api/updater";
import { ChevronDown, HelpCircle, Loader2, Settings2 } from "lucide-react";
import { useTheme } from "next-themes";
import { Poppins } from "next/font/google";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";

export default function Home() {
  const {
    difficulty, setDifficulty,
    markingAssist, setMarkingAssist,
    beginWithMarks, setBeginWithMarks
  } = useContext(SettingsContext);

  const [appVersion, setAppversion] = useState("");
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [updateManifest, setUpdateManifest] = useState({});
  const [updating, setUpdating] = useState(false);
  const [updateFailed, setUpdateFailed] = useState(false);


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
          <div className="absolute right-4 flex items-center gap-2">
            <p className="text-sm text-muted-foreground">设置</p>
            <Button variant="secondary" size="icon">
              <Settings2 />
            </Button>
          </div>
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
                }}
              />
            </div>
            <div className="flex justify-between items-center">
              <Popover>
                <PopoverTrigger asChild>
                  <div className="flex items-center gap-1 cursor-pointer">
                    <Label className="font-bold flex items-center gap-1">开局标记所有候选数<HelpCircle size={16} /></Label>
                  </div>
                </PopoverTrigger>
                <PopoverContent>
                  <p className="text-sm">开启后，开局时会自动标记上所有候选数字</p>
                </PopoverContent>
              </Popover>
              <Switch
                checked={beginWithMarks}
                onCheckedChange={(checked) => {
                  setBeginWithMarks(checked);
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
              <div className="flex items-center h-6 gap-3">
                <Label className="text-muted-foreground">版本：v{appVersion}</Label>
                <Separator orientation="vertical" />
                <Label className="text-muted-foreground hover:underline">
                  <a href="mailto:sudoxide@outlook.com">反馈问题</a>
                </Label>
                <Separator orientation="vertical" />
                <button onClick={() => { window.open("https://github.com/Nervonment/sudoxide"); }}>
                  <svg width={16} height={16} fill="hsl(var(--muted-foreground))" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>View GitHub Repository</title><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>
                </button>
              </div>
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

      <div className="absolute z-[-20] left-[-120px] bottom-[-380px] opacity-75">
        <SudokuGrid grid={randomPuzzle} />
      </div>
      <div className="absolute z-[-20] right-[-240px] top-[-320px] opacity-50">
        <SudokuGrid grid={randomPuzzle} />
      </div>
    </div>
  );
}
