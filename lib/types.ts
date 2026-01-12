export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
  code: string;
  createdAt: string;
  theme: string;
  lang: string;
  attendance?: Attendance[];
}
export type Attendance = {
  id: number;
  type: "CHECK_IN" | "CHECK_OUT";
  timestamp: string;
  status?: string;
  userId?: number;
  user?: User;
};

