import { Card, CardContent } from "@/components/ui/card";

export function ProductListSkeleton() {
  return (
    <div className="grid gap-4 grid-cols-1">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="p-4">
          <CardContent className="p-0">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-20 h-20 bg-muted rounded-lg animate-pulse" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-5 w-32 bg-muted rounded animate-pulse" />
                  <div className="h-5 w-20 bg-muted rounded-full animate-pulse" />
                  <div className="h-5 w-24 bg-muted rounded-full animate-pulse" />
                </div>
                <div className="h-4 w-3/4 bg-muted rounded animate-pulse mb-3" />
                <div className="flex items-center gap-4">
                  <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                </div>
                <div className="mt-3">
                  <div className="h-3 w-48 bg-muted rounded animate-pulse" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
