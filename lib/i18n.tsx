"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type Language = "en" | "gr";

type Resources = Record<Language, Record<string, string>>;

const resources: Resources = {
  en: {
    login_with_email: "Member login",
    signup_with_email: "New member registration",
    login_title: "Sign in",
    login_username: "Username",
    login_password: "Password",
    login_submit: "Sign in",
    home_welcome_title: "Welcome",
    home_welcome_body:
      "Use your existing e-order credentials or create a new account for your store.",
    nav_back_home: "Back to home",
    signup_title: "Sign up",
    signup_subtitle: "Create a new account for your store.",
    signup_company_name: "Company name",
    signup_vat: "VAT number",
    signup_phone: "Phone",
    signup_email: "Email",
    signup_password: "Password",
    signup_password_confirm: "Confirm password",
    signup_continue: "Continue",
    signup_validation_company: "Please enter company name.",
    signup_validation_vat: "Please enter VAT number.",
    signup_validation_phone_digits: "Phone number must contain only digits.",
    signup_validation_phone_length: "Enter a valid phone number (10 digits).",
    signup_validation_email_required: "Enter email.",
    signup_validation_email_invalid: "Enter a valid email.",
    signup_validation_password_required: "Enter password.",
    signup_validation_password_match: "Passwords do not match.",
    signup_footer:
      "By continuing, you agree to the e-order terms and privacy policy.",
    dashboard_header_kpi: "Orders",
    calendar_today: "Today",
    suppliers_orders_of_day: "Orders of the day",
    suppliers_sort_by_time: "By time",
    suppliers_include_completed: "Completed",
    suppliers_search_placeholder: "Search…",
    suppliers_loading: "Loading suppliers…",
    suppliers_error: "Failed to load suppliers list.",
    suppliers_empty: "No suppliers found.",
    suppliers_order_by: "Order by:",
    suppliers_delivery: "Delivery:",
    suppliers_view: "View",
    supplier_back: "Back",
    supplier_search_placeholder: "Search: Supplier, Product, Category...",
    supplier_order_by: "Order by:",
    supplier_delivery: "Delivery:",
    supplier_reserve: "Reserve:",
    supplier_loading_products: "Loading products…",
    supplier_error_products: "Failed to load products.",
    supplier_empty_products: "No products found for this supplier.",
    supplier_min_fill: "80% minimum order fill",
    store_select_title: "Select store",
    store_select_description:
      "Your account has access to multiple stores. Choose one to continue.",
    store_select_close: "Close",
    store_select_store_fallback: "Store",
    logout: "Logout",
  },
  gr: {
    login_with_email: "Σύνδεση μέλους",
    signup_with_email: "Εγγραφή νέου μέλους",
    login_title: "Σύνδεση",
    login_username: "Όνομα χρήστη",
    login_password: "Κωδικός",
    login_submit: "Σύνδεση",
    home_welcome_title: "Καλώς ήρθατε",
    home_welcome_body:
      "Χρησιμοποιήστε τους υπάρχοντες κωδικούς e-order ή δημιουργήστε νέο λογαριασμό για το κατάστημά σας.",
    nav_back_home: "Επιστροφή στην αρχική",
    signup_title: "Εγγραφή",
    signup_subtitle: "Δημιουργήστε νέο λογαριασμό για το κατάστημά σας.",
    signup_company_name: "Επωνυμία",
    signup_vat: "Α.Φ.Μ.",
    signup_phone: "Τηλέφωνο",
    signup_email: "Email",
    signup_password: "Κωδικός",
    signup_password_confirm: "Επιβεβαίωση κωδικού",
    signup_continue: "Συνέχεια",
    signup_validation_company: "Εισάγετε επωνυμία.",
    signup_validation_vat: "Εισάγετε Α.Φ.Μ.",
    signup_validation_phone_digits:
      "Το τηλέφωνο πρέπει να περιέχει μόνο αριθμούς.",
    signup_validation_phone_length: "Εισάγετε έγκυρο τηλέφωνο (10 ψηφία).",
    signup_validation_email_required: "Εισάγετε email.",
    signup_validation_email_invalid: "Εισάγετε έγκυρο email.",
    signup_validation_password_required: "Εισάγετε κωδικό.",
    signup_validation_password_match: "Οι κωδικοί πρόσβασης δεν ταιριάζουν.",
    signup_footer:
      "Συνεχίζοντας, αποδέχεστε τους όρους χρήσης και την πολιτική απορρήτου του e-order.",
    dashboard_header_kpi: "Παραγγελίες",
    calendar_today: "Σήμερα",
    suppliers_orders_of_day: "Παραγγελίες ημέρας",
    suppliers_sort_by_time: "Κατά ώρα",
    suppliers_include_completed: "Ολοκληρωμένες",
    suppliers_search_placeholder: "Αναζήτηση…",
    suppliers_loading: "Φόρτωση προμηθευτών…",
    suppliers_error: "Αποτυχία φόρτωσης λίστας προμηθευτών.",
    suppliers_empty: "Δεν βρέθηκαν προμηθευτές.",
    suppliers_order_by: "Παραγγελία έως:",
    suppliers_delivery: "Παράδοση:",
    suppliers_view: "Προβολή",
    supplier_back: "Πίσω",
    supplier_search_placeholder: "Αναζήτηση: Προμηθευτής, Προϊόν, Κατηγορία...",
    supplier_order_by: "Παραγγελία έως:",
    supplier_delivery: "Παράδοση:",
    supplier_reserve: "Reserve:",
    supplier_loading_products: "Φόρτωση προϊόντων…",
    supplier_error_products: "Αποτυχία φόρτωσης προϊόντων.",
    supplier_empty_products: "Δεν βρέθηκαν προϊόντα για αυτόν τον προμηθευτή.",
    supplier_min_fill: "80% ελάχιστη κάλυψη παραγγελίας",
    store_select_title: "Επιλέξτε κατάστημα",
    store_select_description:
      "Ο λογαριασμός σας έχει πρόσβαση σε πολλά καταστήματα. Επιλέξτε ένα για να συνεχίσετε.",
    store_select_close: "Κλείσιμο",
    store_select_store_fallback: "Κατάστημα",
    logout: "Αποσύνδεση",
  },
};

type I18nContextValue = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function TranslationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [language, setLanguageState] = useState<Language>("gr");

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  const t = useCallback(
    (key: string) => {
      const table = resources[language] ?? resources.gr;
      return table[key] ?? resources.gr[key] ?? key;
    },
    [language],
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
    }),
    [language, setLanguage, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useTranslation must be used within TranslationProvider");
  }

  return {
    t: ctx.t,
    i18n: {
      language: ctx.language,
      changeLanguage: ctx.setLanguage,
    },
  };
}
