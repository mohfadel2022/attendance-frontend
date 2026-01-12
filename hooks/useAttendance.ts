// hooks/useAttendance.ts
import { useEffect, useState } from "react";
import { Attendance } from "@/lib/types";
import { attendanceService } from "@/services/attendance.service";

export const useAttendance = () => {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const data = await attendanceService.getAll();
      setAttendance(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  return {
    attendance,
    loading,
    refetch: fetchAttendance,
  };
};
