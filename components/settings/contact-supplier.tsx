"use client";

import { useState } from "react";

interface Props {
    open: boolean;
    onClose: () => void;
    supplierUID: string;
}

export default function ContactSupplier({
    open,
    onClose,
    supplierUID,
}: Props) {
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    if (!open) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setLoading(true);

        await fetch(`/api/suppliers/${supplierUID}/contact`, {
            method: "POST",
            body: JSON.stringify({
                subject,
                message,
            }),
            headers: {
                "Content-Type": "application/json",
            },
        });

        setLoading(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl w-full max-w-lg p-6">

                <h2 className="text-lg font-semibold mb-4">
                    Επικοινωνία με τον προμηθευτή
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">

                    <input
                        className="w-full border rounded p-2"
                        placeholder="Θέμα"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                    />

                    <textarea
                        className="w-full border rounded p-2 h-32"
                        placeholder="Πληκτρολογήστε το μήνυμά σας εδώ..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />

                    <div className="flex justify-end gap-2 pt-2">

                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border rounded-full"
                        >
                            Ακύρωση
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-brand-600 rounded-full text-white rounded"
                        >
                            {loading ? "Αποστολή..." : "Αποστολή"}
                        </button>

                    </div>

                </form>
            </div>
        </div>
    );
}