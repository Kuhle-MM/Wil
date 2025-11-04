import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  ImageBackground,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootTabParamList } from "./types";
import LecturerBottomNav from "./BottomNav.tsx";

type AuthRouteProp = RouteProp<RootTabParamList, "Auth">;
type AuthNavProp = NativeStackNavigationProp<RootTabParamList>;

const screenWidth = Dimensions.get("window").width;
const TIME_COLUMN_WIDTH = 80;
const DAY_COLUMN_WIDTH = (screenWidth - TIME_COLUMN_WIDTH - 40) / 5;

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

type Lesson = {
  lessonID: string;
  moduleCode: string;
  date: string;
};

const LecturersCalendar: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  const navigation = useNavigation<AuthNavProp>();
  const route = useRoute<AuthRouteProp>();
  const { role } = route.params ?? { role: "lecturer" }; // fallback

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

  const lessonsThisWeek = lessons.filter((lesson) => {
    const lessonDate = new Date(lesson.date);
    const weekDates = getWeekDates();
    return Object.values(weekDates).some(
      (d) => d.toDateString() === lessonDate.toDateString()
    );
  });

  const getLessonsMap = () => {
    const map: { [day: string]: (Lesson | null)[] } = {};
    weekdays.forEach((day) => {
      map[day] = Array(timeSlots.length).fill(null);
    });

    lessonsThisWeek.forEach((lesson) => {
      const lessonDateUTC = new Date(lesson.date);
      const lessonDate = new Date(lessonDateUTC.getTime() - 2 * 60 * 60 * 1000);
      const lessonWeekday = lessonDate.toLocaleDateString("en-GB", {
        weekday: "short",
      });
      if (!map[lessonWeekday]) return;

      const lessonHour = lessonDate.getHours();
      const lessonMin = lessonDate.getMinutes();
      const lessonTime = `${lessonHour.toString().padStart(2, "0")}:${lessonMin
        .toString()
        .padStart(2, "0")}`;
      const startSlotIndex = timeSlots.findIndex((slot) =>
        slot.startsWith(lessonTime)
      );

      if (startSlotIndex >= 0) {
        map[lessonWeekday][startSlotIndex] = lesson;
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
        <ActivityIndicator size="large" color="#6bbfe4" />
      </View>
    );
  }

  const weekDates = getWeekDates();
  const mondayDate = weekDates["Mon"];
  const fridayDate = weekDates["Fri"];
  const weekHeadingText = `${formatDay(mondayDate)} - ${formatDay(fridayDate)}`;

  return (
    <ImageBackground
      source={require("./assets/images/calendarBackground.jpg")}
      style={styles.backgroundImage}
      imageStyle={{ transform: [{ scale: 1 }] }}
    >
      <View style={styles.overlay}>
        <View style={styles.weekHeadingContainer}>
          <Text style={styles.weekHeadingText}>{weekHeadingText}</Text>
        </View>

        <ScrollView horizontal style={{ flex: 1 }}>
          <ScrollView>
            <View style={styles.tableContainer}>
              {/* Header Row */}
              <View style={{ flexDirection: "row" }}>
                <View style={[styles.timeCell, { width: TIME_COLUMN_WIDTH }]}>
                  <Text style={styles.timeHeaderText}>Time</Text>
                </View>
                {weekdays.map((day) => (
                  <View
                    key={day}
                    style={[styles.weekdayHeader, { width: DAY_COLUMN_WIDTH }]}
                  >
                    <Text style={styles.weekdayText}>{day}</Text>
                  </View>
                ))}
              </View>

              {/* Body Rows */}
              {timeSlots.map((time, rowIndex) => (
                <View key={time} style={{ flexDirection: "row" }}>
                  <View style={[styles.timeCell, { width: TIME_COLUMN_WIDTH }]}>
                    <Text style={styles.timeText}>{time}</Text>
                  </View>
                  {weekdays.map((day) => {
                    const lesson = lessonsMap[day][rowIndex];
                    return (
                      <View
                        key={`${day}-${rowIndex}`}
                        style={[
                          styles.dayCell,
                          lesson ? styles.lessonCell : null,
                          { width: DAY_COLUMN_WIDTH },
                        ]}
                      >
                        {lesson && (
                          <Text style={styles.lessonText}>
                            {lesson.moduleCode}
                          </Text>
                        )}
                      </View>
                    );
                  })}
                </View>
              ))}
            </View>
          </ScrollView>
        </ScrollView>
      </View>

      <LecturerBottomNav
        navigation={navigation}
        role={role as "student" | "lecturer" | "admin"}
      />
    </ImageBackground>
  );
};

export default LecturersCalendar;

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: "cover",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
  },
  weekHeadingContainer: {
    paddingVertical: 8,
    alignItems: "center",
  },
  weekHeadingText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#064f62ff",
  },
  tableContainer: {
    flexDirection: "column",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    marginHorizontal: 10,
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
    marginLeft: 20,
    marginTop:60
  },
  timeCell: {
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: "#aeacabff",
  },
  weekdayHeader: {
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: "#aeacabff",
    backgroundColor: "rgba(107, 191, 228, 0.3)",
  },
  weekdayText: {
    fontWeight: "bold",
    color: "#064f62ff",
  },
  timeHeaderText: {
    fontWeight: "bold",
    color: "#064f62ff",
  },
  timeText: {
    color: "#064f62ff",
    fontSize: 11,
  },
  dayCell: {
    minHeight: 50,
    borderWidth: 0.5,
    borderColor: "#aeacabff",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.6)",
  },
  lessonCell: {
    backgroundColor: "rgba(164, 201, 132, 0.85)",
    paddingHorizontal: 4,
  },
  lessonText: {
    fontSize: 11,
    color: "#064f62ff",
    fontWeight: "bold",
    textAlign: "center",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
