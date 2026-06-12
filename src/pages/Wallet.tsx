import { Stars, Ticket, Coffee, Shirt, Sparkles, ShoppingBag, Utensils, HeartPulse, Plane, Film, QrCode } from 'lucide-react';
import { motion } from 'motion/react';

const categories = [
  { icon: ShoppingBag, label: 'Retail' },
  { icon: Utensils, label: 'Dining' },
  { icon: HeartPulse, label: 'Wellness' },
  { icon: Plane, label: 'Travel' },
  { icon: Film, label: 'Cinema' },
];

const recentCards = [
  {
    name: 'Indigo Coffee Roasters',
    points: 850,
    total: 1000,
    color: 'from-primary to-[#1e1485]',
    icon: Coffee,
    tier: 'Gold',
    statusBadge: '85% Complete',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-P2I7MW51P8Dssy3OFdBZXZJG1-u_fj1K5feoxqSxCkn2ZlK0NQXEhMhrTl0ELllx-0EfMVDWX_r9GyPoI8hKMHiCXUnRBNnUu5Q5G9SVLAy272iw9zes6QOwxmP1Bg9YhimBctuMQuD54bOqY98kgWGUeyq5BuoKxJiim5W3WCX0I1pZ9T7aa-45ErW3rrZD2eEtvqFPnRDzX2nIviJICGw41OX2fjfZP0gCycbKjYkkOYRSShfKwHvfcbtIY1jQeOi6cQhBO_c'
  },
  {
    name: 'Velvet Threads Retail',
    points: 320,
    total: 1000,
    color: 'from-secondary to-[#004d33]',
    icon: Shirt,
    tier: 'Silver',
    statusBadge: '32% Complete',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAV435Zd1aDx5-H7RSYypLUqOIpMEFJJ2UVx1UtIEp4PUJ028mVW9EFukL-mKHby42TuN4JpoJJYV-JIaGAGR-2RAmOK5bSr3hkMYxemdK8TqzGb2YlcONkSJmny6qBmLKi_7u43XNagfo7S4V27221sncIxfbjfGcIDD8hF1bsbr49SlToUNRrpdwDalCs3zYj61U_uzOY3BGKYWtLS78OT6jBmHxsPnFaJhekNd6vVdxYWltwNa_CcTfYsJkUts2s-mPgeZ8THYA'
  },
  {
    name: 'Zen Wellness Collective',
    points: 1000,
    total: 1000,
    color: 'from-tertiary to-[#4d2f00]',
    icon: Sparkles,
    tier: 'Gold',
    statusBadge: 'New Reward!',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBdRJYy_GKHiMtKVgb4UkBBs4lthEm4XA7bfpwEm3rChZb4wz3PEwRBeSAageyqTZwuGSju880sHRcz98qWLm79AkJVU1jGGf0NUH7avlV5itar7H8qR_qowpFmjrGaE1bG7bN2Z8MZpgexaohgSP8WNUFv_w-jyuxDkkIwYID6PRsZ08LgL5LDa5a1T6wnMvB_qHmqhyafS7_I-Y9sB5hnX30z059mym9W7GR0hapWuvWrXVfdW8qxyoB-BLl3TqdpG_iEqCPdrPQ'
  }
];

export default function Wallet() {
  return (
    <div className="bg-surface min-h-screen pb-32">
      <main className="max-w-7xl mx-auto px-4 md:px-12 pt-8 space-y-12">
        
        {/* Points Summary Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div 
            whileHover={{ y: -4 }}
            className="md:col-span-2 p-8 bg-primary rounded-[24px] shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[240px]"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-container opacity-20 rounded-full -mr-20 -mt-20"></div>
            <div className="relative z-10">
              <span className="text-on-primary-container text-label-md uppercase tracking-wider font-bold">Total Rewards Balance</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-on-primary text-points-display">12,450</span>
                <span className="text-on-primary-container text-headline-sm">pts</span>
              </div>
            </div>
            <div className="relative z-10 flex gap-4 mt-8">
              <button className="bg-white text-primary px-8 py-3 rounded-xl font-bold text-body-md hover:bg-surface-container-low transition-all active:scale-95 shadow-md">
                REDEEM NOW
              </button>
              <button className="border border-white/30 text-white px-8 py-3 rounded-xl font-bold text-body-md hover:bg-white/10 transition-all active:scale-95">
                HISTORY
              </button>
            </div>
          </motion.div>

          {/* Mini Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-1 gap-6">
            <div className="bg-secondary-container p-6 rounded-[24px] flex flex-col justify-center items-center text-center shadow-sm">
              <Stars className="text-on-secondary-container w-10 h-10 mb-2 fill-on-secondary-container" />
              <span className="text-on-secondary-fixed-variant text-label-md">Gold Status</span>
              <span className="text-on-secondary-container text-headline-sm font-bold">Level 4</span>
            </div>
            <div className="bg-tertiary-fixed p-6 rounded-[24px] flex flex-col justify-center items-center text-center shadow-sm">
              <Ticket className="text-on-tertiary-fixed w-10 h-10 mb-2 rotate-12" />
              <span className="text-on-tertiary-fixed-variant text-label-md">Active Deals</span>
              <span className="text-on-tertiary-fixed text-headline-sm font-bold">8 Rewards</span>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="space-y-6">
          <div className="flex justify-between items-end px-1">
            <h2 className="text-headline-sm text-on-surface">Explore Categories</h2>
            <button className="text-primary text-label-md font-bold hover:underline">View All</button>
          </div>
          <div className="flex gap-4 overflow-x-auto hide-scrollbar -mx-4 px-4 py-2">
            {categories.map((cat, idx) => (
              <button 
                key={idx}
                className="flex-shrink-0 flex items-center gap-3 px-6 py-4 bg-surface-container-lowest border border-outline-variant rounded-full shadow-sm hover:border-primary transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <cat.icon className="w-5 h-5" />
                </div>
                <span className="font-semibold text-body-md text-on-surface">{cat.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Recent Cards Section */}
        <section className="space-y-6">
          <h2 className="text-headline-sm text-on-surface">Your Recent Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentCards.map((card, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ scale: 1.02 }}
                className="group relative rounded-[24px] h-60 overflow-hidden shadow-lg active:scale-[0.98] transition-all cursor-pointer"
              >
                <img className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src={card.image} alt={card.name} />
                <div className="absolute inset-0 glass-panel p-6 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="bg-white/10 p-3 rounded-xl backdrop-blur-md">
                      <card.icon className="text-on-surface w-6 h-6" />
                    </div>
                    <span className="bg-primary-container text-on-primary-container text-label-md font-bold px-3 py-1.5 rounded-full shadow-sm">
                      {card.statusBadge}
                    </span>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-headline-sm text-on-surface drop-shadow-sm font-bold">{card.name}</h3>
                    <div className="space-y-1.5">
                      <div className="h-2.5 w-full bg-outline-variant/30 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(card.points / card.total) * 100}%` }}
                          transition={{ duration: 1, delay: idx * 0.2 }}
                          className="h-full bg-primary"
                        />
                      </div>
                      <p className="text-body-sm text-on-surface-variant font-medium">
                        {card.points === card.total 
                          ? '1 Reward Ready for Redemption'
                          : `${card.points} / ${card.total} pts to next reward`
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* FAB - Floating Action Button for mobile mobile */}
        <button className="fixed right-8 bottom-28 w-16 h-16 bg-primary text-white rounded-2xl shadow-xl flex items-center justify-center active:scale-95 transition-all z-40 md:hidden">
          <QrCode className="w-8 h-8" />
        </button>
      </main>
    </div>
  );
}
