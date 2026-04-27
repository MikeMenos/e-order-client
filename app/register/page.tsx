"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import toast from "react-hot-toast";
import { useRegister } from "../../hooks/useRegister";
import { useCheckVat } from "../../hooks/useCheckVat";
import { Button } from "../../components/ui/button";
import { ClearableInput } from "../../components/ui/clearable-input";
import { PasswordInput } from "../../components/ui/password-input";
import { Label } from "../../components/ui/label";
import { useTranslation } from "../../lib/i18n";
import { getApiErrorMessage } from "../../lib/api-error";
import { isApiSuccess, getApiResponseMessage } from "../../lib/api-response";
import {
  shouldPromptRegisterVerification,
  getRegisterVerificationUid,
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

  const [step, setStep] = useState<"vat" | "form">("vat");
  const [registrationUID, setRegistrationUID] = useState<string | undefined>();

  const [vatLookup, setVatLookup] = useState("");
  const [postalLookup, setPostalLookup] = useState("");

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

  const checkVatMutation = useCheckVat({
    onSuccess: (data) => {
      if (data.hasFoundData === false) {
        toast.error(
          getApiResponseMessage(data) || t("store_register_vat_not_found"),
        );
        return;
      }
      const info = data.info;
      if (!info) {
        toast.error(t("store_register_vat_not_found"));
        return;
      }
      setCompanyName(String(info.companyName ?? "").trim());
      setVat(
        String(info.vat ?? vatLookup)
          .replace(/\s/g, "")
          .trim(),
      );
      setAddress(String(info.address ?? "").trim());
      setPostalCode(String(info.postalCode ?? "").trim());
      setCity(String(info.city ?? "").trim());
      setMainActivity(String(info.mainActivity ?? "").trim());
      const uid = data.registrationUID?.trim();
      setRegistrationUID(uid && uid.length > 0 ? uid : undefined);
      setStep("form");
    },
    onError: (err: unknown) => {
      toast.error(getApiErrorMessage(err, t("store_register_vat_not_found")));
    },
  });

  const registerMutation = useRegister({
    onSuccess: (data) => {
      if (data != null && isApiSuccess(data)) {
        if (shouldPromptRegisterVerification(data)) {
          const uid = getRegisterVerificationUid(data);
          if (uid) {
            try {
              sessionStorage.setItem(REGISTER_VERIFY_STORAGE_KEY, uid);
            } catch {
              /* ignore */
            }
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

  const handleVatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = vatLookup.replace(/\s/g, "").trim();
    const pc = postalLookup.replace(/\s/g, "").trim();
    if (!v) {
      toast.error(t("signup_validation_vat"));
      return;
    }
    if (!pc) {
      toast.error(t("signup_validation_postal_code"));
      return;
    }
    checkVatMutation.mutate({ vat: v, postalCode: pc });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate({
      ...(registrationUID ? { registrationUID } : {}),
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

  const lockedFromRegistry = step === "form";

  const goBackToVatStep = () => {
    setStep("vat");
    setRegistrationUID(undefined);
    setVatLookup(vat);
    setPostalLookup(postalCode);
  };

  return (
    <main
      className="flex min-h-dvh flex-col items-center bg-cover bg-center bg-no-repeat text-slate-900 pb-10"
      style={{ backgroundImage: "url(/assets/background.png)" }}
    >
      <div className="flex w-full max-w-lg items-center justify-between p-4 pb-0">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-12 w-12 shrink-0 rounded-full border-slate-200"
          onClick={() => router.push("/")}
          aria-label={t("aria_back")}
        >
          <ChevronLeft className="h-8 w-8 text-brand-500" aria-hidden />
        </Button>
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
      <div className="mb-2 flex w-full max-w-lg justify-center px-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/logo.png"
          alt="E-Order"
          className="h-20 w-20 object-contain"
        />
      </div>
      <div className="w-full max-w-lg px-4">
        {step === "vat" ? (
          <form
            onSubmit={handleVatSubmit}
            className="space-y-6 rounded-2xl border border-slate-200/80 p-6 shadow-lg bg-app-card"
          >
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                {t("store_register_step_vat_title")}
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                {t("store_register_step_vat_subtitle")}
              </p>
            </div>
            <div className="space-y-1">
              <ReqLabel htmlFor="vatLookup">{t("signup_vat")}</ReqLabel>
              <ClearableInput
                id="vatLookup"
                value={vatLookup}
                onChange={(e) => setVatLookup(e.target.value)}
                autoComplete="off"
              />
            </div>
            <div className="space-y-1">
              <ReqLabel htmlFor="postalLookup">
                {t("signup_postal_code")}
              </ReqLabel>
              <ClearableInput
                id="postalLookup"
                value={postalLookup}
                onChange={(e) => setPostalLookup(e.target.value)}
                autoComplete="postal-code"
              />
            </div>
            <Button
              type="submit"
              disabled={checkVatMutation.isPending}
              className="w-full"
            >
              {checkVatMutation.isPending
                ? t("store_register_vat_check_submitting")
                : t("store_register_vat_check_submit")}
            </Button>
          </form>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-2xl border border-slate-200/80 p-6 shadow-lg bg-app-card"
          >
            <div className="mb-3">
              <h1 className="text-2xl font-semibold text-slate-900">
                {t("store_register_title")}
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                {t("signup_subtitle")}
              </p>
              <button
                type="button"
                onClick={goBackToVatStep}
                className="mt-2 text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline"
              >
                {t("store_register_change_lookup")}
              </button>
            </div>

            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">
                {t("store_register_section_store")}
              </h2>
              <div className="space-y-1">
                <div className="flex items-baseline justify-between gap-2">
                  <ReqLabel htmlFor="companyName">
                    {t("signup_company_name")}
                  </ReqLabel>
                  {lockedFromRegistry && (
                    <span className="text-xs text-slate-500 shrink-0">
                      {t("store_register_field_locked_hint")}
                    </span>
                  )}
                </div>
                <ClearableInput
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  autoComplete="organization"
                  disabled={lockedFromRegistry}
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-baseline justify-between gap-2">
                  <ReqLabel htmlFor="vat">{t("signup_vat")}</ReqLabel>
                  {lockedFromRegistry && (
                    <span className="text-xs text-slate-500 shrink-0">
                      {t("store_register_field_locked_hint")}
                    </span>
                  )}
                </div>
                <ClearableInput
                  id="vat"
                  value={vat}
                  onChange={(e) => setVat(e.target.value)}
                  disabled={lockedFromRegistry}
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
                <div className="flex items-baseline justify-between gap-2">
                  <ReqLabel htmlFor="address">{t("signup_address")}</ReqLabel>
                  {lockedFromRegistry && (
                    <span className="text-xs text-slate-500 shrink-0">
                      {t("store_register_field_locked_hint")}
                    </span>
                  )}
                </div>
                <ClearableInput
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  autoComplete="street-address"
                  disabled={lockedFromRegistry}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <ReqLabel htmlFor="postalCode">
                      {t("signup_postal_code")}
                    </ReqLabel>
                    {lockedFromRegistry && (
                      <span className="text-xs text-slate-500 shrink-0">
                        {t("store_register_field_locked_hint")}
                      </span>
                    )}
                  </div>
                  <ClearableInput
                    id="postalCode"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    autoComplete="postal-code"
                    disabled={lockedFromRegistry}
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <ReqLabel htmlFor="city">{t("signup_city")}</ReqLabel>
                    {lockedFromRegistry && (
                      <span className="text-xs text-slate-500 shrink-0">
                        {t("store_register_field_locked_hint")}
                      </span>
                    )}
                  </div>
                  <ClearableInput
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    autoComplete="address-level2"
                    disabled={lockedFromRegistry}
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">
                {t("store_register_section_account")}
              </h2>
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
          </form>
        )}
      </div>
    </main>
  );
}
