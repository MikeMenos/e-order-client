"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ERGASTIRIO_LOGO_LEFT,
  ERGASTIRIO_LOGO_RIGHT,
} from "@/lib/ergastirio-constants";

type LoginIntroProps = {
  onComplete: () => void;
};

const ROLL_DURATION = 1.15;
const HOLD_MS = 400;
const FADE_DURATION = 0.45;

export function ErgastirioLoginIntro({ onComplete }: LoginIntroProps) {
  const [phase, setPhase] = useState<"roll" | "hold" | "exit">("roll");

  useEffect(() => {
    if (phase !== "hold") return;
    const id = window.setTimeout(() => setPhase("exit"), HOLD_MS);
    return () => window.clearTimeout(id);
  }, [phase]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url(/assets/background.png)" }}
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === "exit" ? 0 : 1 }}
      transition={{ duration: FADE_DURATION, ease: "easeInOut" }}
      onAnimationComplete={() => {
        if (phase === "exit") onComplete();
      }}
    >
      <div className="flex w-full max-w-lg items-center justify-center gap-1 overflow-hidden px-4">
        <motion.img
          src={ERGASTIRIO_LOGO_LEFT}
          alt=""
          className="h-28 w-28 shrink-0 object-contain will-change-transform"
          initial={{ x: "-120vw", rotate: 0 }}
          animate={{ x: 0, rotate: 720 }}
          transition={{
            duration: ROLL_DURATION,
            ease: [0.22, 1, 0.36, 1],
          }}
          onAnimationComplete={() => {
            if (phase === "roll") setPhase("hold");
          }}
        />
        <motion.img
          src={ERGASTIRIO_LOGO_RIGHT}
          alt=""
          className="h-28 w-28 shrink-0 object-contain will-change-transform"
          initial={{ x: "120vw", rotate: 0 }}
          animate={{ x: 0, rotate: -720 }}
          transition={{
            duration: ROLL_DURATION,
            ease: [0.22, 1, 0.36, 1],
          }}
        />
      </div>
    </motion.div>
  );
}
