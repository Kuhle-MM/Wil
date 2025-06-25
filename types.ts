export type RootTabParamList = {
  Login: undefined;
  Auth: { role: 'student' };
  AuthLecturer: { role: 'lecturer' };
  AuthAdmin: { role: 'admin' };
  Main: { role: 'student' | 'lecturer' | 'admin'};
  MainLecturer: { role: 'student' | 'lecturer' | 'admin'};
  MainAdmin: { role: 'student' | 'lecturer' | 'admin'};
  Dashboard: undefined;
  Card: undefined;
  Report: undefined;
  ReportLecturer: undefined;
  CreateUser: { role: 'admin' };
  Calendar: undefined;
  LecturerCard: undefined;
  StudentAttendance: undefined;
  LecturerAttendance: undefined;
};