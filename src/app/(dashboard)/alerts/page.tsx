import { PageHeader } from "@/components/layout/page-header";
import { AlertFeedList } from "@/components/features/alerts/alert-feed-list";

export default function Alerts() {
    return (
        <>
            <PageHeader
                title="System Alerts"
                breadcrumbs={[{ label: "AIMS" }, { label: "Alerts" }]}
            />
            <div className="flex flex-col gap-6 w-full pb-12">
                <AlertFeedList />
            </div>
        </>
    );
}