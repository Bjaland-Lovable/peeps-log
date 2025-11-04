import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogOut, Plus, Search, User } from "lucide-react";
import { toast } from "sonner";
import ContactCard from "@/components/ContactCard";
import ContactDialog from "@/components/ContactDialog";
import type { Session } from "@supabase/supabase-js";

interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
}

const Index = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ full_name?: string } | null>(null);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      }
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (session?.user) {
      loadProfile();
      loadContacts();
    }
  }, [session]);

  const loadProfile = async () => {
    if (!session?.user) return;

    const { data } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("user_id", session.user.id)
      .single();

    if (data) {
      setProfile(data);
    }
  };

  const loadContacts = async () => {
    if (!session?.user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from("contacts")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Error al cargar contactos");
      console.error(error);
    } else {
      setContacts(data || []);
    }
    setLoading(false);
  };

  const handleSaveContact = async (contact: Contact) => {
    if (!session?.user) return;

    if (contact.id) {
      // Update existing contact
      const { error } = await supabase
        .from("contacts")
        .update({
          name: contact.name,
          email: contact.email,
          phone: contact.phone,
          notes: contact.notes,
        })
        .eq("id", contact.id);

      if (error) {
        toast.error("Error al actualizar el contacto");
        console.error(error);
      } else {
        toast.success("Contacto actualizado");
        loadContacts();
      }
    } else {
      // Create new contact
      const { error } = await supabase
        .from("contacts")
        .insert({
          user_id: session.user.id,
          name: contact.name,
          email: contact.email,
          phone: contact.phone,
          notes: contact.notes,
        });

      if (error) {
        toast.error("Error al crear el contacto");
        console.error(error);
      } else {
        toast.success("Contacto creado");
        loadContacts();
      }
    }
    setEditingContact(null);
  };

  const handleDeleteContact = async (id: string) => {
    const { error } = await supabase
      .from("contacts")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Error al eliminar el contacto");
      console.error(error);
    } else {
      toast.success("Contacto eliminado");
      loadContacts();
    }
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setDialogOpen(true);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Sesión cerrada");
  };

  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phone?.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Mi Agenda
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{profile?.full_name || session?.user?.email}</span>
            </div>
            <Button variant="outline" size="icon" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar contactos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={() => {
            setEditingContact(null);
            setDialogOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Contacto
          </Button>
        </div>

        {filteredContacts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "No se encontraron contactos" : "No tienes contactos aún"}
            </p>
            {!searchTerm && (
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar tu primer contacto
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredContacts.map((contact) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                onDelete={handleDeleteContact}
                onEdit={handleEditContact}
              />
            ))}
          </div>
        )}
      </main>

      <ContactDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSaveContact}
        editingContact={editingContact}
      />
    </div>
  );
};

export default Index;
