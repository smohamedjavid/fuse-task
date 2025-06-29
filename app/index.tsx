import { RefreshableList } from "@/components/RefreshableList";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import {
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";

const Card = () => (
  <View style={styles.itemContainer}>
    <View style={styles.avatar} />
    <View style={styles.placeholderContainer}>
      <View style={styles.placeholder} />
      <View style={[styles.placeholder, { width: 100 }]} />
    </View>
  </View>
);

export default function App() {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = (done: Function) => {
    setRefreshing(true);
    if (Platform.OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else if (Platform.OS === "android") {
      Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Drag_Start);
    }
    setTimeout(() => {
      setRefreshing(false);
      done();
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <RefreshableList<number>
        data={Array.from({ length: 20 }, (_, i) => i)}
        renderItem={() => <Card />}
        onRefresh={onRefresh}
        refreshing={refreshing}
      />
    </SafeAreaView>
  );
}

const CARD_BG = "#f5f5f5";
const PLACEHOLDER_BG = "#e5e5e5";

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: PLACEHOLDER_BG,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  itemContainer: {
    height: 100,
    backgroundColor: CARD_BG,
    marginVertical: 12,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
  },
  avatar: {
    width: 60,
    backgroundColor: PLACEHOLDER_BG,
    borderRadius: 18,
  },
  placeholderContainer: {
    marginLeft: 16,
    marginTop: 8,
    flexDirection: "column",
  },
  placeholder: {
    height: 20,
    width: 150,
    backgroundColor: PLACEHOLDER_BG,
    borderRadius: 18,
    marginBottom: 8,
  },
});
