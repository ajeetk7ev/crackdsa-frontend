import crackdsaLogoCropped from "@/assets/crackdsa-logo-cropped.png";
import crackdsaLogoDark from "@/assets/crackdsa-logo-dark.png";
import crackdsaIcon from "@/assets/crackdsa-icon.png";
import crackdsaIconDark from "@/assets/crackdsa-icon-dark.png";
import { useThemeStore } from "@/stores/theme.store";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: number;
  textColorClass?: string;
}

export function Logo({ className = "", iconOnly = false, size = 32, textColorClass = "text-foreground" }: LogoProps) {
  const { theme } = useThemeStore();
  const isDark = theme === "dark" || textColorClass === "text-white";

  // Crop aspect ratio of logo is 983 / 199 = 4.94
  const displayHeight = iconOnly ? size * 0.95 : size * 0.7;
  const displayWidth = iconOnly ? size * 0.95 : displayHeight * 4.94;

  const logoSrc = isDark ? crackdsaLogoDark : crackdsaLogoCropped;
  const iconSrc = isDark ? crackdsaIconDark : crackdsaIcon;

  return (
    <div className={`flex items-center justify-center select-none ${className}`}>
      <img
        src={iconOnly ? iconSrc : logoSrc}
        alt="CrackDSA Logo"
        width={displayWidth}
        height={displayHeight}
        style={{ 
          width: `${displayWidth}px`,
          height: `${displayHeight}px` 
        }}
        className="shrink-0 transition-transform duration-300 hover:scale-105 object-contain"
      />
    </div>
  );
}

export default Logo;
