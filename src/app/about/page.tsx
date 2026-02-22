import AboutSection from "@/components/AboutSection";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "عن المركز - مركز البيّنة",
  description: "تعرف على مركز البيّنة ورسالته في نشر أحاديث النبي صلى الله عليه وسلم بطريقة موثوقة",
};

export default function AboutPage() {
  return (
    <main>
      <AboutSection />
    </main>
  );
}
