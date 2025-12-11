import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { TicketPriority, TicketCategory } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Send, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface CreateTicketFormProps {
  isAdmin?: boolean;
  onSuccess?: () => void;
}

export function CreateTicketForm({ isAdmin = false, onSuccess }: CreateTicketFormProps) {
  const { user } = useAuth();
  const { addTicket, getDepartments } = useData();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('Media');
  const [category, setCategory] = useState<TicketCategory>('Software');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');

  const departments = getDepartments();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim()) {
      toast.error('Complete todos los campos requeridos');
      return;
    }

    // Both admin and department users need to select a department
    if (!selectedDepartment) {
      toast.error('Seleccione un departamento');
      return;
    }

    const dept = departments.find(d => d.id.toString() === selectedDepartment);

    if (!dept) {
      toast.error('Departamento no válido');
      return;
    }

    addTicket({
      user_id: dept.id,
      title,
      description,
      priority,
      category,
      status: 'Abierto',
      department_name: dept.name
    });

    toast.success('Ticket creado exitosamente');
    
    // Reset form
    setTitle('');
    setDescription('');
    setPriority('Media');
    setCategory('Software');
    setSelectedDepartment('');
    
    onSuccess?.();
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-primary" />
          {isAdmin ? 'Crear Ticket para Departamento' : 'Nueva Solicitud de Soporte'}
        </CardTitle>
        <CardDescription>
          {isAdmin 
            ? 'Cree un ticket asignándolo a un departamento específico'
            : 'Complete el formulario para reportar un problema o solicitud'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="department">Departamento *</Label>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione su departamento" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id.toString()}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Título del problema *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Impresora no funciona"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción detallada *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describa el problema con el mayor detalle posible..."
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as TicketCategory)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Software">Software</SelectItem>
                  <SelectItem value="Hardware">Hardware</SelectItem>
                  <SelectItem value="Redes">Redes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Prioridad</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as TicketPriority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Baja">Baja</SelectItem>
                  <SelectItem value="Media">Media</SelectItem>
                  <SelectItem value="Alta">Alta</SelectItem>
                  <SelectItem value="Critica">Crítica</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" className="w-full md:w-auto">
            <Send className="w-4 h-4 mr-2" />
            Enviar Solicitud
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}