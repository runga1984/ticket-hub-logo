import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Ticket, TicketStatus } from '@/types';
import { TicketCard } from '@/components/tickets/TicketCard';
import { TicketDetailDialog } from '@/components/tickets/TicketDetailDialog';
import { CreateTicketForm } from '@/components/tickets/CreateTicketForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus, Filter, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

export function AdminTickets() {
  const { tickets, deleteTicket } = useData();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState<Ticket | null>(null);

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.department_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const openTickets = filteredTickets.filter(t => t.status === 'Abierto');
  const progressTickets = filteredTickets.filter(t => t.status === 'En Progreso');
  const resolvedTickets = filteredTickets.filter(t => t.status === 'Resuelto');

  const handleDeleteTicket = () => {
    if (ticketToDelete) {
      deleteTicket(ticketToDelete.id);
      toast.success('Ticket eliminado exitosamente');
      setTicketToDelete(null);
    }
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex flex-1 gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as TicketStatus | 'all')}>
            <SelectTrigger className="w-40">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="Abierto">Abiertos</SelectItem>
              <SelectItem value="En Progreso">En Progreso</SelectItem>
              <SelectItem value="Resuelto">Resueltos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Crear Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <CreateTicketForm 
              isAdmin={true} 
              onSuccess={() => setIsCreateDialogOpen(false)} 
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs View */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-4">
          <TabsTrigger value="all">
            Todos ({filteredTickets.length})
          </TabsTrigger>
          <TabsTrigger value="open">
            Abiertos ({openTickets.length})
          </TabsTrigger>
          <TabsTrigger value="progress">
            Progreso ({progressTickets.length})
          </TabsTrigger>
          <TabsTrigger value="resolved">
            Resueltos ({resolvedTickets.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <TicketGrid tickets={filteredTickets} onSelect={setSelectedTicket} onDelete={setTicketToDelete} />
        </TabsContent>
        <TabsContent value="open" className="mt-6">
          <TicketGrid tickets={openTickets} onSelect={setSelectedTicket} onDelete={setTicketToDelete} />
        </TabsContent>
        <TabsContent value="progress" className="mt-6">
          <TicketGrid tickets={progressTickets} onSelect={setSelectedTicket} onDelete={setTicketToDelete} />
        </TabsContent>
        <TabsContent value="resolved" className="mt-6">
          <TicketGrid tickets={resolvedTickets} onSelect={setSelectedTicket} onDelete={setTicketToDelete} />
        </TabsContent>
      </Tabs>

      <TicketDetailDialog
        ticket={selectedTicket}
        open={!!selectedTicket}
        onOpenChange={(open) => !open && setSelectedTicket(null)}
      />

      <AlertDialog open={!!ticketToDelete} onOpenChange={(open) => !open && setTicketToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar ticket?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El ticket "{ticketToDelete?.title}" será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTicket} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function TicketGrid({ tickets, onSelect, onDelete }: { tickets: Ticket[]; onSelect: (t: Ticket) => void; onDelete: (t: Ticket) => void }) {
  if (tickets.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No se encontraron tickets
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {tickets.map((ticket) => (
        <div key={ticket.id} className="relative group">
          <TicketCard 
            ticket={ticket} 
            onClick={() => onSelect(ticket)}
            showDepartment={true}
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(ticket);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}