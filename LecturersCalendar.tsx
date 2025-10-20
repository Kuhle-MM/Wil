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

// Weekdays (Mon-Fri)
const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri"];

// Column widths
const TIME_COLUMN_WIDTH = 60.5;
const DAY_COLUMN_WIDTH = 70;

type Lesson = {
  lessonID: string;
  moduleCode: string;
  date: string; // ISO date string
};

const LecturersCalendar: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch timetable from API
  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const session = await AsyncStorage.getItem("userSession");
        if (!session) return;
        const user = JSON.parse(session);
        const lecturerId = user.studentNumber;

        const response = await fetch(
          `https://varsitytrackerapi20250619102431-b3b3efgeh0haf4ge.uksouth-01.azurewebsites.net/Lesson/lecturer_timetable/${lecturerId}`
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

  // Determine this week's Mon-Fri dates
  const getWeekDates = (): { [key: string]: Date } => {
    const today = new Date();
    const day = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - day + 1);
    monday.setHours(0, 0, 0, 0);

    const weekDates: { [key: string]: Date } = {};
    weekdays.forEach((dayName, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);
      weekDates[dayName] = date;
    });

    return weekDates;
  };

  // Filter lessons for this week only
  const lessonsThisWeek = lessons.filter((lesson) => {
    const lessonDate = new Date(lesson.date);
    const weekDates = getWeekDates();
    return Object.values(weekDates).some(
      (d) => d.toDateString() === lessonDate.toDateString()
    );
  });

  // Match lesson to a slot by weekday + time
  const getLessonForSlot = (day: string, slotTime: string) => {
    const [slotStart, slotEnd] = slotTime.split(" - ").map(t => t.split(":").map(Number));
    const slotStartTotalMin = slotStart[0] * 60 + slotStart[1];
    const slotEndTotalMin = slotEnd[0] * 60 + slotEnd[1];

    return lessonsThisWeek.find((lesson) => {
      const lessonDate = new Date(lesson.date);
      const lessonWeekday = lessonDate.toLocaleDateString("en-US", { weekday: "short" });
      const lessonTotalMin = lessonDate.getHours() * 60 + lessonDate.getMinutes();

      return lessonWeekday === day && lessonTotalMin >= slotStartTotalMin && lessonTotalMin < slotEndTotalMin;
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  const { monday, friday } = getWeekRange(new Date());
  const weekHeading = `${formatDateSimple(monday)} - ${formatDateSimple(friday)}`;

  return (
    <View style={{ flex: 1 }}>
      {/* Week heading */}
      <View style={styles.weekHeadingContainer}>
        <Text style={styles.weekHeadingText}>{weekHeading}</Text>
      </View>

      <ScrollView horizontal style={{ flex: 1 }}>
        <View style={{ flexDirection: "column" }}>
          {/* Weekday header row */}
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

          {/* Time rows with day columns */}
          <View style={{ flexDirection: "row" }}>
            {/* Time column */}
            <View>
              {timeSlots.map((time) => (
                <View key={time} style={[styles.timeCell, { width: TIME_COLUMN_WIDTH }]}>
                  <Text>{time}</Text>
                </View>
              ))}
            </View>

            {/* Day columns */}
            {weekdays.map((day) => (
              <View key={day} style={styles.dayColumn}>
                {timeSlots.map((time) => {
                  const lesson = getLessonForSlot(day, time);
                  return (
                    <View key={`${day}-${time}`} style={styles.dayCell}>
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

export default LecturersCalendar;

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  weekHeadingContainer: { padding: 10, alignItems: "center" },
  weekHeadingText: { fontSize: 16, fontWeight: "bold", color: "#007bff" },
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