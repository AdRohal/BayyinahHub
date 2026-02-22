import FeaturesSection from "@/components/FeaturesSection";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "المميزات - مركز البيّنة",
  description: "تعرف على المميزات والخدمات التي يقدمها مركز البيّنة للبحث في الأحاديث الصحيحة",
};

export default function FeaturesPage() {
  return (
    <main>
      <FeaturesSection />
    </main>
  );
}
