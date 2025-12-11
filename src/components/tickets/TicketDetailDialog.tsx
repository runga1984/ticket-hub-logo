import { useState, useEffect } from 'react';
import { Ticket, TicketStatus } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Calendar, MessageSquare, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface TicketDetailDialogProps {
  ticket: Ticket | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TicketDetailDialog({ ticket, open, onOpenChange }: TicketDetailDialogProps) {
  const { user } = useAuth();
  const { updateTicket } = useData();
  const [status, setStatus] = useState<TicketStatus>('Abierto');
  const [response, setResponse] = useState('');

  useEffect(() => {
    if (ticket) {
      setStatus(ticket.status);
      setResponse(ticket.admin_response || '');
    }
  }, [ticket]);

  if (!ticket) return null;

  const isAdmin = user?.role === 'admin';

  const statusClasses = {
    'Abierto': 'status-badge-open',
    'En Progreso': 'status-badge-progress',
    'Resuelto': 'status-badge-resolved'
  };

  const priorityClasses = {
    'Baja': 'priority-badge-low',
    'Media': 'priority-badge-medium',
    'Alta': 'priority-badge-high',
    'Critica': 'priority-badge-critical'
  };

  const handleUpdate = () => {
    updateTicket(ticket.id, {
      status,
      admin_response: response
    });
    toast.success('Ticket actualizado');
    onOpenChange(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-xl">{ticket.title}</DialogTitle>
              <DialogDescription className="flex items-center gap-2 mt-2">
                <Building2 className="w-4 h-4" />
                {ticket.department_name}
              </DialogDescription>
            </div>
            <Badge className={cn("shrink-0", statusClasses[ticket.status])}>
              {ticket.status}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Meta info */}
          <div className="flex flex-wrap gap-3">
            <Badge variant="outline">{ticket.category}</Badge>
            <Badge className={priorityClasses[ticket.priority]}>
              Prioridad: {ticket.priority}
            </Badge>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(ticket.created_at)}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Descripción del problema</Label>
            <div className="p-4 bg-muted rounded-lg text-sm">
              {ticket.description}
            </div>
          </div>

          {/* Admin Response (if exists or if admin) */}
          {(ticket.admin_response || isAdmin) && (
            <div className="space-y-2">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Respuesta del Soporte
              </Label>
              
              {isAdmin ? (
                <Textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Escriba una respuesta para el usuario..."
                  rows={4}
                />
              ) : ticket.admin_response ? (
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg text-sm">
                  {ticket.admin_response}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  Aún no hay respuesta del equipo de soporte.
                </p>
              )}
            </div>
          )}

          {/* Admin Controls */}
          {isAdmin && (
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="space-y-2">
                <Label>Cambiar Estado</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as TicketStatus)}>
                  <SelectTrigger className="w-full md:w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Abierto">Abierto</SelectItem>
                    <SelectItem value="En Progreso">En Progreso</SelectItem>
                    <SelectItem value="Resuelto">Resuelto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleUpdate} className="w-full md:w-auto">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Guardar Cambios
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
