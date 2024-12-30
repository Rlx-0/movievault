import { Header } from "../../components/Header/Header";
import { Footer } from "../../components/Footer/Footer";
import { PageTransition } from "../../components/Animation/PageTransition";

export const About = () => {
  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-black">
        <Header />

        <main className="flex-1">
          <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 lg:py-16">
            <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-white">
              About Us
            </h1>

            <div className="prose lg:prose-xl text-white">
              <p className="mb-6 text-lightGray">
                Welcome to MovieVault! We are dedicated to bringing movie
                enthusiasts together through shared cinematic experiences.
              </p>

              <h2 className="text-2xl font-semibold mt-10 mb-6 text-white">
                Our Story
              </h2>
              <p className="mb-6 text-lightGray">
                Founded in 2020, we started with a simple mission: to create a
                platform where friends can easily organize and enjoy movie
                nights together. Our team of passionate movie lovers works
                tirelessly to make movie gatherings more enjoyable and
                accessible.
              </p>

              <h2 className="text-2xl font-semibold mt-10 mb-6 text-white">
                Our Values
              </h2>
              <ul className="list-disc pl-6 mb-6 text-lightGray space-y-2">
                <li>Community-driven experiences</li>
                <li>Seamless event organization</li>
                <li>Shared entertainment moments</li>
                <li>User-friendly interface</li>
              </ul>

              <h2 className="text-2xl font-semibold mt-10 mb-6 text-white">
                Our Team
              </h2>
              <p className="mb-6 text-lightGray">
                Our diverse team brings together expertise from cinema
                enthusiasts, tech innovators, and user experience designers,
                united by the common goal of creating memorable movie
                experiences.
              </p>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
};

export default About;
