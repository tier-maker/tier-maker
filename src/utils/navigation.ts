import { useRouter } from "next/navigation";

export const useNavigation = () => {
  const router = useRouter();

  const navigateToTab = (tab: string) => {
    switch (tab) {
      case "create":
        router.push("/");
        break;
      case "explore":
        router.push("/explore");
        break;
      case "library":
        router.push("/library");
        break;
      case "help":
        router.push("/help");
        break;
      default:
        router.push("/");
    }
  };

  return { navigateToTab };
};
