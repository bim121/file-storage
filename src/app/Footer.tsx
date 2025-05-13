import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-12">
      <div className="container mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-xl font-semibold">FileDrive</h3>
          <p className="mt-2 text-sm text-gray-300">
            Надійне та швидке хмарне сховище. Зберігайте файли з впевненістю.
          </p>
        </div>

        <div>
          <h4 className="text-lg font-medium mb-2">Навігація</h4>
          <ul className="space-y-1 text-sm">
            <li>
              <Link href="/privacy" className="text-gray-400 hover:text-white">Політика конфіденційності</Link>
            </li>
            <li>
              <Link href="/terms-of-service" className="text-gray-400 hover:text-white">Умови використання</Link>
            </li>
            <li>
              <Link href="/about" className="text-gray-400 hover:text-white">Про нас</Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-medium mb-2">Контакти</h4>
          <ul className="text-sm space-y-1 text-gray-300">
            <li>Email: support@filedrive.com</li>
            <li>Телефон: +38 (044) 123-45-67</li>
          </ul>
          <div className="mt-3 flex gap-3">
            <a href="#" className="hover:text-blue-400">VK</a>
            <a href="#" className="hover:text-blue-400">Telegram</a>
            <a href="#" className="hover:text-blue-400">GitHub</a>
          </div>
        </div>
      </div>

      <div className="text-center text-sm py-4 border-t border-gray-700 text-gray-400">
        © {new Date().getFullYear()} FileDrive. Всі права захищені.
      </div>
    </footer>
  );
}
