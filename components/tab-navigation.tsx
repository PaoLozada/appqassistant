"use client"

interface TabNavigationProps {
    tabs: { id: string; label: string }[]
    activeTab: string
    onTabChange: (tabId: string) => void
}

export default function TabNavigation({ tabs, activeTab, onTabChange }: TabNavigationProps) {
    return (
        <div className="border-b border-neutral-200 bg-neutral-50 rounded-t-xl">
            <div className="flex overflow-x-auto p-1 sm:p-2 scrollbar-hide">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`px-2 sm:px-4 py-1 sm:py-2 text-sm sm:text-base font-medium rounded-lg transition-all whitespace-nowrap mr-1 ${activeTab === tab.id
                                ? "bg-gradient-primary text-white shadow-primary"
                                : "text-neutral-600 hover:bg-neutral-200"
                            }`}
                        onClick={() => onTabChange(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>
    )
}
