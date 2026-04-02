"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useVerifyAccount } from "@/hooks/useVerifyAccount";
import { useTranslation } from "@/lib/i18n";
import { getApiErrorMessage } from "@/lib/api-error";
import { isApiSuccess, getApiResponseMessage } from "@/lib/api-response";
import { REGISTER_VERIFY_STORAGE_KEY } from "@/lib/register-verification";
import { Button } from "@/components/ui/button";
import { ClearableInput } from "@/components/ui/clearable-input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const stepMotion = {
  initial: { opacity: 0, x: 28 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -28 },
};

type Step = "email" | "sms";

export function RegisterVerifyStepper({
  registrationUID,
}: {
  registrationUID: string;
}) {
  const router = useRouter();
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>("email");
  const [emailCode, setEmailCode] = useState("");
  const [smsCode, setSmsCode] = useState("");

  const verifyMutation = useVerifyAccount({
    onSuccess: (data, variables) => {
      if (data == null || !isApiSuccess(data)) {
        toast.error(getApiResponseMessage(data) || t("register_verify_error"));
        return;
      }
      const emailStep =
        variables.smsCode == null &&
        variables.emailCode != null &&
        String(variables.emailCode).trim() !== "";
      const smsStep =
        variables.emailCode == null &&
        variables.smsCode != null &&
        String(variables.smsCode).trim() !== "";

      if (emailStep) {
        toast.success(
          getApiResponseMessage(data) || t("register_verify_email_confirmed"),
        );
        setSmsCode("");
        setStep("sms");
        return;
      }
      if (smsStep) {
        toast.success(
          getApiResponseMessage(data) || t("register_verify_all_done"),
        );
        try {
          sessionStorage.removeItem(REGISTER_VERIFY_STORAGE_KEY);
        } catch {
          /* ignore */
        }
        router.replace("/");
      }
    },
    onError: (err: unknown) => {
      toast.error(getApiErrorMessage(err, t("register_verify_error")));
    },
  });

  const submitEmail = (e: React.FormEvent) => {
    e.preventDefault();
    verifyMutation.mutate({
      registrationUID,
      smsCode: null,
      emailCode: emailCode.trim() || null,
    });
  };

  const submitSms = (e: React.FormEvent) => {
    e.preventDefault();
    verifyMutation.mutate({
      registrationUID,
      smsCode: smsCode.trim() || null,
      emailCode: null,
    });
  };

  const stepIndex = step === "email" ? 1 : 2;

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 flex items-center justify-center gap-0">
        {[1, 2].map((n) => (
          <div key={n} className="flex items-center">
            <motion.div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold shadow-sm",
                stepIndex >= n
                  ? "bg-brand-600 text-white"
                  : "bg-slate-200 text-slate-600",
              )}
              initial={false}
              animate={{ scale: stepIndex === n ? 1.08 : 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 26 }}
            >
              {n}
            </motion.div>
            {n === 1 ? (
              <div
                className="relative mx-2 h-1 w-14 overflow-hidden rounded-full bg-slate-200"
                aria-hidden
              >
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full bg-brand-600"
                  initial={false}
                  animate={{ width: step === "sms" ? "100%" : "0%" }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <div className="relative min-h-[200px]">
        <AnimatePresence mode="wait">
          {step === "email" ? (
            <motion.form
              key="email"
              variants={stepMotion}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              onSubmit={submitEmail}
              className="space-y-4"
            >
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  {t("register_verify_step_email_title")}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  {t("register_verify_step_email_description")}
                </p>
              </div>
              <div className="space-y-1">
                <Label htmlFor="emailCode">
                  {t("register_verify_email_code_label")}
                </Label>
                <ClearableInput
                  id="emailCode"
                  value={emailCode}
                  onChange={(e) => setEmailCode(e.target.value)}
                  autoComplete="one-time-code"
                  inputMode="numeric"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={verifyMutation.isPending}
              >
                {verifyMutation.isPending
                  ? t("register_verify_submitting")
                  : t("register_verify_submit_email")}
              </Button>
            </motion.form>
          ) : (
            <motion.form
              key="sms"
              variants={stepMotion}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              onSubmit={submitSms}
              className="space-y-4"
            >
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  {t("register_verify_step_sms_title")}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  {t("register_verify_step_sms_description")}
                </p>
              </div>
              <div className="space-y-1">
                <Label htmlFor="smsCode">
                  {t("register_verify_sms_code_label")}
                </Label>
                <ClearableInput
                  id="smsCode"
                  value={smsCode}
                  onChange={(e) => setSmsCode(e.target.value)}
                  autoComplete="one-time-code"
                  inputMode="numeric"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={verifyMutation.isPending}
              >
                {verifyMutation.isPending
                  ? t("register_verify_submitting")
                  : t("register_verify_submit_sms")}
              </Button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
