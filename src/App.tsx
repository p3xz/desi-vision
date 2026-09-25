import { useState } from "react";
import Footer from "./components/Footer";
import GameOverScreen from "./components/GameOverScreen";
import GameScreen from "./components/GameScreen";
import { CreditsPage, PrivacyPage, TermsPage } from "./components/Legal";
import PermissionNotice from "./components/PermissionNotice";
import StartScreen from "./components/StartScreen";
import type { GameMode, GameStats, Screen } from "./game/types";

export default function App() {
  const [screen, setScreen] = useState<Screen>("start");
  const [mode, setMode] = useState<GameMode>("quick");
  const [stats, setStats] = useState<GameStats | null>(null);

  const goHome = () => setScreen("start");

  return (
    <div className="flex min-h-full flex-col bg-ink text-bone">
      <main className="flex-1">
        {screen === "start" && (
          <StartScreen
            onStart={(m) => {
              setMode(m);
              setScreen("permission");
            }}
            onNavigate={setScreen}
          />
        )}

        {screen === "permission" && (
          <PermissionNotice
            onAllow={() => setScreen("game")}
            onCancel={goHome}
            onNavigate={setScreen}
          />
        )}

        {screen === "game" && (
          <GameScreen
            key={mode}
            mode={mode}
            onExit={goHome}
            onGameOver={(s) => {
              setStats(s);
              setScreen("gameover");
            }}
          />
        )}

        {screen === "gameover" && stats && (
          <GameOverScreen
            stats={stats}
            onRestart={() => setScreen("game")}
            onHome={goHome}
          />
        )}

        {screen === "privacy" && <PrivacyPage onBack={goHome} />}
        {screen === "terms" && <TermsPage onBack={goHome} />}
        {screen === "credits" && <CreditsPage onBack={goHome} />}
      </main>

      {screen !== "game" && <Footer onNavigate={setScreen} />}
    </div>
  );
}
