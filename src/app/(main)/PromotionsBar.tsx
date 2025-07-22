"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { fetchActiveAds } from "@/lib/data/promotions-data";

type PromotionsBarProps = {
  className?: string;
};

export default function PromotionsBar({ className }: PromotionsBarProps) {
  const [bandAds, setBandAds] = useState<string[]>([]);
  const [eventAds, setEventAds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  const promoBarRouter = ["/", "/events"];
  const dynamicPaths = [/^\/band\/.+$/];
  const shouldRenderPromotionsBar =
    promoBarRouter.includes(pathname) ||
    dynamicPaths.some((regex) => regex.test(pathname));

  useEffect(() => {
    const fetchAds = async () => {
      try {
        setLoading(true);
        const activeAds = await fetchActiveAds();

        const bandAdPaths: string[] = [];
        const eventAdPaths: string[] = [];
        if (activeAds && activeAds?.length > 0) {
          activeAds.forEach((ad) => {
            const imagePath = `/images/promotions/${ad.filename}`;

            if (ad.type === "band") {
              bandAdPaths.push(imagePath);
            } else if (ad.type === "event") {
              eventAdPaths.push(imagePath);
            }
          });
        }

        if (bandAdPaths.length === 0) {
          bandAdPaths.push("/bandpromo_placeholder.png");
        }

        if (eventAdPaths.length === 0) {
          eventAdPaths.push("/eventpromo_placeholder.png");
        }

        setBandAds(bandAdPaths);
        setEventAds(eventAdPaths);
      } catch (error) {
        console.error("Failed to fetch ads:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, []);

  const handleAdClick = (adPath: string) => {
    // Extract ad ID from path for navigation
    const adId = adPath.split("/").pop()?.split(".")[0];
    router.push(`/promotion?ad=${adId}`);
  };

  if (!shouldRenderPromotionsBar || loading) {
    return null;
  }

  const CarouselComponent = ({
    ads,
    title,
    autoplayDelay = 5000,
  }: {
    ads: string[];
    title: string;
    autoplayDelay?: number;
  }) => {
    if (ads.length === 0) return null;

    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-center">{title}</h3>
        <Carousel
          className="relative"
          plugins={[
            Autoplay({
              delay: autoplayDelay,
            }),
          ]}
        >
          <CarouselContent>
            {ads.map((ad, index) => (
              <CarouselItem key={index}>
                <div className="p-1 relative">
                  <Card
                    className="rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => handleAdClick(ad)}
                  >
                    <CardContent className="flex aspect-square items-center justify-center p-0">
                      <div className="relative w-full h-full">
                        <Image
                          src={ad || "/placeholder.svg"}
                          alt={`${title} Ad ${index + 1}`}
                          fill
                          style={{ objectFit: "cover" }}
                          className="rounded-lg"
                          sizes="(max-width: 320px) 100vw, 320px"
                          priority={index === 0}
                        />
                      </div>
                    </CardContent>
                  </Card>
                  <CarouselPrevious className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10" />
                  <CarouselNext className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10" />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    );
  };

  return (
    <div className={cn("space-y-4", className)}>
      <CarouselComponent
        ads={bandAds}
        title="Band Promotions"
        autoplayDelay={6000}
      />
      <CarouselComponent
        ads={eventAds}
        title="Event Promotions"
        autoplayDelay={8000}
      />
    </div>
  );
}
