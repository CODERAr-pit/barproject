export default function Footer() {
  return (
    <footer className="mt-16 border-t border-gray-800/30 bg-black/30">
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-gray-300">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">X</span>
            </div>
            <span className="text-lg font-semibold">Xenum Services</span>
          </div>
          <p className="text-sm text-gray-400">Book trusted barbers near you with real-time availability.</p>
        </div>
        <div className="text-sm">
          <h3 className="text-gray-200 font-semibold mb-2">Company</h3>
          <ul className="space-y-1">
            <li><a className="hover:text-white" href="/">Home</a></li>
            <li><a className="hover:text-white" href="/search">Find Barbers</a></li>
            <li><a className="hover:text-white" href="/contact">Contact</a></li>
          </ul>
        </div>
        <div className="text-sm">
          <h3 className="text-gray-200 font-semibold mb-2">Legal</h3>
          <ul className="space-y-1">
            <li><a className="hover:text-white" href="#">Terms</a></li>
            <li><a className="hover:text-white" href="#">Privacy</a></li>
            <li><a className="hover:text-white" href="#">Cookies</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800/30">
        <div className="max-w-7xl mx-auto px-4 py-4 text-xs text-gray-500">© {new Date().getFullYear()} Xenum Services. All rights reserved.</div>
      </div>
    </footer>
  )
}


