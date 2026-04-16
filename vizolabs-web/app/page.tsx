import Link from 'next/link'
import { Languages, Zap, Shield, Users, Globe, FileText, Sparkles } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 dark:bg-gray-900/80 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Languages className="w-8 h-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                VizoTranslator
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                Login
              </Link>
              <Link href="/register" className="btn-primary">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 mb-6">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Powered by Claude AI</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            Translate with <span className="text-primary-600">AI Precision</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Professional translation powered by advanced AI. Translate documents, websites, and text
            across 50+ languages with unprecedented accuracy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="btn-primary text-lg px-8 py-3">
              Start Translating Free
            </Link>
            <Link href="/demo" className="btn-secondary text-lg px-8 py-3">
              View Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Everything You Need for Professional Translation
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Languages className="w-6 h-6" />}
              title="50+ Languages"
              description="Translate between any combination of 50+ languages with native-level accuracy."
            />
            <FeatureCard
              icon={<FileText className="w-6 h-6" />}
              title="Document Translation"
              description="Upload PDF, DOCX, TXT files and get perfectly formatted translations."
            />
            <FeatureCard
              icon={<Globe className="w-6 h-6" />}
              title="Website Translation"
              description="Enter any URL and translate entire web pages instantly."
            />
            <FeatureCard
              icon={<Zap className="w-6 h-6" />}
              title="Real-time Translation"
              description="Get instant translations as you type with auto-detect language."
            />
            <FeatureCard
              icon={<Users className="w-6 h-6" />}
              title="Team Collaboration"
              description="Work together with shared glossaries, translation memory, and projects."
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6" />}
              title="Enterprise Security"
              description="SOC 2 compliant, SSO support, and on-premise deployment options."
            />
          </div>
        </div>
      </section>

      {/* Translation Demo */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Try It Now</h3>
              <Link
                href="/app"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                Open Full App →
              </Link>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Enter text to translate
                </label>
                <textarea
                  className="input-field h-40 resize-none"
                  placeholder="Type or paste your text here..."
                />
                <div className="mt-2 text-sm text-gray-500">Detected: English (en)</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Translation
                </label>
                <textarea
                  className="input-field h-40 resize-none bg-gray-50 dark:bg-gray-700"
                  placeholder="Translation will appear here..."
                  readOnly
                />
                <div className="mt-2 text-sm text-gray-500">Spanish (es)</div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <select className="input-field w-auto">
                <option value="auto">Auto-detect</option>
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="zh">Chinese</option>
                <option value="ja">Japanese</option>
              </select>
              <button className="btn-primary">Translate</button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Simple, Transparent Pricing
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <PricingCard
              name="Free"
              price={0}
              features={[
                '100 requests/month',
                '5,000 characters/month',
                'Basic language support',
                'Community support',
              ]}
            />
            <PricingCard
              name="Starter"
              price={9.99}
              features={[
                '1,000 requests/month',
                '50,000 characters/month',
                'All languages',
                'Translation memory',
                'Email support',
              ]}
              highlighted
            />
            <PricingCard
              name="Pro"
              price={29.99}
              features={[
                '10,000 requests/month',
                '500,000 characters/month',
                'Document translation',
                'Team collaboration',
                'API access',
                'Priority support',
              ]}
            />
            <PricingCard
              name="Enterprise"
              price={99.99}
              features={[
                'Unlimited requests',
                'Unlimited characters',
                'SSO & RBAC',
                'Custom integrations',
                'Dedicated support',
                'SLA guarantee',
              ]}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Languages className="w-6 h-6 text-primary-600" />
              <span className="font-semibold text-gray-900 dark:text-white">VizoTranslator</span>
            </div>
            <div className="flex gap-6 text-sm text-gray-600 dark:text-gray-400">
              <Link href="/about" className="hover:text-primary-600">
                About
              </Link>
              <Link href="/docs" className="hover:text-primary-600">
                Documentation
              </Link>
              <Link href="/pricing" className="hover:text-primary-600">
                Pricing
              </Link>
              <Link href="/contact" className="hover:text-primary-600">
                Contact
              </Link>
            </div>
            <div className="text-sm text-gray-500">© 2026 VizoLabs. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="p-6 rounded-xl bg-gray-50 dark:bg-gray-800 hover:shadow-lg transition-shadow">
      <div className="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-600 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  )
}

function PricingCard({
  name,
  price,
  features,
  highlighted = false,
}: {
  name: string
  price: number
  features: string[]
  highlighted?: boolean
}) {
  return (
    <div
      className={`p-6 rounded-xl ${highlighted ? 'bg-primary-600 text-white ring-4 ring-primary-300' : 'bg-gray-50 dark:bg-gray-800'}`}
    >
      <h3
        className={`text-lg font-semibold mb-2 ${highlighted ? 'text-white' : 'text-gray-900 dark:text-white'}`}
      >
        {name}
      </h3>
      <div
        className={`text-3xl font-bold mb-4 ${highlighted ? 'text-white' : 'text-gray-900 dark:text-white'}`}
      >
        ${price}
        <span
          className={`text-sm font-normal ${highlighted ? 'text-primary-200' : 'text-gray-500'}`}
        >
          /month
        </span>
      </div>
      <ul className="space-y-2 mb-6">
        {features.map((feature, i) => (
          <li
            key={i}
            className={`text-sm flex items-center gap-2 ${highlighted ? 'text-primary-100' : 'text-gray-600 dark:text-gray-400'}`}
          >
            <span className={highlighted ? 'text-primary-200' : 'text-primary-600'}>✓</span>
            {feature}
          </li>
        ))}
      </ul>
      <Link
        href="/register"
        className={`block text-center py-2 rounded-lg font-medium transition-colors ${
          highlighted
            ? 'bg-white text-primary-600 hover:bg-primary-50'
            : 'bg-primary-600 text-white hover:bg-primary-700'
        }`}
      >
        Get Started
      </Link>
    </div>
  )
}
