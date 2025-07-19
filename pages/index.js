import { useTracking } from "../Context/Tracking";
import Link from "next/link";

export default function Home() {
  const { loading } = useTracking();

  // Note: Removed auto-redirect to allow users to visit home page even when logged in



  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative gradient-primary text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Revolutionizing Supply Chain
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-200 to-blue-200">
                with Blockchain Technology
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Transparent, secure, and efficient supply chain management powered by blockchain.
              Connect suppliers, producers, and customers in a trustless ecosystem.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/login" className="btn btn-accent text-lg px-8 py-4 shadow-medium transform hover:scale-105">
                Get Started
              </Link>
              <Link href="#about" className="btn btn-outline border-white text-white hover:bg-white hover:text-primary text-lg px-8 py-4">
                Learn More
              </Link>
            </div>
          </div>
        </div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-medium max-w-3xl mx-auto">
              Experience the future of supply chain management with our cutting-edge blockchain solution
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-6">
                <span className="text-2xl">🔗</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Blockchain Security</h3>
              <p className="text-gray-600">
                Immutable records and smart contracts ensure complete transparency and security in every transaction.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mb-6">
                <span className="text-2xl">👥</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Role-Based Access</h3>
              <p className="text-gray-600">
                Suppliers, producers, and customers have tailored experiences with appropriate access controls.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-6">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Real-time Tracking</h3>
              <p className="text-gray-600">
                Track products and materials in real-time from source to destination with complete visibility.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                About Our Platform
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                We are revolutionizing supply chain management through blockchain technology. Our platform
                connects suppliers, producers, and customers in a transparent, secure, and efficient ecosystem.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                With smart contracts and decentralized architecture, we eliminate intermediaries, reduce costs,
                and ensure complete traceability of products from origin to consumer.
              </p>

              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">1000+</div>
                  <div className="text-gray-600">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">50K+</div>
                  <div className="text-gray-600">Transactions</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">99.9%</div>
                  <div className="text-gray-600">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-600 mb-2">24/7</div>
                  <div className="text-gray-600">Support</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
                <p className="text-blue-100 mb-6">
                  To create a transparent, efficient, and trustworthy supply chain ecosystem that benefits
                  all stakeholders while promoting sustainability and ethical practices.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
                    <span>Transparency in every transaction</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
                    <span>Reduced operational costs</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
                    <span>Enhanced security and trust</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Get In Touch</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Ready to transform your supply chain? Contact us today to learn more about our platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📧</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Email Us</h3>
              <p className="text-gray-300">contact@supplychain.com</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📞</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Call Us</h3>
              <p className="text-gray-300">+1 (555) 123-4567</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📍</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Visit Us</h3>
              <p className="text-gray-300">123 Blockchain St, Tech City</p>
            </div>
          </div>

          <div className="mt-16 text-center">
            <Link href="/auth/login" className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg">
              Join Our Platform
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
