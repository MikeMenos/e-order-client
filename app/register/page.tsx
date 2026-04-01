"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useRegister } from "../../hooks/useRegister";
import { Button } from "../../components/ui/button";
import { ClearableInput } from "../../components/ui/clearable-input";
import { PasswordInput } from "../../components/ui/password-input";
import { Label } from "../../components/ui/label";
import { useTranslation } from "../../lib/i18n";
import { getApiErrorMessage } from "../../lib/api-error";
import { isApiSuccess, getApiResponseMessage } from "../../lib/api-response";
import {
  shouldPromptRegisterVerification,
  REGISTER_VERIFY_STORAGE_KEY,
} from "../../lib/register-verification";

function ReqLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <Label htmlFor={htmlFor}>
      <span>{children}</span>
      <span className="ml-0.5 text-red-600 font-semibold" aria-hidden="true">
        *
      </span>
    </Label>
  );
}

function OptionalFieldLabel({
  htmlFor,
  labelKey,
}: {
  htmlFor: string;
  labelKey: string;
}) {
  const { t } = useTranslation();
  return (
    <Label htmlFor={htmlFor}>
      <span>{t(labelKey)}</span>{" "}
    </Label>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const { t, i18n } = useTranslation();

  const [companyName, setCompanyName] = useState("");
  const [vat, setVat] = useState("");
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [mainActivity, setMainActivity] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [contactPersonPhone, setContactPersonPhone] = useState("");
  const [accountFname, setAccountFname] = useState("");
  const [accountLname, setAccountLname] = useState("");
  const [accountUsername, setAccountUsername] = useState("");
  const [accountEmail, setAccountEmail] = useState("");
  const [accountMobile, setAccountMobile] = useState("");
  const [accountPassword1, setAccountPassword1] = useState("");
  const [accountPassword2, setAccountPassword2] = useState("");

  const registerMutation = useRegister({
    onSuccess: (data) => {
      if (data != null && isApiSuccess(data)) {
        if (shouldPromptRegisterVerification(data)) {
          try {
            sessionStorage.setItem(
              REGISTER_VERIFY_STORAGE_KEY,
              String(data.appUserUID).trim(),
            );
          } catch {
            /* ignore */
          }
          toast.success(
            getApiResponseMessage(data) ||
              t("store_register_success_verify_next"),
          );
          router.replace("/register/verify");
          return;
        }
        toast.success(
          getApiResponseMessage(data) || t("store_register_success"),
        );
        router.replace("/");
        return;
      }
      toast.error(getApiResponseMessage(data) || t("store_register_error"));
    },
    onError: (err: unknown) => {
      toast.error(getApiErrorMessage(err, t("store_register_error")));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate({
      companyName: companyName.trim(),
      vat: vat.trim(),
      address: address.trim(),
      postalCode: postalCode.trim(),
      city: city.trim(),
      phone: phone.trim(),
      email: email.trim(),
      mainActivity: mainActivity.trim(),
      contactPerson: contactPerson.trim(),
      contactPersonPhone: contactPersonPhone.trim(),
      accountFname: accountFname.trim(),
      accountLname: accountLname.trim(),
      accountUsername: accountUsername.trim(),
      accountEmail: accountEmail.trim(),
      accountMobile: accountMobile.trim(),
      accountPassword1,
      accountPassword2,
    });
  };

  return (
    <main
      className="flex min-h-dvh flex-col items-center bg-cover bg-center bg-no-repeat text-slate-900 pb-10"
      style={{ backgroundImage: "url(/assets/background.png)" }}
    >
      <div className="flex w-full max-w-lg items-center justify-between p-4">
        <Link
          href="/"
          className="text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline"
        >
          ← {t("nav_back_home")}
        </Link>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            i18n.changeLanguage(i18n.language === "en" ? "gr" : "en")
          }
          className="shrink-0 rounded-full border border-slate-200/80 px-3 py-1 text-base font-medium text-slate-700"
        >
          {i18n.language === "gr" ? t("lang_en") : t("lang_gr")}
        </Button>
      </div>
      <div className="mb-4 flex w-full max-w-lg justify-center px-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/logo.png"
          alt="E-Order"
          className="h-20 w-20 object-contain"
        />
      </div>
      <div className="w-full max-w-lg px-4">
        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border border-slate-200/80 p-6 shadow-lg bg-app-card"
        >
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              {t("store_register_title")}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              {t("signup_subtitle")}
            </p>
          </div>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">
              {t("store_register_section_store")}
            </h2>
            <div className="space-y-1">
              <ReqLabel htmlFor="companyName">
                {t("signup_company_name")}
              </ReqLabel>
              <ClearableInput
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                autoComplete="organization"
              />
            </div>
            <div className="space-y-1">
              <ReqLabel htmlFor="vat">{t("signup_vat")}</ReqLabel>
              <ClearableInput
                id="vat"
                value={vat}
                onChange={(e) => setVat(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <ReqLabel htmlFor="mainActivity">
                {t("signup_main_activity")}
              </ReqLabel>
              <ClearableInput
                id="mainActivity"
                value={mainActivity}
                onChange={(e) => setMainActivity(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <ReqLabel htmlFor="address">{t("signup_address")}</ReqLabel>
              <ClearableInput
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                autoComplete="street-address"
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <ReqLabel htmlFor="postalCode">
                  {t("signup_postal_code")}
                </ReqLabel>
                <ClearableInput
                  id="postalCode"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  autoComplete="postal-code"
                />
              </div>
              <div className="space-y-1">
                <ReqLabel htmlFor="city">{t("signup_city")}</ReqLabel>
                <ClearableInput
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  autoComplete="address-level2"
                />
              </div>
            </div>
            <div className="space-y-1">
              <OptionalFieldLabel htmlFor="phone" labelKey="signup_phone" />
              <ClearableInput
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
              />
            </div>
            <div className="space-y-1">
              <OptionalFieldLabel
                htmlFor="email"
                labelKey="store_register_company_email"
              />
              <ClearableInput
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <OptionalFieldLabel
                  htmlFor="contactPerson"
                  labelKey="signup_contact_person"
                />
                <ClearableInput
                  id="contactPerson"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <OptionalFieldLabel
                  htmlFor="contactPersonPhone"
                  labelKey="signup_contact_person_phone"
                />
                <ClearableInput
                  id="contactPersonPhone"
                  type="tel"
                  value={contactPersonPhone}
                  onChange={(e) => setContactPersonPhone(e.target.value)}
                />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">
              {t("store_register_section_account")}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <ReqLabel htmlFor="accountFname">{t("first_name")}</ReqLabel>
                <ClearableInput
                  id="accountFname"
                  value={accountFname}
                  onChange={(e) => setAccountFname(e.target.value)}
                  autoComplete="given-name"
                />
              </div>
              <div className="space-y-1">
                <ReqLabel htmlFor="accountLname">{t("last_name")}</ReqLabel>
                <ClearableInput
                  id="accountLname"
                  value={accountLname}
                  onChange={(e) => setAccountLname(e.target.value)}
                  autoComplete="family-name"
                />
              </div>
            </div>
            <div className="space-y-1">
              <ReqLabel htmlFor="accountUsername">
                {t("signup_account_username")}
              </ReqLabel>
              <ClearableInput
                id="accountUsername"
                value={accountUsername}
                onChange={(e) => setAccountUsername(e.target.value)}
                autoComplete="username"
              />
            </div>
            <div className="space-y-1">
              <ReqLabel htmlFor="accountEmail">
                {t("signup_account_email")}
              </ReqLabel>
              <ClearableInput
                id="accountEmail"
                type="email"
                value={accountEmail}
                onChange={(e) => setAccountEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div className="space-y-1">
              <ReqLabel htmlFor="accountMobile">
                {t("signup_account_mobile")}
              </ReqLabel>
              <ClearableInput
                id="accountMobile"
                type="tel"
                value={accountMobile}
                onChange={(e) => setAccountMobile(e.target.value)}
                autoComplete="tel"
              />
            </div>
            <div className="space-y-1">
              <ReqLabel htmlFor="accountPassword1">
                {t("signup_password")}
              </ReqLabel>
              <PasswordInput
                id="accountPassword1"
                value={accountPassword1}
                onChange={(e) => setAccountPassword1(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-1">
              <ReqLabel htmlFor="accountPassword2">
                {t("signup_password_confirm")}
              </ReqLabel>
              <PasswordInput
                id="accountPassword2"
                value={accountPassword2}
                onChange={(e) => setAccountPassword2(e.target.value)}
                autoComplete="new-password"
              />
            </div>
          </section>

          <p className="text-xs text-slate-500">{t("signup_footer")}</p>

          <Button
            type="submit"
            disabled={registerMutation.isPending}
            className="w-full"
          >
            {registerMutation.isPending
              ? t("store_register_submitting")
              : t("store_register_submit")}
          </Button>

          <p className="text-center text-sm text-slate-600">
            <Link
              href="/"
              className="font-medium text-brand-600 hover:text-brand-700 hover:underline"
            >
              {t("login_title")}
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
