'use client';

import { useState } from 'react';
import { Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { sendPlanToPatient } from '@/lib/actions/treatment-plans';

interface SendPlanDialogProps {
  treatmentPlanId: string;
  patientName: string;
  isOpen: boolean;
  onClose: () => void;
  isPlanActive: boolean;
}

export function SendPlanDialog({
  treatmentPlanId,
  patientName,
  isOpen,
  onClose,
  isPlanActive,
}: SendPlanDialogProps) {
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    setIsSending(true);
    try {
      const result = await sendPlanToPatient(treatmentPlanId);

      if (result.success) {
        toast.success(`Treatment plan sent to ${patientName}`);
        onClose();
      } else {
        toast.error(result.error || 'Failed to send treatment plan');
      }
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Send Treatment Plan</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2">
              {isPlanActive ? (
                <p>
                  This will send the updated treatment plan to <span className="font-medium">{patientName}</span>.
                  The patient will need to review and sign off on the plan.
                </p>
              ) : (
                <p className="text-amber-600">
                  Plan must be published before sending to patient. Please publish the plan first.
                </p>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleSend();
            }}
            disabled={isSending || !isPlanActive}
          >
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send to Patient
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
