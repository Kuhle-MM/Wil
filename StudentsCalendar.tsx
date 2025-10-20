import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Time slots
const timeSlots = [
  { start: "08:20", end: "09:10" },
  { start: "09:20", end: "10:10" },
  { start: "10:20", end: "11:10" },
  { start: "11:20", end: "12:00" },
  { start: "12:00", end: "13:00" },
  { start: "13:00", end: "13:50" },
  { start: "14:00", end: "14:50" },
  { start: "15:00", end: "15:40" },
  { start: "15:50", end: "16:40" },
];

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const TIME_COLUMN_WIDTH = 60.5;
const DAY_COLUMN_WIDTH = 70;

type Lesson = {
  lessonID: string;
  moduleCode: string;
  date: string; // ISO date in UTC
  durationMinutes?: number;
};

const StudentsCalendar: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const session = await AsyncStorage.getItem("userSession");
        if (!session) return;
        const user = JSON.parse(session);
        const studentId = user.studentNumber;

        const response = await fetch(
          `https://varsitytrackerapi20250619102431-b3b3efgeh0haf4ge.uksouth-01.azurewebsites.net/Lesson/student_timetable/${studentId.toUpperCase()}`
        );

        if (!response.ok) throw new Error("Failed to fetch timetable");

        const data: Lesson[] = await response.json();
        setLessons(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTimetable();
  }, []);

  // Get Monday and Friday of current week
  const getWeekRange = (date: Date) => {
    const day = date.getDay(); // 0 = Sun, 1 = Mon
    const diffToMon = (day + 6) % 7;
    const monday = new Date(date);
    monday.setDate(date.getDate() - diffToMon);
    monday.setHours(0, 0, 0, 0);

    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);
    friday.setHours(23, 59, 59, 999);

    return { monday, friday };
  };

  // Format date like "13 Oct"
  const formatDateSimple = (date: Date) => {
    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const day = date.getDate();
    const month = monthNames[date.getMonth()];
    return `${day} ${month}`;
  };

  // Convert HH:MM to minutes
  const toMinutes = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };

  // Convert UTC string to SA Date object (UTC+2)
  const getLessonSA = (utcDate: string) => {
    const lessonUTC = new Date(utcDate);
    const year = lessonUTC.getUTCFullYear();
    const month = lessonUTC.getUTCMonth();
    const day = lessonUTC.getUTCDate();
    const hours = lessonUTC.getUTCHours();
    const minutes = lessonUTC.getUTCMinutes();
    const seconds = lessonUTC.getUTCSeconds();

    return new Date(year, month, day, hours, minutes, seconds);
  };

  // Get lesson for a specific slot and day
  const getLessonForSlot = (day: string, slot: { start: string; end: string }) => {
    const { monday, friday } = getWeekRange(new Date());
    const slotStartMinutes = toMinutes(slot.start);
    const slotEndMinutes = toMinutes(slot.end);

    return lessons.find((lesson) => {
      const lessonSA = getLessonSA(lesson.date);

      if (lessonSA < monday || lessonSA > friday) return false;

      const lessonWeekday = lessonSA.toLocaleDateString("en-US", { weekday: "short" });
      if (lessonWeekday !== day) return false;

      const lessonStartMinutes = lessonSA.getHours() * 60 + lessonSA.getMinutes();
      return lessonStartMinutes >= slotStartMinutes && lessonStartMinutes < slotEndMinutes;
    });
  };

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );

  const { monday, friday } = getWeekRange(new Date());
  const weekHeading = `${formatDateSimple(monday)} - ${formatDateSimple(friday)}`;

  return (
    <View style={{ flex: 1 }}>
      {/* Week heading */}
      <View style={styles.weekHeadingContainer}>
        <Text style={styles.weekHeadingText}>{weekHeading}</Text>
      </View>

      {/* Calendar */}
      <ScrollView horizontal style={{ flex: 1 }}>
        <View style={{ flexDirection: "column" }}>
          {/* Header row */}
          <View style={{ flexDirection: "row" }}>
            <View style={[styles.timeCell, { width: TIME_COLUMN_WIDTH }]}>
              <Text style={{ fontWeight: "bold" }}>Time</Text>
            </View>
            {weekdays.map((day) => (
              <View key={day} style={[styles.weekdayHeader, { width: DAY_COLUMN_WIDTH }]}>
                <Text style={{ fontWeight: "bold", color: "#007bff" }}>{day}</Text>
              </View>
            ))}
          </View>

          {/* Time rows */}
          <View style={{ flexDirection: "row" }}>
            {/* Time column */}
            <View>
              {timeSlots.map((slot) => (
                <View key={slot.start} style={[styles.timeCell, { width: TIME_COLUMN_WIDTH }]}>
                  <Text>{`${slot.start} - ${slot.end}`}</Text>
                </View>
              ))}
            </View>

            {/* Day columns */}
            {weekdays.map((day) => (
              <View key={day} style={styles.dayColumn}>
                {timeSlots.map((slot) => {
                  const lesson = getLessonForSlot(day, slot);
                  return (
                    <View key={`${day}-${slot.start}`} style={styles.dayCell}>
                      {lesson && <Text style={styles.lessonText}>{lesson.moduleCode}</Text>}
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default StudentsCalendar;

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  weekHeadingContainer: {
    padding: 10,
    alignItems: "center",
  },
  weekHeadingText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007bff",
  },
  timeCell: {
    height: 50,
    justifyContent: "center",
    paddingLeft: 10,
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: "#333",
  },
  weekdayHeader: {
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: "#333",
  },
  dayColumn: { flexDirection: "column" },
  dayCell: {
    width: DAY_COLUMN_WIDTH,
    height: 50,
    borderWidth: 0.5,
    borderColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
  lessonText: { fontSize: 12, color: "#004085", fontWeight: "600", textAlign: "center" },
});
