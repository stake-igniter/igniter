import { getRandomInt } from "@igniter/ui/lib/utils";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@igniter/ui/components/avatar";
import {AvatarFallbackOne, AvatarFallbackTwo, AvatarFallbackThree, AvatarFallbackFour } from "@igniter/ui/assets";

export function UserAvatar({
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
            <AvatarFallbackOne />
          </AvatarImage>
        );
      case 2:
        return (
          <AvatarImage src="/fallback-avatar.svg" asChild>
            <AvatarFallbackTwo />
          </AvatarImage>
        );
      case 3:
        return (
          <AvatarImage src="/fallback-avatar.svg" asChild>
            <AvatarFallbackThree />
          </AvatarImage>
        );
      case 4:
        return (
          <AvatarImage src="/fallback-avatar.svg" asChild>
            <AvatarFallbackFour />
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
