// utils/attendance.utils.ts
import { Attendance } from "@/lib/types";
import { useI18n } from "@/app/i18n";
import { formatTimeDiff } from "@/lib/format-time-diff";


export const getDailyRecords = (attendance: Attendance[], t: (key: string) => string) => {
  const dailyRecords: any[] = [];
  const userMap = new Map<number, any>();

  attendance.forEach((a) => {
    if (a.userId && a.user && !userMap.has(a.userId)) {
      userMap.set(a.userId, { userId: a.userId, ...a.user });
    }
  });

  userMap.forEach((user) => {
    const userRecords = attendance.filter((a) => a.userId === user.userId);
    const dateMap = new Map<string, Attendance[]>();

    userRecords.forEach((record) => {
      const date = new Date(record.timestamp).toLocaleDateString();
      if (!dateMap.has(date)) dateMap.set(date, []);
      dateMap.get(date)!.push(record);
    });

    dateMap.forEach((records, date) => {
      const sorted = [...records].sort(
        (a, b) => +new Date(a.timestamp) - +new Date(b.timestamp)
      );

      const firstIn = sorted.find(r => r.type === "CHECK_IN");
      const lastOut = [...sorted].reverse().find(r => r.type === "CHECK_OUT");

      let timeDiff = "-";
      if (firstIn && lastOut) {
        // const diff = +new Date(lastOut.timestamp) - +new Date(firstIn.timestamp);
        // const h = Math.floor(diff / 3600000);
        // const m = Math.floor((diff % 3600000) / 60000);
        // timeDiff = `${h}h ${m}m`;
        timeDiff = formatTimeDiff(firstIn.timestamp, lastOut.timestamp, t);
      }

      dailyRecords.push({
        user,
        date,
        checkInTime: firstIn ? new Date(firstIn.timestamp).toLocaleTimeString() : "-",
        checkOutTime: lastOut ? new Date(lastOut.timestamp).toLocaleTimeString() : "-",
        timeDiff,
        dateObj: firstIn ? new Date(firstIn.timestamp) : new Date(),
      });
    });
  });

  return dailyRecords.sort(
    (a, b) => b.dateObj.getTime() - a.dateObj.getTime()
  );
};
