import Hero from '@/components/home/Hero';
import WelcomeSection from '@/components/home/WelcomeSection';
import FeaturedRooms from '@/components/home/FeaturedRooms';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      <Navbar/>
      <Hero />
      <WelcomeSection />
      <FeaturedRooms />
      <Footer/>
    </main>
  );
}