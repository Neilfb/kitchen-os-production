"use client";

import { useState } from "react";
import { Restaurant } from "@/hooks/useRestaurants";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";

interface RestaurantExportProps {
  restaurants: Restaurant[];
  filename?: string;
}

export function RestaurantExport({ restaurants, filename = "restaurants" }: RestaurantExportProps) {
  const [exporting, setExporting] = useState(false);

  const exportToCSV = () => {
    if (restaurants.length === 0) {
      alert("No restaurant data to export");
      return;
    }

    setExporting(true);

    try {
      // Define columns to include in export
      const columns = [
        "id", 
        "name", 
        "address", 
        "contact", 
        "cuisine", 
        "status",
        "createdAt",
        "updatedAt"
      ];
      
      // Create CSV header
      const header = columns.join(",");
      
      // Create CSV rows from restaurant data
      const rows = restaurants.map(restaurant => {
        return columns.map(column => {
          const value = restaurant[column as keyof Restaurant];
          
          // Handle undefined values
          if (value === undefined) return "";
          
          // Wrap values containing commas in quotes
          if (typeof value === "string" && value.includes(",")) {
            return `"${value}"`;
          }
          
          return value;
        }).join(",");
      });
      
      // Combine header and rows
      const csv = [header, ...rows].join("\n");
      
      // Create download link
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      
      // Set filename with date
      const date = new Date().toISOString().split("T")[0];
      const exportFilename = `${filename}_${date}.csv`;
      
      // Configure and trigger download
      link.href = url;
      link.setAttribute("download", exportFilename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error exporting restaurants to CSV:", error);
      alert("Error exporting data. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <Button 
      onClick={exportToCSV}
      disabled={exporting || restaurants.length === 0}
      variant="outline"
      size="sm"
    >
      {exporting ? (
        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Icons.fileText className="mr-2 h-4 w-4" />
      )}
      Export to CSV
    </Button>
  );
}
