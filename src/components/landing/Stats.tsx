import { demoStats } from "@/lib/demo-data";

export function Stats() {
  return (
    <section className="bg-navy py-16">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
        {demoStats.map((stat) => (
          <div key={stat.id} className="text-center">
            <p className="font-heading text-3xl font-extrabold text-white sm:text-4xl">
              {stat.value}
            </p>
            <p className="mt-1.5 text-sm text-white/60">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}