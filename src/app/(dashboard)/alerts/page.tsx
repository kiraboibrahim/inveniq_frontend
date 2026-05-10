import { PageHeader } from "@/components/layout/page-header";
import { AlertFeedList } from "@/components/features/alerts/alert-feed-list";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export default function Alerts() {
  return (
    <>
      <PageHeader 
        title="System Alerts" 
        breadcrumbs={[{ label: "AIMS" }, { label: "Alerts" }]}
        action={
          <Button variant="outline" className="border-border-strong text-text-secondary hover:text-text-primary hover:bg-bg-elevated">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Mark All Read
          </Button>
        }
      />
      <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
        <AlertFeedList />
      </div>
    </>
  );
}
