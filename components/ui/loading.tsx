import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

type LoadingProps = {
  label?: string;
  fullPage?: boolean;
};

export default function Loading({
  label = "Loading…",
  fullPage = false,
}: LoadingProps) {
  return (
    <div
      className={
        fullPage
          ? "min-h-[60vh] flex items-center justify-center"
          : "w-full"
      }
    >
      <Card className="border border-slate-200/70 shadow-none rounded-2xl bg-app-card">
        <CardContent className="flex flex-col items-center justify-center gap-4 px-8 py-10">
          <Spinner size={36} />
          <span className="text-base text-slate-500">{label}</span>
        </CardContent>
      </Card>
    </div>
  );
}
