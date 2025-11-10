export type RootTabParamList = {
  Login: undefined;
  Auth: { role: 'student' | 'lecturer' | 'admin' };
  Main: { role: 'student' | 'lecturer' | 'admin' 
    lessonID?: string;      
    studentNumber?: string;
  };
  MainLecturer: { role: 'student' | 'lecturer' | 'admin' };
  MainAdmin: { role: 'student' | 'lecturer' | 'admin' };
  Dashboard: undefined;
  Card: undefined;
  Report: { role: 'student' | 'lecturer' | 'admin' };
  ReportLecturer: undefined;
  CreateUser: { role: 'student' | 'lecturer' | 'admin' };
  CreateModule: { role: 'student' | 'lecturer' | 'admin' };
  Calendar: { role: 'student' | 'lecturer' | 'admin' };
  LecturerCard: undefined;
  StudentAttendance: { role: 'student' | 'lecturer' | 'admin' };
  LecturerAttendance: undefined;
  StudentModules: { role: 'student' | 'lecturer' | 'admin' };
  LecturerModules: { role: 'student' | 'lecturer' | 'admin' };
  LecturerLessons: { role: 'student' | 'lecturer' | 'admin' };
  CreateLesson: { role: 'student' | 'lecturer' | 'admin' };
  LessonActivity: { role: 'student' | 'lecturer' | 'admin' };
  LessonReports: { role: 'lecturer' };
  Modules: { role: 'student' | 'lecturer' | 'admin' };
  Settings: { role: 'student' | 'lecturer' | 'admin' };
  BottomNav: { role: 'student' | 'lecturer' | 'admin' };
  BLEReceiver: {
    lessonID: string;
    studentNumber: string;
  };

  QrCamera: {
    role: 'student' | 'lecturer' | 'admin';
    studentNumber: string; // This line fixes your errors
  };

  // Added missing routes from your App.tsx
  TermsAndConditions: undefined;
  About: undefined;
  ChangeStudentPassword: { role: 'student' | 'lecturer' | 'admin' };
  ChangeLecturerPassword: { role: 'student' | 'lecturer' | 'admin' };
};