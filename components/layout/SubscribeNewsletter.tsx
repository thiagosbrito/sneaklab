import { Button } from "@/components/ui/button"

export default function SubscribeNewsletter() {
  return (
    <section className="w-full bg-gradient-to-r from-purple-400 to-purple-600 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="text-white">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              Join the SneakLab Revolution
            </h2>
            <p className="text-lg opacity-90">
              Get exclusive offers and the latest updates!
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              variant="secondary" 
              size="lg"
              className="bg-white text-purple-600 hover:bg-gray-100 font-medium px-8 py-3"
            >
              Sign Up
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-white text-white hover:bg-white hover:text-purple-600 font-medium px-8 py-3"
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}