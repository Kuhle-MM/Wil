export type RootTabParamList = {
  Login: undefined;
  Auth: { role: 'student' };
  AuthLecturer: { role: 'lecturer' };
  Main: { role: 'student' | 'lecturer' };
  MainLecturer: { role: 'student' | 'lecturer' };
  Dashboard: undefined;
  Card: undefined;
  Report: undefined;
  Calendar: undefined;
  LecturerCard: undefined;
};