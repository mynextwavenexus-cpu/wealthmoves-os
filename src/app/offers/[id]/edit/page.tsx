"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { OfferBuilderForm } from "@/components/offer-builder-form";
import { Loader2 } from "lucide-react";
import { OfferFormData } from "@/lib/offer-templates";

export default function EditOfferPage() {
  const params = useParams();
  const router = useRouter();
  const offerId = params.id as string;
  const [offer, setOffer] = useState<Partial<OfferFormData> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOffer() {
      try {
        const res = await fetch(`/api/offers/${offerId}`);
        if (res.ok) {
          const data = await res.json();
          setOffer(data.offer);
        } else {
          setError("Failed to load offer");
        }
      } catch (err) {
        setError("Error loading offer");
      } finally {
        setIsLoading(false);
      }
    }

    fetchOffer();
  }, [offerId]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-[#0F3F4C]" />
        </div>
      </div>
    );
  }

  if (error || !offer) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-[#0F3F4C] mb-2">Offer Not Found</h2>
          <p className="text-[#AFA496] mb-4">The offer you're looking for doesn't exist or you don't have access.</p>
          <button 
            onClick={() => router.push("/offers")}
            className="text-[#0F3F4C] underline"
          >
            Back to Offers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <OfferBuilderForm initialData={offer} offerId={offerId} />
    </div>
  );
}
