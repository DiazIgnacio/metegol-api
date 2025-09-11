import { useEffect, useState } from "react";
import type { LineupTeam } from "@/types/match";

export function useLineups(fixtureId: number, homeId: number, awayId: number) {
  const [lineups, setLineups] = useState<LineupTeam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!fixtureId || !homeId || !awayId) return;

    async function fetchLineups() {
      try {
        const res = await fetch(
          `/api/lineups?fixture=${fixtureId}&home=${homeId}&away=${awayId}`
        );
        const data = await res.json();
        setLineups(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Error fetching lineups:", e);
        setLineups([]);
      } finally {
        setLoading(false);
      }
    }

    fetchLineups();
  }, [fixtureId, homeId, awayId]);

  return { lineups, loading };
}
