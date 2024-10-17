import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { authFetch } from "../utils/authFetch";

interface PersonaPreviewProps {
  persona: string;
  onSave: (newPersona: string) => void;
  onCancel: () => void;
}

export function PersonaPreview({
  persona,
  onSave,
  onCancel,
}: PersonaPreviewProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [editedPersona, setEditedPersona] = useState(persona);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await authFetch("/api/digital-persona", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ personaData: editedPersona }),
      });

      if (!response.ok) {
        throw new Error("Failed to save persona");
      }

      onSave(editedPersona);
    } catch (err) {
      console.error("Error saving persona:", err);
      setError("Failed to save persona. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setError(null);
    setEditedPersona(event.target.value);
  };

  return (
    <div className="max-w-full mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">Generated Persona</h1>
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <Textarea
          value={editedPersona}
          onChange={handleChange}
          className="w-full h-[60vh] text-sm font-mono"
          placeholder="Your generated persona will appear here. You can edit it before saving."
        />
      </div>
      <div className="flex justify-between">
        <Button onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}
