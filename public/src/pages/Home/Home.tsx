import { Header } from "../../components/Header/Header";
import { Footer } from "../../components/Footer/Footer";
import { NextEvent } from "../../components/NextEvent/NextEvent";
import cinemaImg from "../../img/CinemaImg.jpg";

export const Home = () => {
  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Header />

      <main className="flex-1 relative">
        <div
          className="absolute inset-0 z-0 opacity-30"
          style={{
            backgroundImage: `url(${cinemaImg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.7)",
          }}
        />

        <div className="relative z-10 flex items-center justify-center lg:justify-start min-h-[calc(100vh-8rem)] px-4 lg:px-16 xl:px-60">
          <NextEvent />
        </div>
      </main>

      <Footer />
    </div>
  );
};
