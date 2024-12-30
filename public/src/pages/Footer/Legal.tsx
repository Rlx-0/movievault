import { Header } from "../../components/Header/Header";
import { Footer } from "../../components/Footer/Footer";
import { PageTransition } from "../../components/Animation/PageTransition";

export const Legal = () => {
  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-black">
        <Header />

        <main className="flex-1">
          <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 lg:py-16">
            <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-white">
              Legal Information
            </h1>

            <div className="space-y-12">
              <section>
                <h2 className="text-2xl font-semibold mb-6 text-white">
                  Terms of Service
                </h2>
                <div className="space-y-4 text-lightGray">
                  <p>
                    By accessing and using this website, you accept and agree to
                    be bound by the terms and provision of this agreement.
                  </p>
                  <p>
                    This website is for general information and use only. It is
                    subject to change without notice.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-6 text-white">
                  Privacy Policy
                </h2>
                <div className="space-y-4 text-lightGray">
                  <p>
                    We are committed to protecting your privacy. Any information
                    provided by you will be used in accordance with our privacy
                    policy.
                  </p>
                  <p>
                    We do not share your personal information with third parties
                    without your explicit consent.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-6 text-white">
                  Cookie Policy
                </h2>
                <p className="text-lightGray">
                  This website uses cookies to improve your experience. By using
                  our website, you agree to our use of cookies.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-6 text-white">
                  Copyright Notice
                </h2>
                <p className="text-lightGray">
                  © 2024 MovieVault. All rights reserved. Any redistribution or
                  reproduction of part or all of the contents in any form is
                  prohibited.
                </p>
              </section>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
};

export default Legal;
