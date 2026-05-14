"use client";

/**
 * Submit Happens — client game shell.
 *
 * Extension ideas (keep logic here or split into a reducer later):
 * - Power-ups: freeze meter, dismiss-all HR pop-ups, “auto-fill” suggestions.
 * - Streak / scoring: speed bonus, least cards used, daily seed.
 * - Multi-week campaigns: carry over unused hours, PTO cards, etc.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  ActiveReminder,
  DaysState,
  GameStatus,
  TimeEntryCard,
  WeekdayId,
} from "@/types/game";
import {
  HAND_SIZE,
  HR_REMINDER_MESSAGES,
  MAX_HOURS_PER_DAY,
  METER_FILL_SECONDS,
  REMINDER_INTERVAL_MAX_MS,
  REMINDER_INTERVAL_MIN_MS,
  TARGET_HOURS,
  WEEKDAYS,
  pickOvertimeToastLine,
  randomOvertimeMeterBump,
} from "@/lib/gameConstants";
import { generateHand, generateRandomCard } from "@/lib/generateRandomCard";
import { HeaderStats } from "./HeaderStats";
import { TimesheetBoard } from "./TimesheetBoard";
import { CardTray } from "./CardTray";
import { ReminderPopup } from "./ReminderPopup";
import { EndScreen } from "./EndScreen";
import { HowToPlayModal } from "./HowToPlayModal";
import { OvertimeToast } from "./OvertimeToast";

function emptyDays(): DaysState {
  return { mon: [], tue: [], wed: [], thu: [], fri: [] };
}

function totalHoursFromDays(days: DaysState): number {
  return (Object.values(days) as TimeEntryCard[][])
    .flat()
    .reduce((a, c) => a + c.hours, 0);
}

function weekdayLabel(id: WeekdayId): string {
  return WEEKDAYS.find((d) => d.id === id)?.label ?? id;
}

export function GameShell() {
  const [days, setDays] = useState<DaysState>(() => emptyDays());
  /** Empty until client mount so SSR HTML matches hydration (random hand differs per run). */
  const [availableCards, setAvailableCards] = useState<TimeEntryCard[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [reminderMeter, setReminderMeter] = useState(0);
  const [activeReminder, setActiveReminder] = useState<ActiveReminder | null>(null);
  const [gameStatus, setGameStatus] = useState<GameStatus>("playing");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [statusMessage, setStatusMessage] = useState(
    "Select a card, tap a day, then submit when you reach 40 hours.",
  );
  const [overtimeToast, setOvertimeToast] = useState<{
    id: string;
    message: string;
    bumpPercent: number;
  } | null>(null);
  /** False until player dismisses HR briefing — gates meter, elapsed time, and reminder pop-ups. */
  const [runStarted, setRunStarted] = useState(false);

  const lostRef = useRef(false);
  const overtimeBlockingRef = useRef(false);

  const totalHours = useMemo(() => totalHoursFromDays(days), [days]);

  const playing = gameStatus === "playing";
  const timersActive = playing && runStarted;
  const overtimeBlocking = Boolean(overtimeToast) && playing;
  const handReady = availableCards.length === HAND_SIZE;
  const uiDisabled =
    !playing || !runStarted || overtimeBlocking || !handReady;

  useEffect(() => {
    overtimeBlockingRef.current = overtimeBlocking;
  }, [overtimeBlocking]);

  /** Deal opening hand after mount so SSR + first client paint match (random IDs/labels). */
  useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      setAvailableCards((prev) =>
        prev.length === 0 ? generateHand(HAND_SIZE) : prev,
      );
    });
    return () => window.cancelAnimationFrame(id);
  }, []);

  /** HR meter tick — swap for frame-based or difficulty curves later. */
  useEffect(() => {
    if (!timersActive) return;
    const tickMs = 100;
    const perTick = (100 * tickMs) / (METER_FILL_SECONDS * 1000);
    const id = window.setInterval(() => {
      setReminderMeter((m) => {
        const next = Math.min(100, m + perTick);
        if (next >= 100 && !lostRef.current) {
          lostRef.current = true;
          queueMicrotask(() => {
            setOvertimeToast(null);
            setGameStatus("lost");
            setStatusMessage("HR reminder meter reached 100 percent. Game over.");
          });
        }
        return next;
      });
    }, tickMs);
    return () => window.clearInterval(id);
  }, [timersActive]);

  /** Survived time — tie to server validation or leaderboards later. */
  useEffect(() => {
    if (!timersActive) return;
    const id = window.setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [timersActive]);

  /** Staggered HR pop-ups — plug in real notifications or email parody copy later. */
  useEffect(() => {
    if (!timersActive) return;
    let cancelled = false;
    let timeoutId: number | undefined;

    const scheduleNext = () => {
      const delay =
        REMINDER_INTERVAL_MIN_MS +
        Math.random() * (REMINDER_INTERVAL_MAX_MS - REMINDER_INTERVAL_MIN_MS);
      timeoutId = window.setTimeout(() => {
        if (cancelled) return;
        if (overtimeBlockingRef.current) {
          scheduleNext();
          return;
        }
        const msg =
          HR_REMINDER_MESSAGES[
            Math.floor(Math.random() * HR_REMINDER_MESSAGES.length)
          ]!;
        setActiveReminder({
          id:
            typeof crypto !== "undefined" && crypto.randomUUID
              ? crypto.randomUUID()
              : `r-${Date.now()}`,
          message: msg,
        });
        scheduleNext();
      }, delay);
    };

    scheduleNext();
    return () => {
      cancelled = true;
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, [timersActive]);

  const resetGame = useCallback(() => {
    lostRef.current = false;
    setRunStarted(false);
    setDays(emptyDays());
    setAvailableCards(generateHand(HAND_SIZE));
    setSelectedCardId(null);
    setReminderMeter(0);
    setActiveReminder(null);
    setOvertimeToast(null);
    setGameStatus("playing");
    setElapsedSeconds(0);
    setStatusMessage(
      "Select a card, tap a day, then submit when you reach 40 hours.",
    );
  }, []);

  const handleSelectCard = useCallback(
    (id: string) => {
      if (!playing || !runStarted || overtimeToast || !handReady) return;
      setSelectedCardId((prev) => (prev === id ? null : id));
    },
    [handReady, overtimeToast, playing, runStarted],
  );

  const handleTapDay = useCallback(
    (dayId: WeekdayId) => {
      if (
        !playing ||
        !runStarted ||
        overtimeToast ||
        !selectedCardId ||
        !handReady
      )
        return;
      const card = availableCards.find((c) => c.id === selectedCardId);
      if (!card) return;

      const prevDayHours = days[dayId].reduce((a, c) => a + c.hours, 0);
      const nextDayHours = prevDayHours + card.hours;
      const label = weekdayLabel(dayId);
      /** First crossing over the daily cap — extend later (repeat bumps, per-role caps, etc.). */
      const crossedDailyCap =
        nextDayHours > MAX_HOURS_PER_DAY && prevDayHours <= MAX_HOURS_PER_DAY;

      if (crossedDailyCap) {
        const bump = randomOvertimeMeterBump();
        setReminderMeter((m) => {
          const next = Math.min(100, m + bump);
          if (next >= 100 && !lostRef.current) {
            lostRef.current = true;
            queueMicrotask(() => {
              setOvertimeToast(null);
              setGameStatus("lost");
              setStatusMessage(
                "HR reminder meter reached 100 percent. Game over.",
              );
            });
          }
          return next;
        });
        setOvertimeToast({
          id:
            typeof crypto !== "undefined" && crypto.randomUUID
              ? crypto.randomUUID()
              : `ot-${Date.now()}`,
          message: pickOvertimeToastLine(label, nextDayHours),
          bumpPercent: bump,
        });
      }

      setDays((d) => ({
        ...d,
        [dayId]: [...d[dayId], card],
      }));

      setAvailableCards((cards) => {
        const without = cards.filter((c) => c.id !== selectedCardId);
        without.push(generateRandomCard());
        return without;
      });

      setSelectedCardId(null);
      setStatusMessage(
        `Placed ${card.label} (${card.hours}h) on ${label}. Total ${(totalHours + card.hours).toFixed(1)} hours.`,
      );
    },
    [
      availableCards,
      days,
      handReady,
      overtimeToast,
      playing,
      runStarted,
      selectedCardId,
      totalHours,
    ],
  );

  const handleSubmit = useCallback(() => {
    if (!playing || !runStarted || overtimeToast || !handReady) return;
    const total = totalHoursFromDays(days);
    // Expand later: per-day minimums, project codes, manager approval flows, etc.
    if (total >= TARGET_HOURS) {
      setOvertimeToast(null);
      setGameStatus("won");
      setStatusMessage("Timesheet submitted. You win!");
    } else {
      setStatusMessage(
        `You have ${total.toFixed(1)} hours. Reach at least ${TARGET_HOURS} hours, then submit.`,
      );
    }
  }, [days, handReady, overtimeToast, playing, runStarted]);

  const dismissOvertimeToast = useCallback(() => {
    setOvertimeToast(null);
  }, []);

  const dismissReminder = useCallback(() => {
    setActiveReminder(null);
  }, []);

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-linear-to-b from-amber-200/80 via-amber-100 to-sky-100">
      <a
        href={playing && !runStarted ? "#howto-start" : "#game-region"}
        className="sr-only focus:fixed focus:left-3 focus:top-3 focus:z-100 focus:m-0 focus:inline-block focus:h-auto focus:w-auto focus:overflow-visible focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:font-bold focus:text-slate-900 focus:shadow-lg"
      >
        {playing && !runStarted ? "Skip to start button" : "Skip to game"}
      </a>
      <div
        id="game-region"
        className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-3 px-3 py-3 sm:gap-4 sm:px-4 sm:py-4 lg:min-h-0 lg:py-6"
      >
        <div className="flex min-h-0 flex-1 flex-col gap-4 lg:min-h-[calc(100dvh-2.5rem)] lg:justify-center lg:gap-6">
          <div className="shrink-0 text-center">
            <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900 drop-shadow-sm sm:text-4xl lg:text-5xl">
              Submit Happens
            </h1>
            <p className="mt-1 text-xs font-semibold text-slate-700 sm:text-sm lg:text-base">
              Tap cards, fill the week, beat the HR meter.
            </p>
          </div>

          <div
            aria-live="polite"
            aria-atomic="true"
            className="sr-only"
          >
            {statusMessage}
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-3 pb-44 lg:grid lg:max-h-[min(760px,calc(100dvh-7rem))] lg:grid-cols-[minmax(0,1fr)_minmax(17.5rem,22rem)] lg:items-stretch lg:gap-6 lg:pb-0">
            <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto lg:min-h-0 lg:flex-1">
              <HeaderStats totalHours={totalHours} reminderMeter={reminderMeter} />
              <TimesheetBoard
                days={days}
                disabled={uiDisabled}
                onTapDay={handleTapDay}
              />
            <p
              className="rounded-xl border border-slate-200/90 bg-white/95 px-3 py-2.5 text-center text-xs font-medium leading-relaxed text-slate-700 shadow-sm shadow-slate-900/5 sm:text-sm lg:hidden"
              aria-live="polite"
            >
              {statusMessage}
            </p>
            </div>

            <aside className="hidden min-h-0 w-full min-w-0 flex-col gap-4 overflow-y-auto lg:flex lg:max-h-full">
              <CardTray
                placement="sidebar"
                cards={availableCards}
                selectedId={selectedCardId}
                disabled={uiDisabled}
                onSelectCard={handleSelectCard}
              />
            <button
              type="button"
              onClick={handleSubmit}
              disabled={uiDisabled}
              className="w-full rounded-2xl border border-emerald-700/25 bg-linear-to-b from-emerald-300 to-emerald-400 px-4 py-3.5 text-center text-sm font-black uppercase tracking-wide text-emerald-950 shadow-lg shadow-emerald-900/20 transition enabled:hover:-translate-y-0.5 enabled:hover:shadow-xl enabled:hover:shadow-emerald-900/25 enabled:focus-visible:outline-none enabled:focus-visible:ring-2 enabled:focus-visible:ring-emerald-500 enabled:focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Submit Timesheet
            </button>
            <p
              className="rounded-xl border border-slate-200/90 bg-white/95 px-3 py-2.5 text-center text-xs font-medium leading-relaxed text-slate-700 shadow-sm shadow-slate-900/5"
              aria-live="polite"
            >
              {statusMessage}
            </p>
            </aside>
          </div>
        </div>
      </div>

      {/* Mobile sticky tray + submit — refine breakpoints or safe-area here later. */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200/90 bg-white/90 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-16px_50px_-12px_rgba(15,23,42,0.18)] backdrop-blur-md lg:hidden">
        <CardTray
          placement="dock"
          cards={availableCards}
          selectedId={selectedCardId}
          disabled={uiDisabled}
          onSelectCard={handleSelectCard}
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={uiDisabled}
          className="mt-2 w-full rounded-2xl border border-emerald-700/25 bg-linear-to-b from-emerald-300 to-emerald-400 px-4 py-3.5 text-sm font-black uppercase tracking-wide text-emerald-950 shadow-lg shadow-emerald-900/20 transition enabled:active:translate-y-px enabled:focus-visible:outline-none enabled:focus-visible:ring-2 enabled:focus-visible:ring-emerald-500 enabled:focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Submit Timesheet
        </button>
      </div>

      {playing && !runStarted ? (
        <HowToPlayModal
          handReady={handReady}
          onStart={() => setRunStarted(true)}
        />
      ) : null}

      {overtimeToast && playing && runStarted ? (
        <OvertimeToast
          key={overtimeToast.id}
          message={overtimeToast.message}
          bumpPercent={overtimeToast.bumpPercent}
          onDismiss={dismissOvertimeToast}
        />
      ) : null}

      {activeReminder && playing && runStarted ? (
        <ReminderPopup reminder={activeReminder} onDismiss={dismissReminder} />
      ) : null}

      {gameStatus === "won" || gameStatus === "lost" ? (
        <EndScreen
          status={gameStatus}
          totalHours={totalHours}
          survivedSeconds={elapsedSeconds}
          onPlayAgain={resetGame}
        />
      ) : null}
    </div>
  );
}
