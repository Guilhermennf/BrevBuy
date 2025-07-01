import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function StatsCardsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="h-4 w-24 bg-muted rounded animate-pulse" />
            <div className="h-4 w-4 bg-muted rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="h-8 w-32 bg-muted rounded animate-pulse" />
            <div className="h-4 w-40 bg-muted rounded animate-pulse mt-2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
