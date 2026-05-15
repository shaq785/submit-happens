"use client";

/**
 * Submit Happens — client game shell.
 *
 * Extension ideas (keep logic here or split into a reducer later):
 * - Power-ups: freeze meter, dismiss-all HR pop-ups, “auto-fill” suggestions.
 * - Streak / scoring: speed bonus, least cards used, daily seed.
 * - Multi-week campaigns: carry over unused hours, PTO cards, etc.
 */

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  pointerWithin,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
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
  randomVagueSubmitMeterPenalty,
} from "@/lib/gameConstants";
import { generateHand, generateRandomCard } from "@/lib/generateRandomCard";
import { isTimesheetTooVague } from "@/lib/timesheetQuality";
import { HeaderStats } from "./HeaderStats";
import { TimesheetBoard } from "./TimesheetBoard";
import { CardTray } from "./CardTray";
import { ReminderPopup } from "./ReminderPopup";
import { EndScreen } from "./EndScreen";
import { HowToPlayModal } from "./HowToPlayModal";
import { OvertimeToast } from "./OvertimeToast";
import { VagueTimesheetModal } from "./VagueTimesheetModal";

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

/** Client position for drag preview — @dnd-kit DragOverlay can mis-place `fixed` under compositing (e.g. backdrop-filter). */
function activatorClientPoint(event: Event): { x: number; y: number } | null {
  if (typeof TouchEvent !== "undefined" && event instanceof TouchEvent) {
    const t = event.touches[0] ?? event.changedTouches[0];
    if (t) return { x: t.clientX, y: t.clientY };
  }
  if ("clientX" in event) {
    const e = event as MouseEvent | PointerEvent;
    if (Number.isFinite(e.clientX) && Number.isFinite(e.clientY)) {
      return { x: e.clientX, y: e.clientY };
    }
  }
  return null;
}

type PlacementRecord = {
  dayId: WeekdayId;
  card: TimeEntryCard;
  meterBumpFromCrossing: number;
};

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
    "Human Resources welcomes you to corrective practice. Pick a card, tap a day, and pretend you have never said ‘I’ll log it later.’",
  );
  const [overtimeToast, setOvertimeToast] = useState<{
    id: string;
    message: string;
    bumpPercent: number;
  } | null>(null);
  const [vagueSubmitModal, setVagueSubmitModal] = useState<{
    penaltyPercent: number;
  } | null>(null);
  /** False until player dismisses HR briefing — gates meter, elapsed time, and reminder pop-ups. */
  const [runStarted, setRunStarted] = useState(false);
  const [placementStack, setPlacementStack] = useState<PlacementRecord[]>([]);
  const [draggingCard, setDraggingCard] = useState<TimeEntryCard | null>(null);

  const handDragPreviewRef = useRef<HTMLDivElement | null>(null);
  const handDragMetricsRef = useRef<{ offsetX: number; offsetY: number } | null>(
    null,
  );
  const draggingHandIdRef = useRef<string | null>(null);
  const handPointerMoveRef = useRef<((e: PointerEvent) => void) | null>(null);
  const handTouchMoveRef = useRef<((e: TouchEvent) => void) | null>(null);

  const clearHandDragPreview = useCallback(() => {
    const pm = handPointerMoveRef.current;
    if (pm) window.removeEventListener("pointermove", pm);
    handPointerMoveRef.current = null;
    const tm = handTouchMoveRef.current;
    if (tm) window.removeEventListener("touchmove", tm);
    handTouchMoveRef.current = null;
    handDragMetricsRef.current = null;
    draggingHandIdRef.current = null;
  }, []);

  useEffect(() => () => clearHandDragPreview(), [clearHandDragPreview]);

  const lostRef = useRef(false);
  const overtimeBlockingRef = useRef(false);
  const placementStackRef = useRef<PlacementRecord[]>([]);
  const daysRef = useRef(days);

  useLayoutEffect(() => {
    daysRef.current = days;
  }, [days]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 12 },
    }),
  );

  const totalHours = useMemo(() => totalHoursFromDays(days), [days]);

  const playing = gameStatus === "playing";
  const timersActive = playing && runStarted;
  const policyModalBlocking =
    Boolean(overtimeToast || vagueSubmitModal) && playing;
  const handReady = availableCards.length === HAND_SIZE;
  const canUndo =
    placementStack.length > 0 &&
    playing &&
    runStarted &&
    !policyModalBlocking &&
    handReady;
  const uiDisabled =
    !playing || !runStarted || policyModalBlocking || !handReady;

  useEffect(() => {
    overtimeBlockingRef.current = policyModalBlocking;
  }, [policyModalBlocking]);

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
            setVagueSubmitModal(null);
            setGameStatus("lost");
            setStatusMessage(
              "HR patience meter hit 100%. You ran out of runway for late entries. Game over.",
            );
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
    setVagueSubmitModal(null);
    setGameStatus("playing");
    setElapsedSeconds(0);
    placementStackRef.current = [];
    setPlacementStack([]);
    clearHandDragPreview();
    setDraggingCard(null);
    setStatusMessage(
      "Human Resources welcomes you to corrective practice. Pick a card, tap a day, and pretend you have never said ‘I’ll log it later.’",
    );
  }, [clearHandDragPreview]);

  const handleSelectCard = useCallback(
    (id: string) => {
      if (!playing || !runStarted || policyModalBlocking || !handReady) return;
      setSelectedCardId((prev) => (prev === id ? null : id));
    },
    [handReady, policyModalBlocking, playing, runStarted],
  );

  const placeCardOnDay = useCallback(
    (dayId: WeekdayId, cardId: string) => {
      if (
        !playing ||
        !runStarted ||
        policyModalBlocking ||
        !handReady
      ) {
        return;
      }
      const card = availableCards.find((c) => c.id === cardId);
      if (!card) return;

      const prevDayHours = days[dayId].reduce((a, c) => a + c.hours, 0);
      const nextDayHours = prevDayHours + card.hours;
      const label = weekdayLabel(dayId);
      const crossedDailyCap =
        nextDayHours > MAX_HOURS_PER_DAY && prevDayHours <= MAX_HOURS_PER_DAY;

      let meterBumpFromCrossing = 0;
      if (crossedDailyCap) {
        const bump = randomOvertimeMeterBump();
        meterBumpFromCrossing = bump;
        setReminderMeter((m) => {
          const next = Math.min(100, m + bump);
          if (next >= 100 && !lostRef.current) {
            lostRef.current = true;
            queueMicrotask(() => {
              setOvertimeToast(null);
              setVagueSubmitModal(null);
              setGameStatus("lost");
              setStatusMessage(
                "HR patience meter hit 100%. You ran out of runway for late entries. Game over.",
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
        const without = cards.filter((c) => c.id !== cardId);
        without.push(generateRandomCard());
        return without;
      });

      setPlacementStack((s) => {
        const next = [...s, { dayId, card, meterBumpFromCrossing }];
        placementStackRef.current = next;
        return next;
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
      policyModalBlocking,
      playing,
      runStarted,
      totalHours,
    ],
  );

  const handleTapDay = useCallback(
    (dayId: WeekdayId) => {
      if (!selectedCardId) return;
      placeCardOnDay(dayId, selectedCardId);
    },
    [placeCardOnDay, selectedCardId],
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const card = event.active.data.current?.card as TimeEntryCard | undefined;
      setDraggingCard(card ?? null);
      clearHandDragPreview();
      const id = card?.id;
      if (!id) return;

      draggingHandIdRef.current = id;

      const applyPosition = (clientX: number, clientY: number) => {
        const node = handDragPreviewRef.current;
        if (!node) return;

        let metrics = handDragMetricsRef.current;
        if (!metrics) {
          const el = document.querySelector(
            `[data-sh-hand-card="${CSS.escape(id)}"]`,
          );
          if (!el) return;
          const r = el.getBoundingClientRect();
          metrics = { offsetX: clientX - r.left, offsetY: clientY - r.top };
          handDragMetricsRef.current = metrics;
        }

        node.style.transform = `translate3d(${clientX - metrics.offsetX}px, ${clientY - metrics.offsetY}px, 0)`;
      };

      const onPointerMove = (e: PointerEvent) => {
        applyPosition(e.clientX, e.clientY);
      };

      const onTouchMove = (e: TouchEvent) => {
        const t = e.touches[0];
        if (t) applyPosition(t.clientX, t.clientY);
      };

      handPointerMoveRef.current = onPointerMove;
      handTouchMoveRef.current = onTouchMove;
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("touchmove", onTouchMove, { passive: true });

      const pt = activatorClientPoint(event.activatorEvent);
      if (pt) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => applyPosition(pt.x, pt.y));
        });
      }
    },
    [clearHandDragPreview],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      clearHandDragPreview();
      setDraggingCard(null);
      const { active, over } = event;
      if (!over || !active) return;
      const dayId = over.data.current?.dayId as WeekdayId | undefined;
      if (!dayId || !WEEKDAYS.some((w) => w.id === dayId)) return;
      const cardId = String(active.id);
      placeCardOnDay(dayId, cardId);
    },
    [clearHandDragPreview, placeCardOnDay],
  );

  const handleUndo = useCallback(() => {
    if (!playing || !runStarted || policyModalBlocking || !handReady) return;
    const stack = placementStackRef.current;
    if (stack.length === 0) return;
    const last = stack.at(-1)!;
    const d = daysRef.current;
    const arr = d[last.dayId];
    if (arr.length === 0 || arr[arr.length - 1]!.id !== last.card.id) return;

    const next = stack.slice(0, -1);
    placementStackRef.current = next;
    setPlacementStack(next);

    setDays({ ...d, [last.dayId]: arr.slice(0, -1) });
    setAvailableCards((cards) => {
      if (cards.length === 0) return cards;
      return [...cards.slice(0, -1), last.card];
    });
    if (last.meterBumpFromCrossing > 0) {
      setReminderMeter((m) => Math.max(0, m - last.meterBumpFromCrossing));
      setOvertimeToast(null);
    }
    setSelectedCardId(null);
    setStatusMessage("Undo — last move rewound. Take another shot.");
  }, [handReady, policyModalBlocking, playing, runStarted]);

  const dismissVagueSubmit = useCallback((penaltyPercent: number) => {
    setVagueSubmitModal(null);
    setReminderMeter((m) => {
      const next = Math.min(100, m + penaltyPercent);
      if (next >= 100 && !lostRef.current) {
        lostRef.current = true;
        queueMicrotask(() => {
          setOvertimeToast(null);
          setVagueSubmitModal(null);
          setGameStatus("lost");
          setStatusMessage(
            "HR patience meter hit 100%. You ran out of runway for late entries. Game over.",
          );
        });
      }
      return next;
    });
    setStatusMessage(
      `Human Resources added +${penaltyPercent}% to the patience meter for a lazy task mix. Log at least three different task types across the week, then submit again like someone who reads email from HR.`,
    );
  }, []);

  const handleSubmit = useCallback(() => {
    if (!playing || !runStarted || policyModalBlocking || !handReady) return;
    const total = totalHoursFromDays(days);
    // Expand later: per-day minimums, project codes, manager approval flows, etc.
    if (total >= TARGET_HOURS) {
      if (isTimesheetTooVague(days)) {
        setVagueSubmitModal({
          penaltyPercent: randomVagueSubmitMeterPenalty(),
        });
        return;
      }
      setOvertimeToast(null);
      setVagueSubmitModal(null);
      setGameStatus("won");
      setStatusMessage(
        "Timesheet submitted. HR will pretend this never happened to your permanent record (for now).",
      );
    } else {
      setStatusMessage(
        `Only ${total.toFixed(1)} hours logged. Human Resources expects ${TARGET_HOURS}+ before we pretend you understand deadlines.`,
      );
    }
  }, [days, handReady, policyModalBlocking, playing, runStarted]);

  const dismissOvertimeToast = useCallback(() => {
    setOvertimeToast(null);
  }, []);

  const dismissReminder = useCallback(() => {
    setActiveReminder(null);
  }, []);

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-linear-to-b from-slate-100 via-white to-sky-50/40">
      <a
        href={playing && !runStarted ? "#howto-start" : "#game-region"}
        className="sr-only focus:fixed focus:left-3 focus:top-3 focus:z-100 focus:m-0 focus:inline-block focus:h-auto focus:w-auto focus:overflow-visible focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:font-bold focus:text-slate-900 focus:shadow-lg"
      >
        {playing && !runStarted ? "Skip to start button" : "Skip to game"}
      </a>
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => {
          clearHandDragPreview();
          setDraggingCard(null);
        }}
      >
      <div
        id="game-region"
        className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 px-4 py-4 sm:gap-5 sm:px-5 sm:py-5 lg:min-h-0 lg:py-8"
      >
        <div className="flex min-h-0 flex-1 flex-col gap-5 lg:min-h-[calc(100dvh-2.5rem)] lg:justify-center lg:gap-8">
          <div className="shrink-0 text-center">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              Submit Happens
            </h1>
            <p className="mx-auto mt-2 max-w-lg text-pretty text-sm leading-relaxed text-slate-600 sm:text-base">
              Human Resources put you in time-entry boot camp. Undo mistakes, share
              your recap, and beat the patience meter before it runs out faster than
              your excuses.
            </p>
          </div>

          <div
            aria-live="polite"
            aria-atomic="true"
            className="sr-only"
          >
            {statusMessage}
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-4 pb-40 lg:grid lg:max-h-[min(720px,calc(100dvh-6rem))] lg:grid-cols-[minmax(0,1fr)_minmax(16rem,20rem)] lg:items-stretch lg:gap-6 lg:pb-0">
            <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto lg:min-h-0 lg:flex-1">
              <HeaderStats totalHours={totalHours} reminderMeter={reminderMeter} />
              <TimesheetBoard
                days={days}
                disabled={uiDisabled}
                canUndo={canUndo}
                onUndo={handleUndo}
                onTapDay={handleTapDay}
              />
            <p
              className="rounded-xl bg-white/70 px-3 py-2.5 text-center text-sm leading-relaxed text-slate-600 ring-1 ring-slate-900/5 backdrop-blur-sm sm:px-4 lg:hidden"
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
              className="w-full rounded-xl bg-emerald-600 px-4 py-3.5 text-center text-sm font-semibold text-white shadow-sm shadow-emerald-900/10 transition enabled:hover:bg-emerald-500 enabled:focus-visible:outline-none enabled:focus-visible:ring-2 enabled:focus-visible:ring-emerald-500/60 enabled:focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Submit timesheet
            </button>
            <p
              className="rounded-xl bg-white/70 px-3 py-2.5 text-center text-sm leading-relaxed text-slate-600 ring-1 ring-slate-900/5 backdrop-blur-sm"
              aria-live="polite"
            >
              {statusMessage}
            </p>
            </aside>
          </div>
        </div>
      </div>

      {/* Mobile sticky tray + submit — refine breakpoints or safe-area here later. */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200/60 bg-white/85 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_24px_-8px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:hidden">
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
          className="mt-3 w-full rounded-xl bg-emerald-600 px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition enabled:active:scale-[0.99] enabled:hover:bg-emerald-500 enabled:focus-visible:outline-none enabled:focus-visible:ring-2 enabled:focus-visible:ring-emerald-500/60 enabled:focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Submit timesheet
        </button>
      </div>

      {typeof document !== "undefined" && draggingCard
        ? createPortal(
            <div
              ref={handDragPreviewRef}
              className="pointer-events-none fixed left-0 top-0 z-[10000] w-max max-w-[min(220px,calc(100vw-1.5rem))] cursor-grabbing will-change-transform"
              style={{
                transform: "translate3d(-9999px, -9999px, 0)",
              }}
            >
              <div className="flex flex-col gap-1 rounded-xl border border-slate-200/90 bg-white px-3 py-2.5 shadow-2xl shadow-slate-900/25 ring-2 ring-emerald-400/40">
                <span className="text-sm font-medium leading-snug text-slate-800">
                  {draggingCard.label}
                </span>
                <span className="font-mono text-xs font-semibold tabular-nums text-slate-600">
                  {draggingCard.hours}h
                </span>
              </div>
            </div>,
            document.body,
          )
        : null}

      </DndContext>

      {playing && !runStarted ? (
        <HowToPlayModal
          handReady={handReady}
          onStart={() => setRunStarted(true)}
        />
      ) : null}

      {vagueSubmitModal && playing && runStarted ? (
        <VagueTimesheetModal
          penaltyPercent={vagueSubmitModal.penaltyPercent}
          onDismiss={() =>
            dismissVagueSubmit(vagueSubmitModal.penaltyPercent)
          }
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
