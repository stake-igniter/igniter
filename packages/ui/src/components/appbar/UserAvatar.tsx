import { getRandomInt, getShortAddress } from "../../../../../apps/middleman/src/lib/utils";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/avatar";
import Avatar1 from "../../../../../apps/middleman/src/app/assets/avatar/fallback-1.svg";
import Avatar2 from "../../../../../apps/middleman/src/app/assets/avatar/fallback-2.svg";
import Avatar3 from "../../../../../apps/middleman/src/app/assets/avatar/fallback-3.svg";
import Avatar4 from "../../../../../apps/middleman/src/app/assets/avatar/fallback-4.svg";

export function UserAvatar({
  address,
  selectedAvatar,
}: {
  address: string;
  selectedAvatar: number;
}) {
  const randomInt = selectedAvatar || getRandomInt(1, 4);

  const UserImage = () => {
    switch (randomInt) {
      case 1:
        return (
          <AvatarImage src="/fallback-avatar.svg" asChild>
            <Avatar1 />
          </AvatarImage>
        );
      case 2:
        return (
          <AvatarImage src="/fallback-avatar.svg" asChild>
            <Avatar2 />
          </AvatarImage>
        );
      case 3:
        return (
          <AvatarImage src="/fallback-avatar.svg" asChild>
            <Avatar3 />
          </AvatarImage>
        );
      case 4:
        return (
          <AvatarImage src="/fallback-avatar.svg" asChild>
            <Avatar4 />
          </AvatarImage>
        );
    }
  };

  return (
    <Avatar className="w-5 h-5">
      <UserImage />
      <AvatarFallback>POKT</AvatarFallback>
    </Avatar>
  );
}
