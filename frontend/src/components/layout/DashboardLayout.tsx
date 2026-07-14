import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sidebar, type TabId } from './Sidebar'
import { Header } from './Header'
import { Terminal } from '../terminal/Terminal'
import { LogsViewer } from '../logs/LogsViewer'
import { StatusPanel } from '../status/StatusPanel'
import { QuickActions } from '../shortcuts/QuickActions'

const tabComponents: Record<TabId, React.ReactNode> = {
  terminal: <Terminal />,
  logs: <LogsViewer />,
  status: <StatusPanel />,
  actions: <QuickActions />,
}

export function DashboardLayout() {
  const [activeTab, setActiveTab] = useState<TabId>('terminal')

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-surface">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-hidden p-4 lg:p-6 pb-20 md:pb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {tabComponents[activeTab]}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
