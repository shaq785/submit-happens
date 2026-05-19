import { GameShell } from "@/components/game/GameShell";

export default function Home() {
  return (
    <main className="flex min-h-dvh min-w-0 flex-1 flex-col overflow-x-hidden lg:h-dvh lg:max-h-dvh lg:overflow-hidden">
      <GameShell />
    </main>
  );
}
