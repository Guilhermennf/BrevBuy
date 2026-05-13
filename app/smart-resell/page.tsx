import SmartResellCalculator from "@/components/smart-resell";

export default function Page() {
  return (
    <main className="min-h-screen w-full px-4 py-8 md:px-8 lg:px-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-semibold tracking-tight mb-2">Smart Resell Price Suggestion</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Calculate a competitive selling price based on your cost and desired profit.
        </p>
        <SmartResellCalculator />
      </div>
    </main>
  );
}