import AsyncStorage from "@react-native-async-storage/async-storage";
import type { KalamCategory } from "@/src/types";

export type CategoryReport = {
  kalamId: string;
  currentCategory: KalamCategory;
  suggestedCategory: KalamCategory;
  note: string;
  createdAt: string;
};

const STORAGE_KEY = "kalam-category-reports";

// Local queue for now; replace this implementation with Appwrite later.
export async function queueCategoryReport(report: CategoryReport) {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  const reports: CategoryReport[] = stored ? JSON.parse(stored) : [];
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([report, ...reports]));
}
