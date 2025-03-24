import type {Metadata} from "next";
import {Jost, Overpass_Mono} from "next/font/google";

export const jost = Jost({
    variable: "--font-jost",
    weight: ["400", "600", "500", "700"],
    style: ["normal", "italic"],
    subsets: ["latin"],
    display: "swap",
});

export const overpass_mono = Overpass_Mono({
    variable: "--font-overpass-mono",
    weight: ["400", "600", "500", "700"],
    style: ["normal"],
    subsets: ["latin"],
    display: "swap",
});
