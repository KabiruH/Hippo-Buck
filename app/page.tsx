import Hero from '@/components/home/Hero';
import WelcomeSection from '@/components/home/WelcomeSection';
import FeaturedRooms from '@/components/home/FeaturedRooms';

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      <Hero />
      <WelcomeSection />
      <FeaturedRooms />
    </main>
  );
}