import { darken, lighten } from "@mui/system";
import React from "react";

const stringToColour = (str: string) => {
  let hash = 0;
  str.split("").forEach((char) => {
    hash = char.charCodeAt(0) + ((hash << 5) - hash);
  });
  let colour = "#";
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    colour += value.toString(16).padStart(2, "0");
  }
  return colour;
};

const startsWithLetter = (str: string) => /^[A-Za-z]/.test(str);
const endsWithNumber = (str: string) => /[0-9]$/.test(str);
const alphabet = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
];

const getIsLowerThanMid = (str: string) => {
  if (!str) throw new Error("str is required");

  let lowerThanMid: boolean;
  const lastChar = str.at(-1)!;

  if (isNaN(Number(lastChar))) {
    lowerThanMid = alphabet.indexOf(lastChar) < 14;
  } else {
    lowerThanMid = Number(lastChar) < 5;
  }

  return lowerThanMid;
};

interface AvatarProps {
  size: number;
  color: string;
  darkColor: string;
  type: "square" | "circle";
}

interface AvatarAProps extends AvatarProps {
  transform?: string;
}

function AvatarA({ size, darkColor, color, type, transform }: AvatarAProps) {
  return (
    <div
      className='avatar'
      style={{
        width: size,
        height: size,
        borderRadius: type === 'circle' ? '50%' : '4px',
        transform: transform
          ? transform
          : type === 'circle'
            ? 'rotate(50deg)'
            : undefined,
        overflow: 'hidden',
      }}
    >
      <div style={{ height: '100%', backgroundColor: color }} />
      <div style={{ height: '100%', backgroundColor: darkColor }} />
    </div>
  );
}

function AvatarB(props: AvatarProps) {
  return (
    <AvatarA
      {...props}
      transform={props.type === "square" ? "rotate(90deg)" : "rotate(310deg)"}
    />
  );
}

function AvatarC({
                   size,
                   darkColor,
                   color,
                   type,
                   transform = "rotate(44deg)",
                 }: AvatarAProps) {
  return (
    <div
      className='avatar grid'
      style={{
        width: size,
        height: size,
        borderRadius: type === 'circle' ? '50%' : '4px',
        transform: transform,
        overflow: 'hidden',
        gridTemplateRows: '1fr 1fr',
        gridTemplateColumns: '1fr 1fr',
      }}
    >
      <div style={{ height: '100%', backgroundColor: color }} />
      <div style={{ height: '100%', backgroundColor: darkColor }} />
      <div style={{ height: '100%', backgroundColor: darkColor }} />
      <div style={{ height: '100%', backgroundColor: color }} />
    </div>
  );
}

function AvatarD({
                   size,
                   darkColor,
                   color,
                   type,
                   transform = "rotate(44deg)",
                 }: AvatarAProps) {
  return (
    <div
      className='avatar relative w-full h-full'
      style={{
        width: size,
        height: size,
        backgroundColor: darkColor,
        transform: type === 'circle' ? transform : undefined,
        overflow: 'hidden',
        borderRadius: type === 'circle' ? '50%' : '4px',
      }}
    >
      <div
        className='absolute'
        style={{
          width: size - 2,
          height: Math.ceil(size / 3) - 1,
          borderRadius: '3px',
          left: 1,
          backgroundColor: color,
          transform: 'rotate(-45deg)',
          top: -1,
        }}
      />
      <div
        className='absolute'
        style={{
          width: size - 2,
          height: Math.ceil(size / 3) - 1,
          borderRadius: '3px',
          left: 1,
          backgroundColor: color,
          transform: 'rotate(-45deg)',
          bottom: -1,
        }}
      />
    </div>
  );
}

function AvatarE({ size, darkColor, color, type }: AvatarProps) {
  const childSize = Math.floor(size / 2);
  return (
    <div
      className='avatar flex items-center justify-center'
      style={{
        width: size,
        height: size,
        backgroundColor: darkColor,
        overflow: 'hidden',
        borderRadius: type === 'circle' ? '50%' : '4px',
      }}
    >
      <div
        style={{
          borderRadius: '50%',
          backgroundColor: color,
          width: childSize,
          height: childSize,
        }}
      />
    </div>
  );
}

function AvatarF({ size, darkColor, color, type, transform }: AvatarAProps) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: type === 'circle' ? '50%' : '4px',
        transform: transform
          ? transform
          : type === 'circle'
            ? 'rotate(20deg)'
            : undefined,
        overflow: 'hidden',
      }}
      className='avatar flex flex-col'
    >
      <div style={{ height: '20%', backgroundColor: darkColor }} />
      <div style={{ height: '18%', backgroundColor: color }} />
      <div style={{ height: '24%', backgroundColor: darkColor }} />
      <div style={{ height: '18%', backgroundColor: color }} />
      <div style={{ height: '20%', backgroundColor: darkColor }} />
    </div>
  );
}

interface AvatarByStringProps {
  string: string;
  size?: number;
  type?: "square" | "circle";
}

export default function AvatarByString({
                                         string,
                                         size = 15,
                                         type = "circle",
                                       }: AvatarByStringProps) {
  if (!string) return null;

  const baseColor = stringToColour(string);
  const color = lighten(baseColor, 0.1);
  const darkColor = darken(baseColor, 0.2);

  if (string.startsWith("0x")) {
    string = string.slice(2);
  }

  const avatarProps: AvatarProps = {
    size,
    color,
    darkColor,
    type,
  };

  let Avatar: typeof AvatarA;

  const lowerThanMid = getIsLowerThanMid(string);

  if (startsWithLetter(string)) {
    if (endsWithNumber(string)) {
      if (lowerThanMid) {
        Avatar = AvatarA;
      } else {
        Avatar = AvatarD;
      }
    } else {
      if (lowerThanMid) {
        Avatar = AvatarF;
      } else {
        Avatar = AvatarE;
      }
    }
  } else {
    if (endsWithNumber(string)) {
      if (lowerThanMid) {
        Avatar = AvatarB;
      } else {
        Avatar = AvatarD;
      }
    } else {
      if (lowerThanMid) {
        Avatar = AvatarA;
      } else {
        Avatar = AvatarC;
      }
    }
  }

  return <Avatar {...avatarProps} />;
}
