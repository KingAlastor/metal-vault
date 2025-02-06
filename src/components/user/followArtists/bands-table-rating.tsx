"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";

type StarRatingProps = {
  bandId: string;
  initialRating: number;
  onRatingChange: (newRating: number) => void;
};

export function StarRating({ initialRating, onRatingChange }: StarRatingProps) {
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState(0);

  useEffect(() => {
    setRating(initialRating);
  }, [initialRating]);

  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-5 h-5 cursor-pointer transition-colors ${
            star <= (hover || rating)
              ? "text-yellow-400 fill-yellow-400 dark:text-gray-400 dark:fill-gray-400"
              : "text-gray-300 dark:text-gray-600"
          }`}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          onClick={() => {
            setRating(star);
            onRatingChange(star);
          }}
        />
      ))}
    </div>
  );
}
