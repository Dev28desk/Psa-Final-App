import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapPin, Clock, CheckCircle, XCircle, Navigation, Users, Shield, AlertCircle, Play, Square } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { GeofenceCreator } from "@/components/gps/geofence-creator";

interface LocationData {
  id: number;
  userId: number;
  latitude: string;
  longitude: string;
  accuracy: number;
  timestamp: string;
  isWithinGeofence: boolean;
  trackingType: string;
  geofenceName?: string;
}

interface Geofence {
  id: number;
  name: string;
  description: string;
  centerLatitude: string;
  centerLongitude: string;
  radius: number;
  isActive: boolean;
  createdAt: string;
}

interface CoachAttendance {
  id: number;
  coachId: number;
  batchId: number;
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  isGpsVerified: boolean;
  geofenceVerified: boolean;
  status: string;
  coachName: string;
  batchName: string;
}

interface LocationState {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: Date;
}

export default function GPSTracking() {
  const [selectedTab, setSelectedTab] = useState("live");
  const [currentLocation, setCurrentLocation] = useState<LocationState | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [watchId, setWatchId] = useState<number | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date()
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          toast({
            title: "Location Error",
            description: "Unable to get your current location. Please enable location services.",
            variant: "destructive"
          });
        }
      );
    }
  }, [toast]);

  // Start/Stop real-time tracking
  const toggleTracking = () => {
    if (isTracking) {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
        setWatchId(null);
      }
      setIsTracking(false);
    } else {
      if (navigator.geolocation) {
        const id = navigator.geolocation.watchPosition(
          (position) => {
            const locationData = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: new Date()
            };
            setCurrentLocation(locationData);
            
            // Track location automatically
            trackLocationMutation.mutate({
              userId: 1, // This should be the current user's ID
              latitude: locationData.latitude,
              longitude: locationData.longitude,
              accuracy: locationData.accuracy,
              trackingType: "automatic"
            });
          },
          (error) => {
            console.error("Error tracking location:", error);
            toast({
              title: "Tracking Error",
              description: "Unable to track your location continuously.",
              variant: "destructive"
            });
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          }
        );
        setWatchId(id);
        setIsTracking(true);
      }
    }
  };

  // Fetch live locations
  const { data: liveLocations, isLoading: liveLoading } = useQuery({
    queryKey: ["/api/location/live"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/location/live");
      return response.json();
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Fetch geofences
  const { data: geofences, isLoading: geofencesLoading } = useQuery({
    queryKey: ["/api/geofences"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/geofences");
      return response.json();
    }
  });

  // Fetch coaches
  const { data: coaches } = useQuery({
    queryKey: ["/api/coaches"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/coaches");
      return response.json();
    }
  });

  // Fetch batches
  const { data: batches } = useQuery({
    queryKey: ["/api/batches"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/batches");
      return response.json();
    }
  });

  // Track location mutation
  const trackLocationMutation = useMutation({
    mutationFn: async (locationData: any) => {
      const response = await apiRequest("POST", "/api/location/track", locationData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/location/live"] });
    },
    onError: (error: Error) => {
      console.error("Error tracking location:", error);
    }
  });



  // Coach check-in mutation
  const checkInMutation = useMutation({
    mutationFn: async () => {
      if (!currentLocation || !selectedCoach || !selectedBatch) {
        throw new Error("Missing required data for check-in");
      }
      
      const response = await apiRequest("POST", "/api/coach/checkin", {
        coachId: selectedCoach,
        batchId: selectedBatch,
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        accuracy: currentLocation.accuracy
      });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Check-in successful" });
      queryClient.invalidateQueries({ queryKey: ["/api/coach/attendance"] });
    },
    onError: (error: Error) => {
      toast({ title: "Check-in failed", description: error.message, variant: "destructive" });
    }
  });

  // Coach check-out mutation
  const checkOutMutation = useMutation({
    mutationFn: async () => {
      if (!currentLocation || !selectedCoach || !selectedBatch) {
        throw new Error("Missing required data for check-out");
      }
      
      const response = await apiRequest("POST", "/api/coach/checkout", {
        coachId: selectedCoach,
        batchId: selectedBatch,
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        accuracy: currentLocation.accuracy
      });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Check-out successful" });
      queryClient.invalidateQueries({ queryKey: ["/api/coach/attendance"] });
    },
    onError: (error: Error) => {
      toast({ title: "Check-out failed", description: error.message, variant: "destructive" });
    }
  });



  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">GPS Tracking</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Real-time location tracking and geofencing for coach attendance
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={isTracking ? "destructive" : "default"}
            onClick={toggleTracking}
            className="flex items-center gap-2"
          >
            {isTracking ? (
              <>
                <Square className="h-4 w-4" />
                Stop Tracking
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Start Tracking
              </>
            )}
          </Button>
          <GeofenceCreator onGeofenceCreated={() => {
            queryClient.invalidateQueries({ queryKey: ['/api/geofences'] });
          }} />
        </div>
      </div>

      {/* Current Location Alert */}
      {currentLocation && (
        <Alert>
          <MapPin className="h-4 w-4" />
          <AlertDescription>
            Current Location: {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)} 
            (Accuracy: {currentLocation.accuracy.toFixed(0)}m)
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="live">Live Tracking</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="geofences">Geofences</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Live Coach Locations
              </CardTitle>
              <CardDescription>
                Real-time location tracking of coaches (last 5 minutes)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {liveLoading ? (
                <div className="h-48 flex items-center justify-center">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : (
                <div className="space-y-4">
                  {liveLocations?.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No live locations available
                    </div>
                  ) : (
                    liveLocations?.map((location: any) => (
                      <div key={location.userId} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${location.isWithinGeofence ? 'bg-green-500' : 'bg-red-500'}`} />
                            <span className="font-medium">{location.userName}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {parseFloat(location.latitude).toFixed(6)}, {parseFloat(location.longitude).toFixed(6)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm">
                            {format(new Date(location.timestamp), 'HH:mm:ss')}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Accuracy: {location.accuracy}m
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Coach Check-In/Out
              </CardTitle>
              <CardDescription>
                GPS-verified attendance tracking for coaches
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="coach-select">Select Coach</Label>
                    <Select value={selectedCoach} onValueChange={setSelectedCoach}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select coach" />
                      </SelectTrigger>
                      <SelectContent>
                        {coaches?.map((coach: any) => (
                          <SelectItem key={coach.id} value={coach.id.toString()}>
                            {coach.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="batch-select">Select Batch</Label>
                    <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select batch" />
                      </SelectTrigger>
                      <SelectContent>
                        {batches?.map((batch: any) => (
                          <SelectItem key={batch.id} value={batch.id.toString()}>
                            {batch.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => checkInMutation.mutate()}
                    disabled={checkInMutation.isPending || !selectedCoach || !selectedBatch || !currentLocation}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Check In
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => checkOutMutation.mutate()}
                    disabled={checkOutMutation.isPending || !selectedCoach || !selectedBatch || !currentLocation}
                    className="flex items-center gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    Check Out
                  </Button>
                </div>

                {(!currentLocation || !selectedCoach || !selectedBatch) && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Please select a coach, batch, and ensure location access is enabled.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geofences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Geofences ({geofences?.length || 0})
              </CardTitle>
              <CardDescription>
                Geographical boundaries for attendance verification
              </CardDescription>
            </CardHeader>
            <CardContent>
              {geofencesLoading ? (
                <div className="h-48 flex items-center justify-center">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : (
                <div className="space-y-4">
                  {geofences?.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No geofences configured
                    </div>
                  ) : (
                    geofences?.map((geofence: Geofence) => (
                      <div key={geofence.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">{geofence.name}</h3>
                            <p className="text-sm text-muted-foreground">{geofence.description}</p>
                          </div>
                          <Badge variant={geofence.isActive ? "default" : "secondary"}>
                            {geofence.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <div className="mt-2 text-sm text-muted-foreground">
                          <div>Center: {parseFloat(geofence.centerLatitude).toFixed(6)}, {parseFloat(geofence.centerLongitude).toFixed(6)}</div>
                          <div>Radius: {geofence.radius}m</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Location History</CardTitle>
              <CardDescription>
                Historical location tracking data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Select a user to view their location history
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}