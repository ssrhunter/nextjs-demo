import { Pixelify_Sans } from "next/font/google";

const pixelify = Pixelify_Sans({
    subsets: ["latin"],
    display: "swap",
});

const fontProperties = {
    fontSize: 48,
}

export default function Logo(){
    return <h1 className={pixelify.className} style={fontProperties}>Starbroker</h1>;
}

