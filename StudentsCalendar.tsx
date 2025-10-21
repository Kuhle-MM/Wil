import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Times for the time column
const timeSlots = [
  "08:20 - 09:10",
  "09:20 - 10:10",
  "10:20 - 11:10",
  "11:20 - 12:00",
  "12:00 - 13:00",
  "13:00 - 13:50",
  "14:00 - 14:50",
  "15:00 - 15:40",
  "15:50 - 16:40",
];

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const TIME_COLUMN_WIDTH = 60.5;
const DAY_COLUMN_WIDTH = 70;

type Lesson = {
  lessonID: string;
  moduleCode: string;
  date: string; // ISO date string
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

  const getWeekDates = (): { [key: string]: Date } => {
    const today = new Date();
    const day = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - day + 1);
    monday.setHours(0, 0, 0, 0);

    const weekDates: { [key: string]: Date } = {};
    weekdays.forEach((dayName, idx) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + idx);
      weekDates[dayName] = date;
    });

    return weekDates;
  };

  const lessonsThisWeek = lessons.filter((lesson) => {
    const lessonDate = new Date(lesson.date);
    const weekDates = getWeekDates();
    return Object.values(weekDates).some(
      (d) => d.toDateString() === lessonDate.toDateString()
    );
  });

  // Map day → slotIndex → lesson
  const getLessonsMap = () => {
    const map: { [day: string]: (Lesson | null)[] } = {};
    weekdays.forEach((day) => {
      map[day] = Array(timeSlots.length).fill(null);
    });

    lessonsThisWeek.forEach((lesson) => {
      const lessonDateUTC = new Date(lesson.date);
      const lessonDate = new Date(lessonDateUTC.getTime() - 2 * 60 * 60 * 1000); // UTC → SA
      const lessonWeekday = lessonDate.toLocaleDateString("en-GB", { weekday: "short" });
      if (!map[lessonWeekday]) return;

      // Determine start slot
      const lessonHour = lessonDate.getHours();
      const lessonMin = lessonDate.getMinutes();
      const lessonTime = `${lessonHour.toString().padStart(2, "0")}:${lessonMin.toString().padStart(2, "0")}`;
      const startSlotIndex = timeSlots.findIndex((slot) => slot.startsWith(lessonTime));

      if (startSlotIndex >= 0) {
        // Assume every lesson spans 2 slots
        map[lessonWeekday][startSlotIndex] = lesson;
        if (startSlotIndex + 1 < timeSlots.length) {
          map[lessonWeekday][startSlotIndex + 1] = { ...lesson, lessonID: lesson.lessonID + "_spanned" };
        }
      }
    });

    return map;
  };

  const lessonsMap = getLessonsMap();

  const formatDay = (date: Date) => {
    const day = date.getDate();
    if (day === 1 || day === 21 || day === 31) return `${day}st`;
    if (day === 2 || day === 22) return `${day}nd`;
    if (day === 3 || day === 23) return `${day}rd`;
    return `${day}th`;
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  const weekDates = getWeekDates();
  const mondayDate = weekDates["Mon"];
  const fridayDate = weekDates["Fri"];
  const weekHeadingText = `${formatDay(mondayDate)} - ${formatDay(fridayDate)}`;

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.weekHeadingContainer}>
        <Text style={styles.weekHeadingText}>{weekHeadingText}</Text>
      </View>

      <ScrollView horizontal style={{ flex: 1 }}>
        <View style={{ flexDirection: "column" }}>
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

          <View style={{ flexDirection: "row" }}>
            <View>
              {timeSlots.map((time) => (
                <View key={time} style={[styles.timeCell, { width: TIME_COLUMN_WIDTH }]}>
                  <Text>{time}</Text>
                </View>
              ))}
            </View>

            {weekdays.map((day) => (
              <View key={day} style={styles.dayColumn}>
                {timeSlots.map((_, slotIndex) => {
                  const lesson = lessonsMap[day][slotIndex];
                  if (!lesson) return <View key={slotIndex} style={styles.dayCell} />;

                  const isStart = !lesson.lessonID.endsWith("_spanned");
                  if (!isStart) return null;

                  return (
                    <View
                      key={slotIndex}
                      style={[styles.dayCell, { minHeight: 50, height: 50 * 2, backgroundColor: "#d1ecf1" }]}
                    >
                      <Text style={styles.lessonText}>{lesson.moduleCode}</Text>
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
  weekHeadingContainer: { padding: 10, alignItems: "center" },
  weekHeadingText: { fontSize: 16, fontWeight: "bold", color: "#007bff" },
  timeCell: { height: 50, justifyContent: "center", paddingLeft: 10, alignItems: "center", borderWidth: 0.5, borderColor: "#333" },
  weekdayHeader: { height: 50, justifyContent: "center", alignItems: "center", borderWidth: 0.5, borderColor: "#333" },
  dayColumn: { flexDirection: "column" },
  dayCell: { width: DAY_COLUMN_WIDTH, minHeight: 50, borderWidth: 0.5, borderColor: "#333", justifyContent: "center", alignItems: "center", paddingVertical: 2 },
  lessonText: { fontSize: 12, color: "#004085", fontWeight: "600", textAlign: "center", marginVertical: 2 },
});
