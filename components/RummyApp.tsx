
"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Minus } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import type { Player } from "@/lib/types";
import { useGameStore } from "@/store/gameStore";
import {
  DEFAULT_NAMES,
  PLAYER_COLORS,
  activeRounds,
  haptic,
  leader,
  signed,
  starterFor,
  totals
} from "@/lib/utils";

const spring = { type: "spring", stiffness: 430, damping: 36, mass: 0.85 } as const;

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function RummyApp() {
  const {
    game,
    history,
    closedBy,
    syncStatus,
    createGame,
    toggleStarter,
    setClosedBy,
    addRound,
    addPenalty,
    undo,
    editRound,
    resetGame,
    rematch,
    newSetup,
    saveCloud,
    loadCloud
  } = useGameStore();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [playerCount, setPlayerCount] = useState(2);
  const [target, setTarget] = useState<number | "custom">(500);
  const [customTarget, setCustomTarget] = useState("");
  const [gameName, setGameName] = useState("");
  const [names, setNames] = useState(DEFAULT_NAMES);
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [dragStart, setDragStart] = useState<{ x: number; y: number; id: string } | null>(null);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const rounds = useMemo(() => activeRounds(game.rounds), [game.rounds]);
  const scoreTotals = useMemo(() => totals(game), [game]);
  const currentLeader = useMemo(() => leader(game), [game]);
  const winner = game.players.find((player) => player.id === game.winnerId);

  function createNewGame() {
    const players: Player[] = names.slice(0, playerCount).map((name, index) => ({
      id: `p${index + 1}`,
      name: name.trim() || DEFAULT_NAMES[index],
      color: PLAYER_COLORS[index]
    }));

    createGame({
      name: gameName.trim() || `Game ${new Date().toLocaleDateString()}`,
      players,
      targetScore: target === "custom" ? Number(customTarget || 500) : target
    });

    setInputs({});
    setSheetOpen(false);
    haptic([8, 18, 8]);
  }

  function submitRound() {
    if (!game.gameId) {
      setSheetOpen(true);
      return;
    }

    const scores: Record<string, number> = {};
    game.players.forEach((player) => {
      scores[player.id] = Number(String(inputs[player.id] || "0").replace(",", ".")) || 0;
    });

    addRound(scores);
    setInputs({});
    haptic([8, 18, 8]);
  }

  function quick(playerId: string, amount: number) {
    setInputs((previous) => ({
      ...previous,
      [playerId]: String((Number(previous[playerId] || 0) || 0) + amount)
    }));
    haptic(8);
  }

  function negative(playerId: string) {
    setInputs((previous) => {
      const value = String(previous[playerId] || "0");
      return {
        ...previous,
        [playerId]: value.startsWith("-") ? value.slice(1) : `-${value || "0"}`
      };
    });
  }

  function handleHoldEdit(roundId: string) {
    const scores = editRound(roundId);
    if (!scores) return;

    const nextInputs: Record<string, string> = {};
    Object.entries(scores).forEach(([id, value]) => {
      nextInputs[id] = String(value);
    });

    setInputs(nextInputs);
    haptic([10, 24, 10]);
  }

  function openGameSheetFromSettings() {
    setSettingsOpen(false);
    setSheetOpen(true);
  }

  async function saveFromSettings() {
    await saveCloud();
    setSettingsOpen(false);
  }

  return (
    <main className="relative h-[100dvh] overflow-hidden bg-black">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage: "url('/bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
      />
      

      <div className="relative z-10 flex h-[100dvh] flex-col overflow-hidden px-3 pb-[calc(var(--dock-h)+var(--safe-bottom)+8px)] pt-[calc(9px+var(--safe-top))]">
        <header className="mb-2.5 grid grid-cols-2 items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.976 }}
            transition={spring}
            onClick={toggleStarter}
            className="glass-soft h-[36px] truncate rounded-full px-3 text-[11px] font-[720] tracking-[-.01em]"
          >
            Starter: {game.players.find((player) => player.id === game.starterId)?.name ?? "You"}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.976 }}
            transition={spring}
            onClick={() => setSettingsOpen(true)}
            className="glass-soft h-[36px] truncate rounded-full px-3 text-[11px] font-[720] tracking-[-.01em]"
          >
            {game.gameId ? `${game.gameName} · ${game.targetScore}` : "No game"}
          </motion.button>
        </header>

        <section className="glass mb-2 rounded-[24px] p-2">
          <div className="mb-2 text-center">
            <div className="type-label">Scoreboard</div>
          </div>

          <div className="grid gap-2">
            {game.players.map((player) => {
              const total = scoreTotals[player.id] ?? 0;
              const progress = Math.max(0, Math.min(100, Math.round((total / game.targetScore) * 100)));
              const isLead = currentLeader?.id === player.id;

              return (
                <motion.div
                  key={player.id}
                  layout
                  transition={spring}
                  className={cx(
                    "relative grid min-h-[46px] grid-cols-[38px_1fr_auto] items-center gap-3 rounded-[18px] border px-3",
                    isLead ? "border-emerald-300/25 bg-emerald-200/[.045]" : "border-white/[.045] bg-white/[.020]"
                  )}
                >
                  <div
                    className="grid h-[30px] w-[30px] place-items-center rounded-full border-[3px] text-[8.5px] font-[760]"
                    style={{ borderColor: `${player.color}92` }}
                  >
                    {progress}%
                  </div>

                  <div className="min-w-0">
                    <div className="truncate text-[13.5px] font-[650] leading-none tracking-[-.025em] text-white/80">
                      {player.name}
                    </div>
                    <div className="mt-2 h-[4px] w-full max-w-[118px] overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: player.color }}
                        animate={{ width: `${progress}%` }}
                        transition={spring}
                      />
                    </div>
                  </div>

                  <motion.div
                    key={total}
                    initial={{ y: 6, scale: 0.94, opacity: 0.55 }}
                    animate={{ y: 0, scale: 1, opacity: 1 }}
                    transition={spring}
                    className="text-[28px] font-[760] leading-none tracking-[-.08em]"
                  >
                    {total}
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </section>

        <section className="flex min-h-0 flex-1 flex-col">

          <div className="glass no-scrollbar min-h-0 flex-1 overflow-auto rounded-[26px] p-2">
            <AnimatePresence initial={false}>
              {!rounds.length ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex h-[58px] flex-col justify-center rounded-[20px] border border-white/[.04] bg-white/[.020] px-4"
                >
                  <strong className="text-[15.5px] font-[680] tracking-[-.025em] text-white/78">
                    No rounds yet
                  </strong>
                  <small className="mt-1 text-[10.5px] font-medium text-white/42">
                    Add scores, then tap Add round.
                  </small>
                </motion.div>
              ) : (
                rounds.map((round, index) => {
                  const maxScore = Math.max(...game.players.map((player) => Number(round.scores[player.id] ?? 0)));
                  const winners = game.players.filter(
                    (player) => Number(round.scores[player.id] ?? 0) === maxScore && maxScore !== 0
                  );

                  return (
                    <motion.div
                      key={round.id}
                      layout
                      initial={{ opacity: 0, y: 8, scale: 0.985 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -24, scale: 0.97 }}
                      transition={spring}
                      onPointerDown={(event) => {
                        setDragStart({ x: event.clientX, y: event.clientY, id: round.id });
                        holdTimer.current = setTimeout(() => handleHoldEdit(round.id), 520);
                      }}
                      onPointerMove={(event) => {
                        if (holdTimer.current) clearTimeout(holdTimer.current);
                        if (!dragStart || dragStart.id !== round.id) return;

                        const dx = event.clientX - dragStart.x;
                        const dy = event.clientY - dragStart.y;

                        if (Math.abs(dx) > 90 && Math.abs(dx) > Math.abs(dy)) {
                          undo();
                          setDragStart(null);
                        }
                      }}
                      onPointerUp={() => {
                        if (holdTimer.current) clearTimeout(holdTimer.current);
                        setDragStart(null);
                      }}
                      className="mb-1.5 grid grid-cols-[32px_1fr] rounded-[20px] border border-white/[.042] bg-white/[.020] px-2.5 py-2 last:mb-0 active:bg-white/[.035]"
                    >
                      <div className="grid h-[25px] w-[25px] place-items-center rounded-full border border-white/15 bg-white/[.030] text-[10px] font-black">
                        {index + 1}
                      </div>

                      <div className="min-w-0">
                        <div
                          className="grid gap-2"
                          style={{ gridTemplateColumns: `repeat(${game.players.length}, minmax(0,1fr))` }}
                        >
                          {game.players.map((player) => {
                            const score = Number(round.scores[player.id] ?? 0);
                            const win = winners.length === 1 && winners[0].id === player.id;

                            return (
                              <div key={player.id} className="text-center">
                                <div className="truncate text-[9px] font-[820]" style={{ color: player.color }}>
                                  {player.name}
                                </div>
                                <div
                                  className={cx("mt-0.5 text-[14px] font-[760]", win && "scale-105")}
                                  style={win ? { color: player.color, textShadow: "0 0 14px currentColor" } : undefined}
                                >
                                  {signed(score)}
                                </div>
                                {round.closedBy === player.id && (
                                  <div className="mx-auto mt-0.5 inline-flex rounded-full border border-emerald-300/20 bg-emerald-300/10 px-1.5 py-0.5 text-[7.5px] font-black uppercase tracking-[.03em] text-emerald-200">
                                    +15
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        <div className="mt-1.5 text-[8.5px] font-medium text-white/34">
                          Starter: {starterFor(game, index).name}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </section>
      </div>

      <section className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[calc(10px+var(--safe-bottom))]">
        <div className="glass rounded-[28px] px-2.5 py-2.5 shadow-[0_-20px_60px_rgba(0,0,0,.18)]">
          <div className="grid gap-2">
            {game.players.map((player) => (
              <div key={player.id} className="rounded-[15px] bg-white/[.010] px-2.5 py-2">
                <div className="grid grid-cols-[56px_1fr_34px] items-center gap-2.5">
                  <div className="truncate text-[11px] font-[650] text-white/66">{player.name}</div>
                  <div className="grid grid-cols-[30px_1fr] items-center gap-2.5">
                    <button
                      onClick={() => negative(player.id)}
                      className="grid h-[30px] w-[30px] place-items-center rounded-[10px] bg-white/[.05]"
                    >
                      <Minus size={14} />
                    </button>
                    <input
                      value={inputs[player.id] ?? ""}
                      onChange={(event) =>
                        setInputs((previous) => ({
                          ...previous,
                          [player.id]: event.target.value
                        }))
                      }
                      inputMode="decimal"
                      placeholder="0"
                      className="w-full bg-transparent text-center text-[21px] font-[820] tracking-[-.04em] text-white outline-none placeholder:text-white/24"
                    />
                  </div>
                  <button
                    onClick={() => setClosedBy(player.id)}
                    className={cx(
                      "grid h-[30px] w-[30px] place-items-center rounded-[10px]",
                      closedBy === player.id ? "bg-emerald-300 text-black" : "bg-white/[.05]"
                    )}
                  >
                    <Check size={14} />
                  </button>
                </div>

                <div className="mt-1.5 grid grid-cols-4 gap-[6px]">
                  {[5, 10, 25, 50].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => quick(player.id, amount)}
                      className="h-[24px] rounded-full bg-white/[.020] text-[10px] font-[640] text-white/70"
                    >
                      +{amount}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-2 grid gap-1.5" style={{ gridTemplateColumns: `repeat(${game.players.length}, minmax(0,1fr))` }}>
            {game.players.map((player) => (
              <button
                key={player.id}
                onClick={() => addPenalty(player.id)}
                className="h-[34px] rounded-full bg-red-400/[.10] px-3 text-[10.5px] font-[660] text-red-100/72"
              >
                -50 {player.name}
              </button>
            ))}
          </div>

          <button
            onClick={submitRound}
            className="glass-soft mt-2 flex h-[48px] w-full items-center justify-center rounded-[22px] text-[15.5px] font-[700] tracking-[-.025em] text-white/90"
          >
            Add round
          </button>
        </div>
      </section>

      <AnimatePresence>
        {settingsOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/35"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSettingsOpen(false)}
            />
            <motion.section
              initial={{ y: 20, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.98 }}
              transition={spring}
              className="glass fixed left-4 right-4 top-[calc(var(--safe-top)+54px)] z-50 rounded-[26px] p-3"
            >
              <div className="mb-3 text-center">
                <div className="type-label">Controls</div>
                <div className="type-sub mt-1">{syncStatus}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => { undo(); setSettingsOpen(false); }} className="glass-soft h-11 rounded-[16px] text-[12px] font-[700]">
                  Undo
                </button>
                <button onClick={openGameSheetFromSettings} className="glass-soft h-11 rounded-[16px] text-[12px] font-[700]">
                  Game
                </button>
                <button onClick={saveFromSettings} className="glass-soft h-11 rounded-[16px] text-[12px] font-[700] text-emerald-100/80">
                  Save
                </button>
                <button onClick={() => { resetGame(); setSettingsOpen(false); }} className="glass-soft h-11 rounded-[16px] text-[12px] font-[700] text-red-100/80">
                  Reset
                </button>
              </div>
            </motion.section>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {sheetOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/45"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSheetOpen(false)}
            />
            <motion.section
              initial={{ y: 42, opacity: 0, filter: "blur(6px)" }}
              animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
              exit={{ y: 42, opacity: 0, filter: "blur(6px)" }}
              transition={spring}
              className="fixed bottom-2.5 left-2.5 right-2.5 z-50 max-h-[86dvh] overflow-auto rounded-[32px] border border-white/16 bg-neutral-950/76 p-3 backdrop-blur-3xl"
            >
              <div className="mx-auto mb-2.5 h-1 w-10 rounded-full bg-white/20" />
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-[18px] font-[820] tracking-[-.045em]">Game</h2>
                  <p className="type-sub mt-1">Create, sync, or review history</p>
                </div>
                <button onClick={() => setSheetOpen(false)} className="rounded-2xl bg-white/10 px-3 py-2 text-xs font-black">
                  Done
                </button>
              </div>

              <div className="mt-3 grid gap-2 rounded-[24px] border border-white/10 bg-white/[.030] p-2.5">
                <input
                  value={gameName}
                  onChange={(event) => setGameName(event.target.value)}
                  placeholder="Game name"
                  className="h-9 rounded-[13px] bg-white/10 px-3 text-white outline-none placeholder:text-white/38"
                />

                <div className="type-label">Target score</div>
                <div className="grid grid-cols-5 gap-1 rounded-[15px] bg-black/20 p-1">
                  {[500, 1000, 1500, 2000, "custom"].map((value) => (
                    <button
                      key={value}
                      onClick={() => setTarget(value as number | "custom")}
                      className={cx(
                        "h-8 rounded-xl text-[10px] font-black",
                        target === value ? "bg-white text-black" : "text-white/68"
                      )}
                    >
                      {value === "custom" ? "Custom" : value}
                    </button>
                  ))}
                </div>

                {target === "custom" && (
                  <input
                    value={customTarget}
                    onChange={(event) => setCustomTarget(event.target.value)}
                    inputMode="numeric"
                    placeholder="Custom score"
                    className="h-9 rounded-[13px] bg-white/10 px-3 text-white outline-none placeholder:text-white/38"
                  />
                )}

                <div className="type-label">Players</div>
                <div className="grid grid-cols-3 gap-1 rounded-[15px] bg-black/20 p-1">
                  {[2, 3, 4].map((value) => (
                    <button
                      key={value}
                      onClick={() => setPlayerCount(value)}
                      className={cx(
                        "h-8 rounded-xl text-[10px] font-black",
                        playerCount === value ? "bg-white text-black" : "text-white/68"
                      )}
                    >
                      {value}
                    </button>
                  ))}
                </div>

                {Array.from({ length: playerCount }, (_, index) => (
                  <input
                    key={index}
                    value={names[index] ?? ""}
                    onChange={(event) =>
                      setNames((previous) =>
                        previous.map((name, nameIndex) => (nameIndex === index ? event.target.value : name))
                      )
                    }
                    placeholder={DEFAULT_NAMES[index]}
                    className="h-9 rounded-[13px] bg-white/10 px-3 text-white outline-none placeholder:text-white/38"
                  />
                ))}

                <button onClick={createNewGame} className="h-10 rounded-[15px] bg-white font-black text-black">
                  Create game
                </button>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-2">
                <button onClick={loadCloud} className="h-9 rounded-2xl bg-white/10 text-xs font-black">Load cloud</button>
                <button onClick={saveCloud} className="h-9 rounded-2xl bg-white/10 text-xs font-black">Save cloud</button>
              </div>

              <div className="mt-3 rounded-[20px] border border-white/10 bg-white/[.04] p-2.5">
                <div className="type-label">Recent games</div>
                <div className="mt-2 grid gap-1.5">
                  {!history.length ? (
                    <div className="rounded-2xl bg-white/[.05] p-2 text-xs text-white/60">No finished games yet</div>
                  ) : (
                    history.slice(0, 6).map((item) => (
                      <div key={item.gameId} className="grid grid-cols-[1fr_auto] rounded-2xl bg-white/[.05] p-2 text-xs">
                        <div>
                          <b>{item.gameName}</b>
                          <span className="mt-0.5 block text-white/50">
                            {item.winnerName} won · {item.rounds} rounds
                          </span>
                        </div>
                        <div>{new Date(item.finishedAt).toLocaleDateString()}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.section>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {game.status === "finished" && winner && (
          <motion.div
            className="fixed inset-0 z-[80] grid place-items-center bg-black/65 p-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.92, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              transition={spring}
              className="glass w-full max-w-[420px] rounded-[30px] p-6 text-center"
            >
              <div className="type-label">Winner</div>
              <h1 className="my-2 text-4xl font-black tracking-[-.07em]">{winner.name}</h1>
              <div className="mt-4 grid gap-1.5">
                {game.players.map((player) => (
                  <div key={player.id} className="flex justify-between rounded-2xl border border-white/10 bg-white/[.055] px-3 py-2">
                    <span>{player.name}</span>
                    <b>{scoreTotals[player.id] ?? 0}</b>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button onClick={rematch} className="h-10 rounded-2xl bg-white font-black text-black">Rematch</button>
                <button
                  onClick={() => {
                    newSetup();
                    setSheetOpen(true);
                  }}
                  className="h-10 rounded-2xl bg-white/10 font-black"
                >
                  New game
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
</main>
  );
}
