interface StatsCardProps {
  title: string
  value: string | number
  color: 'blue' | 'red' | 'purple'
}

export default function StatsCard({ title, value, color }: StatsCardProps) {
  const colorClasses = {
    blue: 'bg-gradient-to-r from-blue-400 to-blue-600',
    red: 'bg-gradient-to-r from-red-400 to-red-600', 
    purple: 'bg-gradient-to-r from-purple-400 to-purple-600'
  }

  return (
    <div className={`${colorClasses[color]} rounded-2xl p-6 text-white relative overflow-hidden`}>
      <div className="relative z-10">
        <h3 className="text-sm font-medium mb-2 opacity-90">{title}</h3>
        <div className="text-4xl font-bold">{value}</div>
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
