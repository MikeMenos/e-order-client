"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import Link from "next/link";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { useTranslation } from "../../../lib/i18n";
import { api } from "../../../lib/api";
import { getApiErrorMessage } from "../../../lib/api-error";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignupPage() {
  const { t } = useTranslation();
  const router = useRouter();

  const [companyName, setCompanyName] = useState("");
  const [vatNumber, setVatNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVerify, setPasswordVerify] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});

  const signupMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        companyName,
        vat: vatNumber,
        phone: phoneNumber,
        email,
        password1: password,
        password2: passwordVerify,
      };
      const res = await api.post("/register", payload);
      return res.data;
    },
    onSuccess: (data: any) => {
      toast.success(data?.message ?? "Account created");
      router.push("/login");
    },
    onError: (err: unknown) => {
      console.error(err);
      toast.error(getApiErrorMessage(err, "Registration failed"));
    },
  });

  const validate = () => {
    const next: Record<string, string> = {};

    if (!companyName) next.companyName = t("signup_validation_company");
    if (!vatNumber) next.vatNumber = t("signup_validation_vat");
    if (!phoneNumber || phoneNumber.length < 10)
      next.phoneNumber = t("signup_validation_phone_length");
    if (!/^\d+$/.test(phoneNumber))
      next.phoneNumber = t("signup_validation_phone_digits");

    if (!email) next.email = t("signup_validation_email_required");
    else if (!EMAIL_REGEX.test(email))
      next.email = t("signup_validation_email_invalid");

    if (!password) next.password = t("signup_validation_password_required");
    if (passwordVerify !== password)
      next.passwordVerify = t("signup_validation_password_match");

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    signupMutation.mutate();
  };

  return (
    <main className="flex min-h-screen flex-col items-center bg-slate-100 pt-8 text-slate-900">
      <div className="mb-6 flex w-full max-w-md items-center justify-between px-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/logo.png"
          alt="E-Order"
          className="h-12 w-12 rounded-lg object-contain"
        />
        <Link
          href="/"
          className="inline-flex items-center rounded px-2 py-1 text-sm hover:bg-slate-200 transition"
        >
          {t("nav_back_home")}
        </Link>
      </div>
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-slate-200 bg-white px-4 py-6 shadow-lg">
        <header className="space-y-1 px-2">
          <h1 className="text-xl font-semibold">
            {t("signup_title") ?? "Sign up"}
          </h1>
          <p className="text-sm text-slate-500">{t("signup_subtitle")}</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-sm text-slate-700">
              {t("signup_company_name")}
            </label>
            <Input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
            {errors.companyName && (
              <p className="text-sm text-red-500">{errors.companyName}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-sm text-slate-700">
              {t("signup_vat")}
            </label>
            <Input
              value={vatNumber}
              onChange={(e) => setVatNumber(e.target.value)}
            />
            {errors.vatNumber && (
              <p className="text-sm text-red-500">{errors.vatNumber}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-sm text-slate-700">
              {t("signup_phone")}
            </label>
            <Input
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            {errors.phoneNumber && (
              <p className="text-sm text-red-500">{errors.phoneNumber}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-sm text-slate-700">
              {t("signup_email")}
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-sm text-slate-700">
              {t("signup_password")}
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-sm text-slate-700">
              {t("signup_password_confirm")}
            </label>
            <Input
              type="password"
              value={passwordVerify}
              onChange={(e) => setPasswordVerify(e.target.value)}
            />
            {errors.passwordVerify && (
              <p className="text-sm text-red-500">{errors.passwordVerify}</p>
            )}
          </div>

          <Button
            type="submit"
            className="mt-2 w-full"
            disabled={signupMutation.isPending}
          >
            {signupMutation.isPending
              ? t("signup_continue")
              : t("signup_continue")}
          </Button>
        </form>

        <p className="text-center text-sm text-slate-500">
          {t("signup_footer")}
        </p>
      </div>
    </main>
  );
}
