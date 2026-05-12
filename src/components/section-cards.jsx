import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * SectionCards
 *
 * Accepts a `data` prop with shape:
 * {
 *   totalJobs: number,
 *   totalApplications: number,
 *   activeJobs: number,
 *   selectionRate: number,   // percentage e.g. 4.5
 *   hiredCount: number,
 *   shortlistedCount: number,
 * }
 *
 * Falls back to zeros when data is not yet loaded.
 */
export function SectionCards({ data = {} }) {
  const {
    totalJobs = 0,
    totalApplications = 0,
    activeJobs = 0,
    selectionRate = 0,
    hiredCount = 0,
    shortlistedCount = 0,
  } = data;

  const cards = [
    {
      label: "Total Jobs",
      value: totalJobs.toLocaleString(),
      trend: "up",
      badge: `${activeJobs} active`,
      footer: "All jobs posted",
      sub: `${activeJobs} currently open`,
    },
    {
      label: "Total Applications",
      value: totalApplications.toLocaleString(),
      trend: totalApplications > 0 ? "up" : "down",
      badge: `${shortlistedCount} shortlisted`,
      footer: "Applications received",
      sub: `${shortlistedCount} candidates shortlisted`,
    },
    {
      label: "Active Jobs",
      value: activeJobs.toLocaleString(),
      trend: activeJobs > 0 ? "up" : "down",
      badge: activeJobs > 0 ? "Open" : "None",
      footer: "Currently hiring",
      sub: "Accepting new applications",
    },
    {
      label: "Selection Rate",
      value: `${selectionRate}%`,
      trend: selectionRate >= 5 ? "up" : "down",
      badge: `${hiredCount} hired`,
      footer: selectionRate >= 5 ? "Above target" : "Below target",
      sub: `${hiredCount} offers accepted`,
    },
  ];

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label} className="@container/card">
          <CardHeader>
            <CardDescription>{card.label}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {card.value}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                {card.trend === "up" ? (
                  <IconTrendingUp className="mr-1" />
                ) : (
                  <IconTrendingDown className="mr-1" />
                )}
                {card.badge}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              {card.footer}
              {card.trend === "up" ? (
                <IconTrendingUp className="size-4" />
              ) : (
                <IconTrendingDown className="size-4" />
              )}
            </div>
            <div className="text-muted-foreground">{card.sub}</div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
