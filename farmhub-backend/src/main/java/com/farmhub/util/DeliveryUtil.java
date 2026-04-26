package com.farmhub.util;

public class DeliveryUtil {

    private static final double FARM_LAT = 18.9252275;
    private static final double FARM_LNG = 78.8248532;

    private DeliveryUtil() {
    }

    public static double calculateDistanceInKm(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371;

        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);

        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                        * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }

    public static double calculateDistanceFromFarm(double selectedLat, double selectedLng) {
        return calculateDistanceInKm(FARM_LAT, FARM_LNG, selectedLat, selectedLng);
    }

    public static double getFarmLat() {
        return FARM_LAT;
    }

    public static double getFarmLng() {
        return FARM_LNG;
    }
}
