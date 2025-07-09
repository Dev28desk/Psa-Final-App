import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { MapPin, Plus, Save, X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from '@/lib/queryClient';

// Google Maps API Key
const GOOGLE_MAPS_API_KEY = 'AIzaSyBvuLhJNi_L5dAaEO9zJpJ5P3EjxdF_oYw';

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

interface GeofenceCreatorProps {
  onGeofenceCreated?: () => void;
}

export const GeofenceCreator: React.FC<GeofenceCreatorProps> = ({ onGeofenceCreated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 19.0760, lng: 72.8777 }); // Mumbai coordinates
  const [radius, setRadius] = useState(100);
  const [geofenceName, setGeofenceName] = useState('');
  const [description, setDescription] = useState('');
  const [isUsingCurrentLocation, setIsUsingCurrentLocation] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const circleRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Load Google Maps API
  useEffect(() => {
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=geometry`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setIsMapLoaded(true);
      };
      document.head.appendChild(script);
    } else {
      setIsMapLoaded(true);
    }
  }, []);

  // Initialize map when dialog opens
  useEffect(() => {
    if (isOpen && isMapLoaded && mapRef.current && !mapInstanceRef.current) {
      initializeMap();
    }
  }, [isOpen, isMapLoaded]);

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: mapCenter,
      zoom: 16,
      mapTypeId: 'hybrid',
      disableDefaultUI: false,
      zoomControl: true,
      streetViewControl: false,
      fullscreenControl: false,
    });

    mapInstanceRef.current = map;

    // Add click listener to map
    map.addListener('click', (event: any) => {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      setMapCenter({ lat, lng });
      updateMapMarkers(map, { lat, lng });
    });

    // Initialize markers
    updateMapMarkers(map, mapCenter);
  };

  const updateMapMarkers = (map: any, center: { lat: number; lng: number }) => {
    // Remove existing markers
    if (markerRef.current) {
      markerRef.current.setMap(null);
    }
    if (circleRef.current) {
      circleRef.current.setMap(null);
    }

    // Add center marker
    markerRef.current = new window.google.maps.Marker({
      position: center,
      map: map,
      title: 'Geofence Center',
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="red" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(24, 24),
      },
    });

    // Add radius circle
    circleRef.current = new window.google.maps.Circle({
      strokeColor: '#3b82f6',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#3b82f6',
      fillOpacity: 0.2,
      map: map,
      center: center,
      radius: radius,
    });

    // Center map on new location
    map.setCenter(center);
  };

  // Update circle radius when radius changes
  useEffect(() => {
    if (circleRef.current) {
      circleRef.current.setRadius(radius);
    }
  }, [radius]);

  // Update markers when map center changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      updateMapMarkers(mapInstanceRef.current, mapCenter);
    }
  }, [mapCenter]);

  const createGeofenceMutation = useMutation({
    mutationFn: async (geofenceData: any) => {
      return await apiRequest('POST', '/api/geofences', geofenceData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/geofences'] });
      toast({
        title: "Success",
        description: "Geofence created successfully",
      });
      setIsOpen(false);
      resetForm();
      if (onGeofenceCreated) onGeofenceCreated();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create geofence",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setGeofenceName('');
    setDescription('');
    setRadius(100);
    setMapCenter({ lat: 19.0760, lng: 72.8777 });
  };

  const getCurrentLocation = () => {
    setIsUsingCurrentLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setMapCenter({ lat: latitude, lng: longitude });
          setIsUsingCurrentLocation(false);
          toast({
            title: "Location Updated",
            description: "Map centered on your current location",
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsUsingCurrentLocation(false);
          toast({
            title: "Location Error",
            description: "Unable to get current location. Please select manually on the map.",
            variant: "destructive",
          });
        }
      );
    } else {
      setIsUsingCurrentLocation(false);
      toast({
        title: "Location Not Supported",
        description: "Geolocation is not supported by your browser",
        variant: "destructive",
      });
    }
  };

  // Clean up map instance when dialog closes
  useEffect(() => {
    if (!isOpen && mapInstanceRef.current) {
      mapInstanceRef.current = null;
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
      if (circleRef.current) {
        circleRef.current.setMap(null);
        circleRef.current = null;
      }
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!geofenceName.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a geofence name",
        variant: "destructive",
      });
      return;
    }

    createGeofenceMutation.mutate({
      name: geofenceName,
      description: description,
      centerLatitude: mapCenter.lat,
      centerLongitude: mapCenter.lng,
      radius: radius,
      createdBy: 1 // Replace with actual user ID
    });
  };



  const MapDisplay = () => (
    <div className="relative">
      {!isMapLoaded ? (
        <div className="w-full h-80 bg-gradient-to-br from-blue-100 to-green-100 dark:from-blue-900 dark:to-green-900 rounded-lg border flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Loading Google Maps...</p>
          </div>
        </div>
      ) : (
        <div className="w-full h-80 rounded-lg border overflow-hidden">
          <div ref={mapRef} className="w-full h-full" />
        </div>
      )}
      
      {/* Map Controls Overlay */}
      {isMapLoaded && (
        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
          <div className="bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-lg border text-xs">
            <div className="font-semibold text-gray-900 dark:text-gray-100">
              {mapCenter.lat.toFixed(6)}, {mapCenter.lng.toFixed(6)}
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              Radius: {radius}m • Area: ~{Math.round(Math.PI * radius * radius / 10000)} ha
            </div>
          </div>
          <div className="bg-blue-500 text-white px-3 py-2 rounded-lg shadow-lg text-xs">
            Click map to set center
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Geofence
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Geofence</DialogTitle>
          <DialogDescription>
            Set up a geographical boundary for GPS-verified attendance tracking
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Map Display */}
          <div className="space-y-2">
            <Label>Location & Boundaries</Label>
            <MapDisplay />
            
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={getCurrentLocation}
                disabled={isUsingCurrentLocation}
              >
                <MapPin className="h-4 w-4 mr-2" />
                {isUsingCurrentLocation ? "Getting Location..." : "Use Current Location"}
              </Button>
              
              <Badge variant="secondary" className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {mapCenter.lat.toFixed(6)}, {mapCenter.lng.toFixed(6)}
              </Badge>
            </div>
          </div>

          {/* Radius Control */}
          <div className="space-y-2">
            <Label>Radius: {radius} meters</Label>
            <Slider
              value={[radius]}
              onValueChange={(value) => setRadius(value[0])}
              min={10}
              max={500}
              step={10}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>10m</span>
              <span>250m</span>
              <span>500m</span>
            </div>
          </div>

          {/* Geofence Details */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="geofence-name">Geofence Name *</Label>
              <Input
                id="geofence-name"
                value={geofenceName}
                onChange={(e) => setGeofenceName(e.target.value)}
                placeholder="e.g., Main Academy, Training Ground A"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description of this geofence area"
                rows={3}
              />
            </div>
          </div>

          {/* Preview Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Geofence Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Center:</span> {mapCenter.lat.toFixed(6)}, {mapCenter.lng.toFixed(6)}
                </div>
                <div>
                  <span className="font-medium">Radius:</span> {radius} meters
                </div>
                <div>
                  <span className="font-medium">Area:</span> ~{Math.round(Math.PI * radius * radius / 10000)} hectares
                </div>
                <div>
                  <span className="font-medium">Name:</span> {geofenceName || 'Not set'}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={createGeofenceMutation.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {createGeofenceMutation.isPending ? "Creating..." : "Create Geofence"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};