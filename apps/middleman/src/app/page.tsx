import Image, { type ImageProps } from "next/image";
import UsersList from "@/components/users";
import styles from "./page.module.css";
import UserForm from "@/components/userForm";
import { Button } from "@igniter/ui/components/button";

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
    <div className={styles.page}>
      <main className={styles.main}>
        <UsersList />
        <UserForm />
        <Button variant="destructive">Click Me</Button>
      </main>
    </div>
  );
}
