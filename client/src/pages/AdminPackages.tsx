import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Check, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Package {
  id: number;
  price: number;
  title: string;
  description: string;
}

const allPackages: Package[] = [
  { id: 1, price: 20, title: "Starter Digital Apartment", description: "Perfect for new earners" },
  { id: 2, price: 49, title: "Premium Digital Apartment", description: "Level up your earnings" },
  { id: 3, price: 99, title: "Big Digital Apartment", description: "Maximize your potential" },
  { id: 4, price: 149, title: "Pro Digital Apartment", description: "For serious earners" },
  { id: 5, price: 199, title: "Elite Digital Apartment", description: "Elite earning tools" },
  { id: 6, price: 249, title: "Platinum Digital Apartment", description: "Platinum earning tools" },
  { id: 7, price: 299, title: "Diamond Digital Apartment", description: "Diamond earning tools" },
  { id: 8, price: 349, title: "Executive Digital Apartment", description: "Executive earning tools" },
  { id: 9, price: 399, title: "Presidential Digital Apartment", description: "Presidential earning tools" },
  { id: 10, price: 449, title: "Royal Digital Apartment", description: "Royal earning tools" },
  { id: 11, price: 499, title: "Legendary Digital Apartment", description: "Legendary earning tools" },
];

export default function AdminPackages() {
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const { toast } = useToast();

  const getPackageLink = (price: number) => {
    return `https://packages.rentapog.com/?aff=rentapog`;
  };

  const copyLink = async (pkg: Package) => {
    const link = getPackageLink(pkg.price);
    await navigator.clipboard.writeText(link);
    setCopiedId(pkg.id);
    toast({
      title: "Link Copied!",
      description: `$${pkg.price} package link copied to clipboard`,
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-2" data-testid="admin-packages-title">
            Admin Package Links
          </h1>
          <p className="text-slate-400">
            All packages with <span className="text-cyan-400 font-semibold">rentapog</span> affiliate code
          </p>
          <p className="text-slate-500 text-sm mt-2">
            sales@rentapog.com
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {allPackages.map((pkg) => (
            <Card key={pkg.id} className="bg-slate-800 border-slate-700" data-testid={`admin-card-${pkg.price}`}>
              <CardHeader className="pb-2">
                <CardTitle className="flex justify-between items-center">
                  <span className="text-white">{pkg.title}</span>
                  <span className="text-2xl font-bold text-green-400">${pkg.price}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-slate-400 text-sm">{pkg.description}</p>
                
                <div className="bg-slate-900 rounded-lg p-2 text-xs text-cyan-300 break-all">
                  {getPackageLink(pkg.price)}
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => copyLink(pkg)}
                    className="flex-1 bg-cyan-600 hover:bg-cyan-700"
                    data-testid={`button-copy-${pkg.price}`}
                  >
                    {copiedId === pkg.id ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Link
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    onClick={() => window.open(getPackageLink(pkg.price), "_blank")}
                    data-testid={`button-open-${pkg.price}`}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-10 text-center">
          <a 
            href="/admin" 
            className="text-cyan-400 hover:text-cyan-300 underline"
            data-testid="link-back-admin"
          >
            Back to Admin Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
