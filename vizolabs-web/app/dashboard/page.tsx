import Link from 'next/link'
import { Languages, ArrowRight, BookOpen, Zap, History } from 'lucide-react'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Languages className="w-8 h-8 text-primary-600" />
              <span className="text-xl font-bold">VizoTranslator</span>
            </div>
            <nav className="flex items-center gap-6">
              <Link
                href="/app"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                Translate
              </Link>
              <Link
                href="/projects"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                Projects
              </Link>
              <Link
                href="/glossaries"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                Glossaries
              </Link>
              <Link
                href="/settings"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                Settings
              </Link>
              <button className="btn-primary">Logout</button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Welcome back!</h1>
          <div className="grid md:grid-cols-3 gap-4">
            <QuickActionCard
              icon={<Languages className="w-6 h-6" />}
              title="New Translation"
              description="Translate text between 50+ languages"
              href="/app"
            />
            <QuickActionCard
              icon={<BookOpen className="w-6 h-6" />}
              title="Create Glossary"
              description="Build custom terminology dictionaries"
              href="/glossaries/new"
            />
            <QuickActionCard
              icon={<Zap className="w-6 h-6" />}
              title="API Access"
              description="Integrate translation into your apps"
              href="/api-keys"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Translations Today" value="24" />
          <StatCard label="Characters Used" value="1,234 / 50,000" />
          <StatCard label="Translation Memory" value="156 matches" />
          <StatCard label="Team Members" value="3" />
        </div>

        {/* Recent Activity */}
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <History className="w-5 h-5" />
              Recent Translations
            </h2>
            <Link
              href="/history"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View All →
            </Link>
          </div>
          <div className="space-y-4">
            <TranslationRow
              source="Hello, how are you?"
              target="Hola, ¿cómo estás?"
              from="en"
              to="es"
              time="2 minutes ago"
            />
            <TranslationRow
              source="The meeting is at 3 PM"
              target="La reunión es a las 3 PM"
              from="en"
              to="es"
              time="15 minutes ago"
            />
            <TranslationRow
              source="Thank you for your help"
              target="Merci pour votre aide"
              from="en"
              to="fr"
              time="1 hour ago"
            />
          </div>
        </div>

        {/* Projects */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Active Projects</h2>
            <Link href="/projects/new" className="btn-primary text-sm">
              New Project
            </Link>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <ProjectCard
              name="Website Localization"
              languages="en → es, fr, de"
              progress={45}
              deadline="Dec 15, 2026"
            />
            <ProjectCard
              name="Product Documentation"
              languages="en → ja, ko, zh"
              progress={78}
              deadline="Nov 30, 2026"
            />
          </div>
        </div>
      </main>
    </div>
  )
}

function QuickActionCard({
  icon,
  title,
  description,
  href,
}: {
  icon: React.ReactNode
  title: string
  description: string
  href: string
}) {
  return (
    <Link href={href} className="card hover:shadow-lg transition-shadow group">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-600 flex items-center justify-center">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600">
            {title}
          </h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
      </div>
    </Link>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="card">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  )
}

function TranslationRow({
  source,
  target,
  from,
  to,
  time,
}: {
  source: string
  target: string
  from: string
  to: string
  time: string
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
      <div className="flex-1">
        <p className="text-sm text-gray-900 dark:text-white font-medium">{source}</p>
        <p className="text-sm text-gray-500">{target}</p>
      </div>
      <div className="text-right">
        <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded">
          {from} → {to}
        </span>
        <p className="text-xs text-gray-400 mt-1">{time}</p>
      </div>
    </div>
  )
}

function ProjectCard({
  name,
  languages,
  progress,
  deadline,
}: {
  name: string
  languages: string
  progress: number
  deadline: string
}) {
  return (
    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-medium text-gray-900 dark:text-white">{name}</h3>
        <span className="text-xs text-gray-500">{languages}</span>
      </div>
      <div className="mb-2">
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-primary-600 rounded-full" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <p className="text-xs text-gray-500">Due: {deadline}</p>
    </div>
  )
}
