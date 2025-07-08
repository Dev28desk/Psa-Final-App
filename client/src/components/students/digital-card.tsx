import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QrCode, RotateCcw } from "lucide-react";

interface DigitalCardProps {
  student: {
    id: number;
    studentId: string;
    name: string;
    phone: string;
    profileImageUrl?: string;
    skillLevel: string;
    joiningDate: string;
  };
  sport: string;
  batch: string;
}

export function DigitalCard({ student, sport, batch }: DigitalCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  // Generate payment grid for the year
  const generatePaymentGrid = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentDate = new Date();
    
    return months.map((month, index) => {
      const isPaid = index < currentDate.getMonth(); // Mock payment status
      const isPending = index === currentDate.getMonth();
      const isFuture = index > currentDate.getMonth();
      
      return {
        month,
        status: isPaid ? 'paid' : isPending ? 'pending' : 'future'
      };
    });
  };

  const paymentGrid = generatePaymentGrid();

  return (
    <div className="relative">
      <div className="flex justify-center mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsFlipped(!isFlipped)}
          className="flex items-center space-x-2"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Flip Card</span>
        </Button>
      </div>
      
      <div 
        className={`relative h-64 transition-transform duration-700 transform-style-preserve-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* Front of card */}
        <Card className={`absolute inset-0 digital-card backface-hidden ${isFlipped ? 'invisible' : ''}`}>
          <div className="h-full flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-16 w-16 border-2 border-white">
                  <AvatarImage src={student.profileImageUrl} alt={student.name} />
                  <AvatarFallback className="text-xl font-bold">
                    {student.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-bold">{student.name}</h3>
                  <p className="text-white/80">{student.studentId}</p>
                </div>
              </div>
              <QrCode className="h-12 w-12 text-white/80" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-white/80">Sport:</span>
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {sport}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/80">Batch:</span>
                <span className="text-white">{batch}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/80">Level:</span>
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {student.skillLevel}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/80">Joined:</span>
                <span className="text-white">
                  {new Date(student.joiningDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Back of card */}
        <Card className={`absolute inset-0 digital-card-back rotate-y-180 backface-hidden ${!isFlipped ? 'invisible' : ''}`}>
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Fee Payment Status</h3>
              <span className="text-sm text-white/80">2025</span>
            </div>
            
            <div className="payment-grid flex-1">
              {paymentGrid.map((item, index) => (
                <div key={index} className="flex flex-col items-center space-y-1">
                  <div className="text-xs text-white/80">{item.month}</div>
                  <div className={`payment-cell ${
                    item.status === 'paid' ? 'payment-paid' :
                    item.status === 'pending' ? 'payment-pending' :
                    'payment-future'
                  }`}>
                    {item.status === 'paid' ? '✓' : 
                     item.status === 'pending' ? '•' : ''}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 text-xs text-white/80">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span>Paid</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                  <span>Pending</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-gray-400 rounded"></div>
                  <span>Future</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
