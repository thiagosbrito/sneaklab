interface StatsCardProps {
  title: string
  value: string | number
  color: 'blue' | 'red' | 'purple' | 'green' | 'orange'
  subtitle?: string
}

export default function StatsCard({ title, value, color, subtitle }: StatsCardProps) {
  const colorClasses = {
    blue: 'bg-gradient-to-r from-blue-400 to-blue-600',
    red: 'bg-gradient-to-r from-red-400 to-red-600', 
    purple: 'bg-gradient-to-r from-purple-400 to-purple-600',
    green: 'bg-gradient-to-r from-green-400 to-green-600',
    orange: 'bg-gradient-to-r from-orange-400 to-orange-600'
  }

  return (
    <div className={`${colorClasses[color]} rounded-2xl p-6 text-white relative overflow-hidden`}>
      <div className="relative z-10">
        <h3 className="text-sm font-medium mb-2 opacity-90">{title}</h3>
        <div className="text-3xl font-bold mb-1">{value}</div>
        {subtitle && (
          <p className="text-xs opacity-75">{subtitle}</p>
        )}
      </div>
      
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 w-24 h-24 opacity-20">
        <div className="w-full h-full bg-white rounded-full transform translate-x-8 -translate-y-8"></div>
      </div>
      <div className="absolute bottom-0 right-0 w-16 h-16 opacity-10">
        <div className="w-full h-full bg-white rounded-full transform translate-x-4 translate-y-4"></div>
      </div>
    </div>
  )
}
