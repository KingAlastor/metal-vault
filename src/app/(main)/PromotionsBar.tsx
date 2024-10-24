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

export default function PromotionsBar() {
  const [bandAds, setBandAds] = useState<string[]>([]);

  useEffect(() => {
    const fetchAds = async () => {
      const ads: string[] = [
        "/bandAds/behemoth.jpg",
        "/bandAds/halo_effect.jpg",
      ];
      /*       const response = await fetch('/api/ads');
      const data = await response.json(); */
      setBandAds(ads);
    };

    fetchAds();
  }, []);

  return (
    <Carousel
      className="w-full max-w-xs relative"
      plugins={[
        Autoplay({
          delay: 5000,
        }),
      ]}
    >
      <CarouselContent>
        {bandAds.map((ad, index) => (
          <CarouselItem key={index}>
            <div className="p-1 relative">
              <Card className="rounded-lg overflow-hidden">
                <CardContent className="flex aspect-square items-center justify-center p-0">
                  <Image
                    src={ad}
                    alt={`Ad ${index + 1}`}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-lg"
                  />
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
