import { useState } from "react";
import { Header } from "../../components/Header/Header";
import { Footer } from "../../components/Footer/Footer";
import { PageTransition } from "../../components/Animation/PageTransition";
import { contactService } from "../../services/apiService";
import Loading from "../../components/Animation/Loading";

export const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await contactService.submitContactForm(formData);
      setSuccess(true);
      setFormData({ name: "", email: "", message: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

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
                    <p className="text-lightGray">+46 70 123 45 67</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 text-white">Address</h3>
                    <p className="text-lightGray">Kungsgatan 1</p>
                    <p className="text-lightGray">111 22 Stockholm</p>
                  </div>
                </div>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-6 bg-darkGray p-6 rounded-lg"
              >
                {error && (
                  <div className="text-red text-sm p-3 bg-red bg-opacity-10 rounded">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="text-green-500 text-sm p-3 text-lightGray bg-opacity-10 rounded">
                    Message sent successfully!
                  </div>
                )}
                <div>
                  <label htmlFor="name" className="block mb-2 text-lightGray">
                    Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-3 bg-black border border-gray-600 rounded text-white focus:border-red focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block mb-2 text-lightGray">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-3 bg-black border border-gray-600 rounded text-white focus:border-red focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="message"
                    className="block mb-2 text-lightGray"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full p-3 bg-black border border-gray-600 rounded text-white focus:border-red focus:outline-none"
                    rows={4}
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red hover:bg-red-light text-white px-6 py-3 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Loading size="small" /> : "Send Message"}
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
