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
    nav_home: "Home",
    nav_switch_store: "Switch store",
    common_back: "Back",
    common_supplier: "Supplier",
    login_toast_success: "Logged in",
    login_toast_error: "Login failed",
    config_fav_title: "Favorite suppliers / products",
    config_fav_subtitle:
      "Read-only view of wishlist items from Basket/Wishlist_GetItems.",
    config_loading_favorites: "Loading favorites…",
    config_error_favorites: "Failed to load favorites.",
    config_empty_favorites: "No favorite items found.",
    config_users_title: "Users management",
    config_users_subtitle: "Read-only list of users for the current store.",
    config_users_store_uid: "Store UID:",
    config_loading_users: "Loading users…",
    config_error_users: "Failed to load users.",
    config_empty_users: "No users found.",
    config_order_retake_title: "Order retake",
    config_order_retake_subtitle:
      'List of previous orders that could be "retaken" (new order from an existing one).',
    config_loading_orders: "Loading orders…",
    config_error_orders: "Failed to load orders.",
    config_empty_orders: "No orders found.",
    config_order_fallback: "Order",
    config_order_hours_title: "Order hours",
    config_order_hours_subtitle:
      "Read-only view of preferred schedule for orders (from MyStore/PrefSchedule_Get).",
    config_loading_schedule: "Loading schedule…",
    config_error_schedule: "Failed to load schedule.",
    basket_title: "Basket",
    basket_subtitle: "Overview of items currently in your baskets.",
    basket_total_baskets: "Total baskets:",
    basket_loading: "Loading basket items…",
    basket_error: "Failed to load basket items.",
    basket_empty: "No items in your baskets.",
    basket_items_label: "Items:",
    aria_decrease_reserve: "Decrease reserve quantity",
    aria_reserve_quantity: "Reserve quantity",
    aria_increase_reserve: "Increase reserve quantity",
    aria_decrease_basket: "Decrease basket quantity",
    aria_basket_quantity: "Basket quantity",
    aria_increase_basket: "Increase basket quantity",
    aria_supplier_details: "Supplier details",
    home_brand: "E-ORDER",
    lang_gr: "GR",
    lang_en: "EN",
    supplier_order_history_title: "Order history",
    supplier_order_history_loading: "Loading orders…",
    supplier_order_history_error: "Failed to load orders.",
    supplier_order_history_empty: "No orders found for this supplier.",
    supplier_order_history_aria: "Order history",
    order_ref_date: "Order date:",
    order_delivery_date: "Delivery:",
    order_min_order: "Min. order:",
    order_remaining: "Remaining:",
    order_delivery_cost: "Delivery cost:",
    order_created_by: "Created by:",
    order_date_created: "Date created:",
    order_shopper_comments: "Your comments:",
    order_supplier_comments: "Supplier comments:",
    order_next_delivery: "Next delivery:",
    order_items_count: "Items",
    order_items: "Items purchased",
    order_items_empty: "No items in this order.",
    order_item_quantity: "Qty",
    dashboard_card_suppliers: "Suppliers",
    dashboard_card_orders_of_day: "Orders of the Day",
    dashboard_card_statistics: "Statistics",
    dashboard_card_settings: "Settings",
    dashboard_card_supplier_config: "Supplier Configuration",
    dashboard_card_partner_suppliers: "Partner Suppliers",
    settings_title: "Settings",
    cart_summary: "Cart [{count}], {pcs} pcs",
    checkout_button: "Checkout",
    order_completion_title: "Order Completion",
    checkout_delivery: "Delivery",
    checkout_delivery_other_date: "Other date",
    checkout_select_delivery_date: "Select delivery date",
    checkout_date_confirm: "Confirm",
    checkout_date_cancel: "Cancel",
    checkout_comments: "Comments",
    checkout_total: "Total:",
    checkout_temporary_save: "Temporary Save",
    checkout_submit_order: "Submit Order",
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
    supplier_reserve: "Απόθεμα:",
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
    nav_home: "Αρχική",
    nav_switch_store: "Αλλαγή καταστήματος",
    common_back: "Πίσω",
    common_supplier: "Προμηθευτής",
    login_toast_success: "Συνδεθήκατε",
    login_toast_error: "Αποτυχία σύνδεσης",
    config_fav_title: "Αγαπημένοι προμηθευτές / προϊόντα",
    config_fav_subtitle:
      "Μόνο για ανάγνωση: στοιχεία λίστας ευχών από Basket/Wishlist_GetItems.",
    config_loading_favorites: "Φόρτωση αγαπημένων…",
    config_error_favorites: "Αποτυχία φόρτωσης αγαπημένων.",
    config_empty_favorites: "Δεν βρέθηκαν αγαπημένα στοιχεία.",
    config_users_title: "Διαχείριση χρηστών",
    config_users_subtitle:
      "Λίστα χρηστών του τρέχοντος καταστήματος (μόνο ανάγνωση).",
    config_users_store_uid: "Store UID:",
    config_loading_users: "Φόρτωση χρηστών…",
    config_error_users: "Αποτυχία φόρτωσης χρηστών.",
    config_empty_users: "Δεν βρέθηκαν χρήστες.",
    config_order_retake_title: "Επαναληπτική παραγγελία",
    config_order_retake_subtitle:
      'Λίστα προηγούμενων παραγγελιών που μπορούν να "επαναληφθούν" (νέα παραγγελία από υπάρχουσα).',
    config_loading_orders: "Φόρτωση παραγγελιών…",
    config_error_orders: "Αποτυχία φόρτωσης παραγγελιών.",
    config_empty_orders: "Δεν βρέθηκαν παραγγελίες.",
    config_order_fallback: "Παραγγελία",
    config_order_hours_title: "Ώρες παραγγελίας",
    config_order_hours_subtitle:
      "Μόνο ανάγνωση: προτιμώμενο πρόγραμμα παραγγελιών (MyStore/PrefSchedule_Get).",
    config_loading_schedule: "Φόρτωση προγράμματος…",
    config_error_schedule: "Αποτυχία φόρτωσης προγράμματος.",
    basket_title: "Καλάθι",
    basket_subtitle: "Επισκόπηση στοιχείων στα καλάθια σας.",
    basket_total_baskets: "Σύνολο καλαθιών:",
    basket_loading: "Φόρτωση στοιχείων καλαθιού…",
    basket_error: "Αποτυχία φόρτωσης στοιχείων καλαθιού.",
    basket_empty: "Δεν υπάρχουν στοιχεία στα καλάθια σας.",
    basket_items_label: "Στοιχεία:",
    aria_decrease_reserve: "Μείωση ποσότητας απόθεματος",
    aria_reserve_quantity: "Ποσότητα απόθεματος",
    aria_increase_reserve: "Αύξηση ποσότητας απόθεματος",
    aria_decrease_basket: "Μείωση ποσότητας καλαθιού",
    aria_basket_quantity: "Ποσότητα καλαθιού",
    aria_increase_basket: "Αύξηση ποσότητας καλαθιού",
    aria_supplier_details: "Λεπτομέρειες προμηθευτή",
    home_brand: "E-ORDER",
    lang_gr: "GR",
    lang_en: "EN",
    supplier_order_history_title: "Ιστορικό παραγγελιών",
    supplier_order_history_loading: "Φόρτωση παραγγελιών…",
    supplier_order_history_error: "Αποτυχία φόρτωσης παραγγελιών.",
    supplier_order_history_empty:
      "Δεν βρέθηκαν παραγγελίες για αυτόν τον προμηθευτή.",
    supplier_order_history_aria: "Ιστορικό παραγγελιών",
    order_ref_date: "Ημ. παραγγελίας:",
    order_delivery_date: "Παράδοση:",
    order_min_order: "Ελάχ. παραγγελία:",
    order_remaining: "Υπόλοιπο:",
    order_delivery_cost: "Κόστος παράδοσης:",
    order_created_by: "Δημιουργήθηκε από:",
    order_date_created: "Ημ. δημιουργίας:",
    order_shopper_comments: "Σχόλια σας:",
    order_supplier_comments: "Σχόλια προμηθευτή:",
    order_next_delivery: "Επόμενη παράδοση:",
    order_items_count: "Στοιχεία",
    order_items: "Αγορασμένα προϊόντα",
    order_items_empty: "Δεν υπάρχουν προϊόντα σε αυτή την παραγγελία.",
    order_item_quantity: "Ποσ.",
    dashboard_card_suppliers: "Προμηθευτές",
    dashboard_card_orders_of_day: "Παραγγελίες Ημέρας",
    dashboard_card_statistics: "Στατιστικά",
    dashboard_card_settings: "Ρυθμίσεις",
    dashboard_card_supplier_config: "Διαμόρφωση Προμηθευτών",
    dashboard_card_partner_suppliers: "Συνεργαζόμενοι Προμηθευτές",
    settings_title: "Ρυθμίσεις",
    cart_summary: "Καλάθι [{count}], {pcs} τεμ",
    checkout_button: "Checkout",
    order_completion_title: "Ολοκλήρωση Αγοράς",
    checkout_delivery: "Παράδοση",
    checkout_delivery_other_date: "Άλλη ημερομηνία",
    checkout_select_delivery_date: "Επιλέξτε ημερομηνία παράδοσης",
    checkout_date_confirm: "Επιβεβαίωση",
    checkout_date_cancel: "Ακύρωση",
    checkout_comments: "Σχόλια",
    checkout_total: "Σύνολο:",
    checkout_temporary_save: "Προσωρινή Αποθήκευση",
    checkout_submit_order: "Αποστολή Παραγγελίας",
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
    [language]
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
    }),
    [language, setLanguage, t]
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
