import Hero from "./components/Hero";
import About from "./components/About";
import EmptySpace from "./components/EmptySpace";
import Services from "./components/Services";
import Divider from "@/app/(landing)/components/Divider";

export default function Landing() {
    return (
        <>
            <Divider top={510} />
            <Hero />
            <About />
            <EmptySpace />
            <Services />
            <EmptySpace />
        </>
    );
}
