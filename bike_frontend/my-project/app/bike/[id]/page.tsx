"use client";
import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchBikeDetails } from "@/lib/api/bikes";
import { useQuery } from "react-query";
import { Button } from "@/components/ui/button";
import { rentBike } from "@/lib/api/rent";
import Review from "@/components/ui/review";
import SimilarBikesSection from "@/components/ui/similarbikesection";

const BikeDetail = () => {
  const router = useRouter();
  const { id } = useParams();
  const bikeId = Array.isArray(id) ? id[0] : id;
  const [isRenting, setIsRenting] = useState(false);
  const [rentalDays, setRentalDays] = useState(1);

  const token =
    (typeof window !== "undefined" && localStorage.getItem("token")) || "";

  const {
    data: bike,
    isLoading,
    error,
  } = useQuery(["bike", bikeId], () => fetchBikeDetails(bikeId), {
    enabled: !!bikeId,
  });

  if (isLoading) {
    return <span>Loading...</span>;
  }

  if (error) {
    const errorMessage =
      (error as any).message ||
      "An error occurred while fetching bike details.";
    return <span>Error: {errorMessage}</span>;
  }

  if (!bike) {
    return <span>No bike found.</span>;
  }

  const handleRent = async () => {
    if (!token) return alert("Please log in to rent a bike.");

    setIsRenting(true);
    try {
      const rentalData = await rentBike(bikeId, token, rentalDays);
      alert(`Successfully rented: ${rentalData.id}`);
      router.push("/profile");
    } catch (err: any) {
      alert(
        err.response?.status === 401
          ? "Unauthorized. Please log in again."
          : err.message || "Renting failed."
      );
    } finally {
      setIsRenting(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-center mb-4">
        <h2 className="text-3xl font-bold">{bike.name}</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-black text-white shadow-lg rounded-lg p-6">
          <p className="mb-2">Model: {bike.model}</p>
          <p className="mb-2">Type: {bike.bike_type}</p>
          <p className="mb-2">
            Availability: {bike.availability ? "Available" : "Not Available"}
          </p>
          <p className="mb-4">
            Price per Day: Rs.{bike.price_per_hour} (Rs.
            {Number(bike.price_per_hour) * rentalDays} for {rentalDays} days)
          </p>

          {/* Rental Days Counter */}
          <div className="flex items-center mb-4">
            <label className="mr-2">Rental Days:</label>
            <Button
              onClick={() => setRentalDays((prev) => Math.max(prev - 1, 1))}
              disabled={rentalDays <= 1}
              className="bg-gray-700 text-white hover:bg-gray-600"
            >
              -
            </Button>
            <span className="mx-2">{rentalDays}</span>
            <Button
              className="bg-gray-700 text-white hover:bg-gray-600"
              onClick={() => setRentalDays((prev) => prev + 1)}
            >
              +
            </Button>
          </div>

          <Button
            className="w-full bg-gray-900 text-white py-2 rounded hover:bg-gray-800 transition"
            onClick={handleRent}
            disabled={!bike.availability || isRenting}
          >
            {isRenting ? "Renting..." : "Rent Now"}
          </Button>
        </div>
        <div className="bg-black text-white shadow-lg rounded-lg p-6">
          {/* Reviews Section */}
          <Review bikeId={bikeId} />

          {/* Pass bikeId and token to SimilarBikesSection */}
          <SimilarBikesSection bikeId={bikeId} token={token} />
        </div>
      </div>
    </div>
  );
};

export default BikeDetail;
