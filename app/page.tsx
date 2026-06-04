import { getAllRecords } from "./actions/records";
import { getCurrentSession } from "./lib/dal";
import DashboardClient from "./components/DashboardClient";

export default async function Dashboard() {
  const session = await getCurrentSession();
  const records = await getAllRecords();
  return (
    <DashboardClient
      initialRecords={records}
      role={session?.role ?? null}
      userName={session?.name ?? null}
    />
  );
}
