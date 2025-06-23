"use client";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import data from "./data.json";

export default function Page() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* Dashboard Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Dashboard
            </h1>
            {/* You can add dashboard stats or icons here if needed */}
          </div>
          {/* Section Cards */}
          <SectionCards />
          {/* Chart Area */}
          <div className="px-4 lg:px-6">
            <ChartAreaInteractive />
          </div>
          {/* Data Table */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Overview Table
            </h2>
            <DataTable data={data} />
          </div>
        </div>
      </div>
    </div>
  );
}
