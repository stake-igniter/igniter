import Image, { type ImageProps } from "next/image";
import LoginWithPokt from "@/app/components/PoktIdentityProvider";

type Props = Omit<ImageProps, "src"> & {
  srcLight: string;
  srcDark: string;
};

const ThemeImage = (props: Props) => {
  const { srcLight, srcDark, ...rest } = props;

  return (
    <>
      <Image {...rest} src={srcLight} className="imgLight" />
      <Image {...rest} src={srcDark} className="imgDark" />
    </>
  );
};

export default function Home() {
  return (
    <div>
      <main>Hello, landing here!</main>
      <LoginWithPokt />
    </div>
  );
}
