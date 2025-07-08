import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useWebSocket, WebSocketMessage } from '@/lib/websocket';

export function useRealtime() {
  const queryClient = useQueryClient();

  const handleMessage = (message: WebSocketMessage) => {
    switch (message.type) {
      case 'student_enrolled':
        queryClient.invalidateQueries({ queryKey: ['/api/students'] });
        queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
        break;
      
      case 'payment_received':
        queryClient.invalidateQueries({ queryKey: ['/api/payments'] });
        queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
        queryClient.invalidateQueries({ queryKey: ['/api/payments/revenue-stats'] });
        break;
      
      case 'attendance_marked':
        queryClient.invalidateQueries({ queryKey: ['/api/attendance'] });
        queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
        break;
      
      default:
        console.log('Unknown message type:', message.type);
    }
  };

  const { sendMessage } = useWebSocket(handleMessage);

  return { sendMessage };
}
