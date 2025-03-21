import Hero from "./components/Hero";
import About from "./components/About";
import EmptySpace from "./components/EmptySpace";
import Services from "./components/Services";

export default function Landing() {
    return (
        <div className="h-[100vh] overflow-y-scroll scrollbar-hidden">
            <Hero />
            <About />
            <EmptySpace />
            <Services />
            <EmptySpace />
        </div>
    );
}
