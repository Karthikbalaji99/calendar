import { Button } from "@/components/ui/button";
import pandaIcon from "@assets/generated_images/Panda_character_avatar_icon_c3ecdae1.png";
import cookieIcon from "@assets/generated_images/Cookie_character_avatar_icon_f4fe2d95.png";
import bothIcon from "@assets/generated_images/Combined_panda_cookie_heart_093d2d02.png";

interface OwnerFilterProps {
  value: "all" | "panda" | "cookie" | "both";
  onChange: (value: "all" | "panda" | "cookie" | "both") => void;
}

export function OwnerFilter({ value, onChange }: OwnerFilterProps) {
  return (
    <div className="flex gap-2" data-testid="filter-owner">
      <Button
        variant={value === "all" ? "default" : "outline"}
        size="sm"
        onClick={() => onChange("all")}
        data-testid="filter-all"
        className="gap-2"
      >
        All
      </Button>
      <Button
        variant={value === "panda" ? "default" : "outline"}
        size="sm"
        onClick={() => onChange("panda")}
        data-testid="filter-panda"
        className="gap-2"
      >
        <img src={pandaIcon} alt="Panda" className="w-4 h-4" />
        Panda
      </Button>
      <Button
        variant={value === "cookie" ? "default" : "outline"}
        size="sm"
        onClick={() => onChange("cookie")}
        data-testid="filter-cookie"
        className="gap-2"
      >
        <img src={cookieIcon} alt="Cookie" className="w-4 h-4" />
        Cookie
      </Button>
      <Button
        variant={value === "both" ? "default" : "outline"}
        size="sm"
        onClick={() => onChange("both")}
        data-testid="filter-both"
        className="gap-2"
      >
        <img src={bothIcon} alt="Both" className="w-4 h-4" />
        Both
      </Button>
    </div>
  );
}
