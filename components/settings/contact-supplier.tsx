"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "@/lib/i18n";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSupplierContact } from "@/hooks/useSupplierContact";

interface Props {
  open: boolean;
  onClose: () => void;
  supplierUID: string;
}

export default function ContactSupplier({ open, onClose, supplierUID }: Props) {
  const { t } = useTranslation();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const contactMutation = useSupplierContact({
    onSuccess: () => {
      toast.success(t("settings_contact_success"));
      onClose();
      setSubject("");
      setMessage("");
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, t("suppliers_error"))),
  });

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    contactMutation.mutate({
      supplierUID,
      subject,
      message,
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("settings_contact_supplier")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <Input
            placeholder={t("settings_contact_subject")}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="placeholder:text-sm"
          />
          <Textarea
            placeholder={t("settings_contact_message_placeholder")}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-32 placeholder:text-sm"
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              {t("checkout_date_cancel")}
            </Button>
            <Button type="submit" disabled={contactMutation.isPending}>
              {contactMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  {t("settings_contact_sending")}
                </>
              ) : (
                t("settings_contact_send")
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
