import { db } from "./db";
import { locationTracking, geofences, coachAttendance, coaches, users } from "@shared/schema";
import { eq, and, desc, gte, lte, sql } from "drizzle-orm";

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: Date;
}

export interface GeofenceData {
  name: string;
  description?: string;
  centerLatitude: number;
  centerLongitude: number;
  radius: number;
  createdBy: number;
}

export class LocationTrackingService {
  // Calculate distance between two points using Haversine formula
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return distance;
  }

  // Check if a location is within a geofence
  async isWithinGeofence(latitude: number, longitude: number, geofenceId: number): Promise<boolean> {
    try {
      const [geofence] = await db.select().from(geofences)
        .where(and(eq(geofences.id, geofenceId), eq(geofences.isActive, true)));
      
      if (!geofence) return false;
      
      const distance = this.calculateDistance(
        latitude,
        longitude,
        parseFloat(geofence.centerLatitude),
        parseFloat(geofence.centerLongitude)
      );
      
      return distance <= geofence.radius;
    } catch (error) {
      console.error('Error checking geofence:', error);
      return false;
    }
  }

  // Track user location
  async trackLocation(userId: number, locationData: LocationData, trackingType: string = 'manual'): Promise<any> {
    try {
      // Check all active geofences to see if user is within any
      const activeGeofences = await db.select().from(geofences)
        .where(eq(geofences.isActive, true));
      
      let isWithinGeofence = false;
      let geofenceId = null;
      
      for (const geofence of activeGeofences) {
        const distance = this.calculateDistance(
          locationData.latitude,
          locationData.longitude,
          parseFloat(geofence.centerLatitude),
          parseFloat(geofence.centerLongitude)
        );
        
        if (distance <= geofence.radius) {
          isWithinGeofence = true;
          geofenceId = geofence.id;
          break;
        }
      }
      
      const [tracking] = await db.insert(locationTracking).values({
        userId,
        latitude: locationData.latitude.toString(),
        longitude: locationData.longitude.toString(),
        accuracy: locationData.accuracy,
        timestamp: locationData.timestamp,
        isWithinGeofence,
        geofenceId,
        trackingType,
        metadata: { timestamp: new Date() }
      }).returning();
      
      return tracking;
    } catch (error) {
      console.error('Error tracking location:', error);
      throw error;
    }
  }

  // Get user's location history
  async getUserLocationHistory(userId: number, limit: number = 50): Promise<any[]> {
    try {
      const history = await db.select({
        id: locationTracking.id,
        latitude: locationTracking.latitude,
        longitude: locationTracking.longitude,
        accuracy: locationTracking.accuracy,
        timestamp: locationTracking.timestamp,
        isWithinGeofence: locationTracking.isWithinGeofence,
        trackingType: locationTracking.trackingType,
        geofenceName: geofences.name
      })
      .from(locationTracking)
      .leftJoin(geofences, eq(locationTracking.geofenceId, geofences.id))
      .where(eq(locationTracking.userId, userId))
      .orderBy(desc(locationTracking.timestamp))
      .limit(limit);
      
      return history;
    } catch (error) {
      console.error('Error fetching location history:', error);
      throw error;
    }
  }

  // Create geofence
  async createGeofence(geofenceData: GeofenceData): Promise<any> {
    try {
      const [geofence] = await db.insert(geofences).values({
        name: geofenceData.name,
        description: geofenceData.description,
        centerLatitude: geofenceData.centerLatitude.toString(),
        centerLongitude: geofenceData.centerLongitude.toString(),
        radius: geofenceData.radius,
        createdBy: geofenceData.createdBy
      }).returning();
      
      return geofence;
    } catch (error) {
      console.error('Error creating geofence:', error);
      throw error;
    }
  }

  // Get all geofences
  async getGeofences(): Promise<any[]> {
    try {
      return await db.select().from(geofences)
        .where(eq(geofences.isActive, true))
        .orderBy(desc(geofences.createdAt));
    } catch (error) {
      console.error('Error fetching geofences:', error);
      throw error;
    }
  }

  // Coach check-in with GPS verification
  async coachCheckIn(coachId: number, batchId: number, location: LocationData): Promise<any> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Check if coach already checked in today
      const [existingAttendance] = await db.select().from(coachAttendance)
        .where(and(
          eq(coachAttendance.coachId, coachId),
          eq(coachAttendance.batchId, batchId),
          eq(coachAttendance.date, today)
        ));
      
      if (existingAttendance && existingAttendance.checkInTime) {
        throw new Error('Coach already checked in for this batch today');
      }
      
      // Check if location is within academy geofence
      const academyGeofences = await db.select().from(geofences)
        .where(and(eq(geofences.isActive, true), eq(geofences.name, 'Academy')));
      
      let isGpsVerified = false;
      let geofenceVerified = false;
      
      if (academyGeofences.length > 0) {
        geofenceVerified = await this.isWithinGeofence(
          location.latitude,
          location.longitude,
          academyGeofences[0].id
        );
        isGpsVerified = location.accuracy <= 20; // Accept if accuracy is within 20 meters
      }
      
      const checkInLocation = {
        lat: location.latitude,
        lng: location.longitude,
        accuracy: location.accuracy,
        timestamp: location.timestamp
      };
      
      let attendance;
      if (existingAttendance) {
        // Update existing record
        [attendance] = await db.update(coachAttendance)
          .set({
            checkInTime: location.timestamp,
            checkInLocation,
            isGpsVerified,
            geofenceVerified,
            status: 'present',
            updatedAt: new Date()
          })
          .where(eq(coachAttendance.id, existingAttendance.id))
          .returning();
      } else {
        // Create new record
        [attendance] = await db.insert(coachAttendance).values({
          coachId,
          batchId,
          date: today,
          checkInTime: location.timestamp,
          checkInLocation,
          isGpsVerified,
          geofenceVerified,
          status: 'present'
        }).returning();
      }
      
      // Track location
      await this.trackLocation(coachId, location, 'attendance');
      
      return attendance;
    } catch (error) {
      console.error('Error in coach check-in:', error);
      throw error;
    }
  }

  // Coach check-out
  async coachCheckOut(coachId: number, batchId: number, location: LocationData): Promise<any> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const [attendance] = await db.select().from(coachAttendance)
        .where(and(
          eq(coachAttendance.coachId, coachId),
          eq(coachAttendance.batchId, batchId),
          eq(coachAttendance.date, today)
        ));
      
      if (!attendance) {
        throw new Error('No check-in record found for today');
      }
      
      const checkOutLocation = {
        lat: location.latitude,
        lng: location.longitude,
        accuracy: location.accuracy,
        timestamp: location.timestamp
      };
      
      const [updatedAttendance] = await db.update(coachAttendance)
        .set({
          checkOutTime: location.timestamp,
          checkOutLocation,
          updatedAt: new Date()
        })
        .where(eq(coachAttendance.id, attendance.id))
        .returning();
      
      // Track location
      await this.trackLocation(coachId, location, 'attendance');
      
      return updatedAttendance;
    } catch (error) {
      console.error('Error in coach check-out:', error);
      throw error;
    }
  }

  // Get coach attendance history
  async getCoachAttendanceHistory(coachId: number, limit: number = 30): Promise<any[]> {
    try {
      const history = await db.select({
        id: coachAttendance.id,
        date: coachAttendance.date,
        checkInTime: coachAttendance.checkInTime,
        checkOutTime: coachAttendance.checkOutTime,
        isGpsVerified: coachAttendance.isGpsVerified,
        geofenceVerified: coachAttendance.geofenceVerified,
        status: coachAttendance.status,
        batchName: sql`batches.name`,
        coachName: coaches.name
      })
      .from(coachAttendance)
      .leftJoin(coaches, eq(coachAttendance.coachId, coaches.id))
      .leftJoin(sql`batches`, eq(coachAttendance.batchId, sql`batches.id`))
      .where(eq(coachAttendance.coachId, coachId))
      .orderBy(desc(coachAttendance.date))
      .limit(limit);
      
      return history;
    } catch (error) {
      console.error('Error fetching coach attendance history:', error);
      throw error;
    }
  }

  // Get live coach locations
  async getLiveCoachLocations(): Promise<any[]> {
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      
      const liveLocations = await db.select({
        userId: locationTracking.userId,
        latitude: locationTracking.latitude,
        longitude: locationTracking.longitude,
        accuracy: locationTracking.accuracy,
        timestamp: locationTracking.timestamp,
        userName: users.name,
        isWithinGeofence: locationTracking.isWithinGeofence
      })
      .from(locationTracking)
      .leftJoin(users, eq(locationTracking.userId, users.id))
      .where(and(
        gte(locationTracking.timestamp, fiveMinutesAgo),
        eq(locationTracking.trackingType, 'attendance')
      ))
      .orderBy(desc(locationTracking.timestamp));
      
      return liveLocations;
    } catch (error) {
      console.error('Error fetching live coach locations:', error);
      throw error;
    }
  }
}

export const locationTrackingService = new LocationTrackingService();