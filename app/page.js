'use client'

const poppins = Poppins({ subsets: ["latin"], weight: ["800"] })

import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn, difficultyDesc } from "@/lib/utils";
import { invoke } from "@tauri-apps/api/tauri";
import { Settings2 } from "lucide-react";
import { Poppins } from "next/font/google";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [difficulty, setDifficulty] = useState(2);

  useEffect(() => {
    invoke('get_difficulty').then((difficulty) => setDifficulty(difficulty));
  }, []);

  return (
    <div className="w-screen h-screen flex flex-col gap-2 items-center justify-center">
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
        </DrawerContent>
      </Drawer>
    </div>
  );
}
