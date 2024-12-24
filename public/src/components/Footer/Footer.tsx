export const Footer = () => {
  return (
    <footer className="bg-black text-white py-6 sm:py-8 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center sm:items-start gap-8 sm:gap-4">
        <div className="text-center sm:text-left">
          <h3 className="font-bold mb-4">About us</h3>
          <ul className="space-y-2 text-lightGray">
            <li>
              <a href="/about" className="hover:text-white transition-colors">
                About us
              </a>
            </li>
            <li>
              <a href="/contact" className="hover:text-white transition-colors">
                Contact
              </a>
            </li>
            <li>
              <a href="/legal" className="hover:text-white transition-colors">
                Legal
              </a>
            </li>
          </ul>
        </div>

        <div className="text-center sm:text-left">
          <h3 className="font-bold mb-4">Follow us</h3>
          <div className="flex justify-center sm:justify-start gap-6">
            <a
              href="#"
              className="text-lightGray hover:text-white transition-colors"
              aria-label="Facebook"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
            </a>
            <a
              href="#"
              className="text-lightGray hover:text-white transition-colors"
              aria-label="Twitter"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
              </svg>
            </a>
          </div>
        </div>

        <div className="text-center sm:text-right">
          <h3 className="font-bold mb-4">Send us feedback</h3>
          <button className="bg-red hover:bg-red-light text-white px-6 py-2 rounded-full transition-colors">
            Send E-mail
          </button>
        </div>
      </div>
    </footer>
  );
};
