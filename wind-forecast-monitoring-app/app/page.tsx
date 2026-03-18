import { subDays } from "date-fns";
import HomePage from "@/components/HomePage";

export default function Page() {
  const now = new Date();
  const initialEndIso = now.toISOString();
  const initialStartIso = subDays(now, 7).toISOString();

  return (
    <HomePage
      initialEndIso={initialEndIso}
      initialStartIso={initialStartIso}
    />
  );
}
