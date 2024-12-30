import { Header } from "../../components/Header/Header";
import { Footer } from "../../components/Footer/Footer";
import { PageTransition } from "../../components/Animation/PageTransition";

export const Contact = () => {
  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-black">
        <Header />

        <main className="flex-1">
          <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 lg:py-16">
            <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-white">
              Contact Us
            </h1>

            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
              <div>
                <h2 className="text-2xl font-semibold mb-6 text-white">
                  Get in Touch
                </h2>
                <p className="mb-8 text-lightGray">
                  We'd love to hear from you. Please fill out the form or use
                  our contact information below.
                </p>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2 text-white">Email</h3>
                    <p className="text-lightGray">contact@movievault.com</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 text-white">Phone</h3>
                    <p className="text-lightGray">+1 (555) 123-4567</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 text-white">Address</h3>
                    <p className="text-lightGray">123 Movie Street</p>
                    <p className="text-lightGray">Suite 100</p>
                    <p className="text-lightGray">New York, NY 10001</p>
                  </div>
                </div>
              </div>

              <form className="space-y-6 bg-darkGray p-6 rounded-lg">
                <div>
                  <label className="block mb-2 text-lightGray">Name</label>
                  <input
                    type="text"
                    className="w-full p-3 bg-black border border-gray-600 rounded text-white focus:border-red focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-lightGray">Email</label>
                  <input
                    type="email"
                    className="w-full p-3 bg-black border border-gray-600 rounded text-white focus:border-red focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-lightGray">Message</label>
                  <textarea
                    className="w-full p-3 bg-black border border-gray-600 rounded text-white focus:border-red focus:outline-none"
                    rows={4}
                  ></textarea>
                </div>
                <button className="w-full bg-red hover:bg-red-light text-white px-6 py-3 rounded-full transition-colors">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
};

export default Contact;
