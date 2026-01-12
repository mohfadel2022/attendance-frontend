// services/attendance.service.ts
import { Attendance } from "@/lib/types";
import { apiFetch } from "@/lib/api";

export const attendanceService = {
  async getAll(): Promise<Attendance[]> {
    const res = await apiFetch(`/attendance`, {
      cache: "no-store",
    });

    if (!res.ok) {
      if (res.status === 401) throw new Error("UNAUTHORIZED");
      throw new Error("FETCH_FAILED");
    }

    return res.json();
  },
};
