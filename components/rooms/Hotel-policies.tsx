import { Card, CardContent } from '@/components/ui/card';

interface Policy {
  title: string;
  content: string;
}

const policies: Policy[] = [
  {
    title: 'Check-in / Check-out',
    content: 'Check-in: 2:00 PM\nCheck-out: 10:00 AM',
  },
  {
    title: 'Breakfast Included',
    content: 'All room rates include complimentary bed & breakfast',
  },
  {
    title: 'Payment',
    content: 'Room charges are settled at check-in. We accept Cash, Cards & M-Pesa',
  },
  {
    title: 'Taxes Included',
    content: 'All rates are inclusive of relevant taxes',
  },
];

export default function HotelPolicies() {
  return (
    <section className="py-12 md:py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 md:space-y-6 mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
            Good to <span className="text-blue-600">Know</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-4 md:gap-6">
          {policies.map((policy, index) => (
            <Card
              key={index}
              className="bg-white border border-gray-200 shadow-lg"
            >
              <CardContent className="p-4 md:p-6">
                <h3 className="text-blue-600 font-bold mb-3 text-sm md:text-base">
                  {policy.title}
                </h3>
                <p className="text-gray-700 text-xs md:text-sm whitespace-pre-line">
                  {policy.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
