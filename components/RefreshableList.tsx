import { useRef } from "react";
import {
  FlatListProps,
  ListRenderItemInfo,
  PanResponder,
  StyleSheet,
  View,
} from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedProps,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";

const CIRCLE_LENGTH = 100;
const R = CIRCLE_LENGTH / (2 * Math.PI);

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface RefreshableListProps<T>
  extends Omit<
    FlatListProps<T>,
    "data" | "renderItem" | "onRefresh" | "scrollEventThrottle"
  > {
  data: T[];
  renderItem: (info: ListRenderItemInfo<T>) => React.ReactElement | null;
  onRefresh: (done: Function) => void;
  refreshing: boolean;
}

export function RefreshableList<T>({
  data,
  renderItem,
  refreshing,
  onRefresh,
  ...rest
}: RefreshableListProps<T>) {
  const scrollPosition = useSharedValue(0);
  const pullDownPosition = useSharedValue(0);
  const isReadyToRefresh = useSharedValue(false);

  const onPanRelease = () => {
    pullDownPosition.value = withTiming(isReadyToRefresh.value ? 75 : 0, {
      duration: 180,
    });

    if (isReadyToRefresh.value) {
      isReadyToRefresh.value = false;

      const onRefreshComplete = () => {
        pullDownPosition.value = withTiming(0, { duration: 180 });
      };

      onRefresh(onRefreshComplete);
    }
  };

  const panResponderRef = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        scrollPosition.value <= 0 && gestureState.dy >= 0,
      onPanResponderMove: (_, gestureState) => {
        const maxDistance = 80;
        pullDownPosition.value = Math.max(
          Math.min(maxDistance, gestureState.dy),
          0
        );

        if (
          pullDownPosition.value >= maxDistance / 2 &&
          isReadyToRefresh.value === false
        ) {
          isReadyToRefresh.value = true;
        }

        if (
          pullDownPosition.value < maxDistance / 2 &&
          isReadyToRefresh.value === true
        ) {
          isReadyToRefresh.value = false;
        }
      },
      onPanResponderRelease: onPanRelease,
      onPanResponderTerminate: onPanRelease,
    })
  );

  const animatedProps = useAnimatedProps(() => {
    const progress = interpolate(
      pullDownPosition.value * 6,
      [0, 420],
      [CIRCLE_LENGTH, 0],
      Extrapolation.CLAMP
    );

    return {
      strokeDashoffset: progress,
    };
  });

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollPosition.value = event.contentOffset.y;
    },
  });

  const pullDownStyles = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: pullDownPosition.value,
        },
      ],
    };
  });

  const refreshContainerStyles = useAnimatedStyle(() => {
    return {
      height: pullDownPosition.value,
      opacity: interpolate(
        pullDownPosition.value,
        [0, 80],
        [0, 1],
        Extrapolation.CLAMP
      ),
    };
  });

  return (
    <View
      pointerEvents={refreshing ? "none" : "auto"}
      style={styles.listContainer}
    >
      <Animated.View style={[styles.refreshContainer, refreshContainerStyles]}>
        <Svg width={100} height={100}>
          <Circle
            cx={50}
            cy={50}
            r={R}
            stroke="#eee"
            strokeWidth={10}
            fill="none"
          />
          <AnimatedCircle
            cx={50}
            cy={50}
            r={R}
            stroke="#cecece"
            strokeWidth={10}
            strokeDasharray={CIRCLE_LENGTH}
            strokeDashoffset={CIRCLE_LENGTH}
            animatedProps={animatedProps}
            strokeLinecap="round"
            fill="none"
          />
        </Svg>
      </Animated.View>
      <Animated.View
        style={pullDownStyles}
        {...panResponderRef.current.panHandlers}
      >
        <Animated.FlatList<T>
          data={data}
          renderItem={renderItem}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          {...rest}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    flex: 1,
    backgroundColor: "#e5e5e5",
  },
  refreshContainer: { backgroundColor: "#e5e5e5", alignItems: "center" },
});
