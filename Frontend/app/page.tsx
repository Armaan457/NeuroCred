import Image from "next/image";
import Hero from "@/app/components/Hero"
import Features from "@/app/components/Features"
import HowItWork from "./components/HowItWork";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <>
    <Hero />
    <Features />
    <HowItWork />
    <Footer />
    </>
  );
}
