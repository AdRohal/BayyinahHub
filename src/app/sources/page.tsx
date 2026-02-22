import SourcesSection from "@/components/SourcesSection";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "المصادر المعتمدة - مركز البيّنة",
  description: "تعرف على المصادر الموثوقة والموثوقة التي يعتمد عليها مركز البيّنة",
};

export default function SourcesPage() {
  return (
    <main>
      <SourcesSection />
    </main>
  );
}
