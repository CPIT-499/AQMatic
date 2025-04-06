import Image from "next/image";
import { Card } from "../ui/card";

const supporters = [
  {
    name: "APSCO",
    image: "/APSCO_logo.png",
  },
  {
    name: "faculty of computing and information technology",
    image: "/FCIT.png",
  },
  {
    name: "Center Of Excellence In Intelligent Engineering Systems",
    image: "/CEIES.png",
  },
];

export function SupportersSection() {
  return (
    <section className="py-20 bg-muted/30 relative z-10">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Supported by
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {supporters.map((company, i) => (
            <Card
              key={i}
              className="p-8 flex flex-col items-center justify-center bg-background border border-border/50 hover:border-primary/30 transition-all h-60"
            >
              <Image
                src={company.image}
                alt={company.name}
                width={160}
                height={80}
                className="mb-6 object-contain"
              />
              <p className="font-semibold text-lg text-center">{company.name}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
