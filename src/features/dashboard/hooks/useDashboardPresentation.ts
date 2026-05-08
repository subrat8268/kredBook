import { motion } from "@/src/utils/theme";
import { useEffect, useMemo, useRef, useState } from "react";
import { Animated } from "react-native";
import type { DashboardActivityItem, DashboardPerson } from "../types";

type Params = {
  toReceive: number;
  profile: { name?: string; business_name?: string };
  dashboardData: { totalCustomersCount?: number; total_customers_count?: number } | null | undefined;
  overdueCustomers: DashboardPerson[];
  recentActivity: DashboardActivityItem[];
};

export function useDashboardPresentation({
  toReceive,
  profile,
  dashboardData,
  overdueCustomers,
  recentActivity,
}: Params) {
  const animatedOutstanding = useRef(new Animated.Value(0)).current;
  const [displayOutstanding, setDisplayOutstanding] = useState(0);

  const totalOutstanding = useMemo(() => Number(toReceive ?? 0), [toReceive]);
  const businessName = useMemo(
    () => (profile.business_name || profile.name || "KredBook") as string,
    [profile.business_name, profile.name],
  );

  const totalCustomersCount = Number(
    dashboardData?.totalCustomersCount ?? dashboardData?.total_customers_count ?? 0,
  );

  const collectedThisMonth = useMemo(() => {
    const sum = (recentActivity ?? [])
      .filter((item) => item.type === "payment")
      .reduce((acc, item) => acc + Number(item.amount ?? 0), 0);
    return Number.isFinite(sum) ? sum : 0;
  }, [recentActivity]);

  const followUpPeople = useMemo(() => {
    return [...overdueCustomers].sort((a, b) => b.daysSince - a.daysSince).slice(0, 5);
  }, [overdueCustomers]);

  useEffect(() => {
    const listener = animatedOutstanding.addListener(({ value }) => {
      setDisplayOutstanding(Math.max(0, Math.round(value)));
    });

    Animated.timing(animatedOutstanding, {
      toValue: totalOutstanding,
      duration: motion.duration.slow,
      useNativeDriver: false,
    }).start();

    return () => {
      animatedOutstanding.removeListener(listener);
    };
  }, [animatedOutstanding, totalOutstanding]);

  return {
    businessName,
    totalOutstanding,
    displayOutstanding,
    totalCustomersCount,
    collectedThisMonth,
    followUpPeople,
  };
}
