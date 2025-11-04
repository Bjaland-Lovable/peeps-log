import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Contact {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
}

interface ContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (contact: Contact) => void;
  editingContact?: Contact | null;
}

const ContactDialog = ({ open, onOpenChange, onSave, editingContact }: ContactDialogProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (editingContact) {
      setName(editingContact.name);
      setEmail(editingContact.email || "");
      setPhone(editingContact.phone || "");
      setAddress(editingContact.address || "");
      setNotes(editingContact.notes || "");
    } else {
      setName("");
      setEmail("");
      setPhone("");
      setAddress("");
      setNotes("");
    }
  }, [editingContact, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...(editingContact?.id ? { id: editingContact.id } : {}),
      name,
      email: email || undefined,
      phone: phone || undefined,
      address: address || undefined,
      notes: notes || undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editingContact ? "Editar Contacto" : "Nuevo Contacto"}
          </DialogTitle>
          <DialogDescription>
            {editingContact
              ? "Actualiza la información del contacto"
              : "Agrega un nuevo contacto a tu agenda"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre completo"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+34 600 000 000"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Calle, número, ciudad, código postal"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Información adicional..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {editingContact ? "Actualizar" : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ContactDialog;
