import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { MapPin, Plus, Save, X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from '@/lib/queryClient';

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
  const mapRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

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

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Convert pixel coordinates to approximate lat/lng (simplified)
    const mapWidth = rect.width;
    const mapHeight = rect.height;
    
    // Simple approximation - in a real app, you'd use a proper map library
    const latOffset = (y - mapHeight / 2) / mapHeight * 0.01;
    const lngOffset = (x - mapWidth / 2) / mapWidth * 0.01;
    
    setMapCenter({
      lat: mapCenter.lat - latOffset,
      lng: mapCenter.lng + lngOffset
    });
  };

  const MapDisplay = () => (
    <div className="relative">
      <div 
        ref={mapRef}
        className="w-full h-80 bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 cursor-crosshair relative overflow-hidden"
        onClick={handleMapClick}
      >
        {/* Map Grid */}
        <div className="absolute inset-0 opacity-20">
          <div className="grid grid-cols-8 grid-rows-6 h-full">
            {Array.from({ length: 48 }).map((_, i) => (
              <div key={i} className="border border-gray-400 dark:border-gray-500" />
            ))}
          </div>
        </div>

        {/* Center Marker */}
        <div 
          className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
          style={{
            left: '50%',
            top: '50%'
          }}
        >
          <MapPin className="h-8 w-8 text-red-500 drop-shadow-lg" />
        </div>

        {/* Radius Circle */}
        <div 
          className="absolute border-2 border-blue-500 border-opacity-60 bg-blue-200 bg-opacity-20 rounded-full transform -translate-x-1/2 -translate-y-1/2 z-5"
          style={{
            left: '50%',
            top: '50%',
            width: `${Math.min(radius / 2, 150)}px`,
            height: `${Math.min(radius / 2, 150)}px`
          }}
        />

        {/* Coordinates Display */}
        <div className="absolute top-2 left-2 bg-white dark:bg-gray-800 px-2 py-1 rounded text-xs font-mono border">
          <div>Lat: {mapCenter.lat.toFixed(6)}</div>
          <div>Lng: {mapCenter.lng.toFixed(6)}</div>
        </div>

        {/* Radius Display */}
        <div className="absolute top-2 right-2 bg-white dark:bg-gray-800 px-2 py-1 rounded text-xs border">
          Radius: {radius}m
        </div>

        {/* Click Instructions */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 px-3 py-1 rounded text-xs border">
          Click on map to set center point
        </div>
      </div>
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