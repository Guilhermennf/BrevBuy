import SmartResellCalculator from "@/components/smart-resell";

export default function Page() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Smart Resell Price</h1>
          <p className="text-muted-foreground">
            Calcule preços competitivos baseados em análise inteligente de mercado
          </p>
        </div>
      </div>
      
      <SmartResellCalculator />
    </div>
  );
}