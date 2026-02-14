import Image from "next/image";

export default function Logo({ className = "", size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: { icon: 32, text: "text-lg" },
    md: { icon: 44, text: "text-xl" },
    lg: { icon: 64, text: "text-3xl" },
  };
  const s = sizes[size];

  return (
    <div className={`flex items-center gap-3 ${className}`} suppressHydrationWarning>
      {/* Logo icon */}
      <Image
        src="/logos/logo.png"
        alt="Bayyinah Hub Logo"
        width={s.icon}
        height={s.icon}
        className="object-contain"
      />
      <div className="flex flex-col leading-tight">
        <span className={`font-bold text-gold ${s.text}`}>مركز البيّنة</span>
        <span className="text-xs tracking-wider text-gold/70 font-medium" style={{ direction: "ltr", textAlign: "right" }}>
          Bayyinah Hub
        </span>
      </div>
    </div>
  );
}
