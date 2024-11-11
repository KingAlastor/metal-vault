"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { cn } from "@/lib/utils";

interface PromotionsBarProps {
  className?: string;
}

export default function PromotionsBar({className}: PromotionsBarProps) {
  const [bandAds, setBandAds] = useState<string[]>([]);

  useEffect(() => {
    const fetchAds = async () => {
      const ads: string[] = [
        "/bandAds/behemoth.jpg",
        "/bandAds/halo_effect.jpg",
      ];
      setBandAds(ads);
    };

    fetchAds();
  }, []);

  return (
    <Carousel
     className={cn("relative", className)}
      plugins={[
        Autoplay({
          delay: 50000,
        }),
      ]}
    >
      <CarouselContent>
        {bandAds.map((ad, index) => (
          <CarouselItem key={index}>
            <div className="p-1 relative">
              <Card className="rounded-lg overflow-hidden">
                <CardContent className="flex aspect-square items-center justify-center p-0">
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      height: "100%",
                    }}
                  >
                    <Image
                      src={ad}
                      alt={`Ad ${index + 1}`}
                      fill
                      style={{ objectFit: "cover" }}
                      className="rounded-lg"
                      sizes="(max-width: 320px) 100vw, 320px"
                      priority={index === 0}
                    />
                  </div>
                </CardContent>
              </Card>
              <CarouselPrevious className="absolute left-0 top-1/2 transform -translate-y-1/2" />
              <CarouselNext className="absolute right-0 top-1/2 transform -translate-y-1/2" />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
