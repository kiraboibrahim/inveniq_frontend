import { PageHeader } from "@/components/layout/page-header";
import { SettingsTabs } from "@/components/features/settings/settings-tabs";

export default function Settings() {
  return (
    <>
      <PageHeader 
        title="Settings" 
        breadcrumbs={[{ label: "AIMS" }, { label: "Settings" }]}
      />
      <div className="flex flex-col gap-6">
        <SettingsTabs />
      </div>
    </>
  );
}
