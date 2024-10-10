import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Camera, Edit, Trash2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

type ProfileSettings = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

interface ProfileSettingsProps {
  persona: string;
  handleSavePersona: (personaString: string) => Promise<void>;
  handleSaveProfile: (formData: FormData) => Promise<any>;
}

export default function ProfileSettings({
  persona,
  handleSavePersona,
  handleSaveProfile,
}: ProfileSettingsProps) {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileSettings, setProfileSettings] = useState<ProfileSettings>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [personaString, setPersonaString] = useState(persona);
  const [isEditingPersona, setIsEditingPersona] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setProfileSettings({
        firstName: user.name.split(" ")[0],
        lastName: user.name.split(" ")[1] || "",
        email: user.email,
        password: "",
        confirmPassword: "",
      });
      setProfileImage(user.profileImage.length > 0 ? user.profileImage : null);
    }
  }, []);

  useEffect(() => {
    setPersonaString(persona);
  }, [persona]);

  const handleEditProfile = () => {
    setIsEditingProfile(true);
  };

  const handleCancelEditProfile = () => {
    setIsEditingProfile(false);
    setProfileSettings({
      firstName: user?.name.split(" ")[0] || "",
      lastName: user?.name.split(" ")[1] || "",
      email: user?.email || "",
      password: "",
      confirmPassword: "",
    });
    setProfileImage(
      user?.profileImage && user.profileImage.length > 0
        ? user.profileImage
        : null
    );
  };

  const onSaveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { firstName, lastName, password, confirmPassword } = profileSettings;
    const formData = new FormData();
    formData.append("name", `${firstName} ${lastName}`);
    if (password) {
      if (password !== confirmPassword) {
        toast({
          title: "Error",
          description: "Passwords do not match",
          variant: "destructive",
        });
        throw new Error("Passwords do not match");
      }
      formData.append("password", password);
    }

    if (fileInputRef.current?.files?.[0]) {
      formData.append("profileImage", fileInputRef.current.files[0]);
    }
    const data = await handleSaveProfile(formData);
    if (data.status === "failure") setProfileImage(null);
    setIsEditingProfile(false);
  };

  const handleProfileSettingsChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setProfileSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditPersona = () => {
    setIsEditingPersona(true);
  };

  const handleCancelEditPersona = () => {
    setIsEditingPersona(false);
  };

  const onSavePersona = async () => {
    await handleSavePersona(personaString);
    setIsEditingPersona(false);
  };

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeProfileImage = () => {
    setProfileImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            Profile Settings
            {!isEditingProfile && (
              <Button variant="ghost" size="sm" onClick={handleEditProfile}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden cursor-pointer">
              {profileImage ? (
                <Image
                  src={profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  width={500}
                  height={300}
                />
              ) : (
                <Camera className="h-8 w-8 text-gray-400" />
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleProfileImageUpload}
            />
            <div className="flex items-center space-x-2">
              {isEditingProfile ? (
                <Button onClick={triggerFileInput}>
                  {profileImage ? "Change Image" : "Upload Image"}
                </Button>
              ) : null}
              {profileImage && isEditingProfile && (
                <Button variant="destructive" onClick={removeProfileImage}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove Image
                </Button>
              )}
            </div>
          </div>
          <form className="space-y-4" onSubmit={onSaveProfile}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <p className="text-gray-900">{profileSettings.email}</p>
            </div>
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                First Name
              </label>
              {isEditingProfile ? (
                <Input
                  id="firstName"
                  name="firstName"
                  value={profileSettings.firstName}
                  onChange={handleProfileSettingsChange}
                />
              ) : (
                <p className="text-gray-900">{profileSettings.firstName}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Last Name
              </label>
              {isEditingProfile ? (
                <Input
                  id="lastName"
                  name="lastName"
                  value={profileSettings.lastName}
                  onChange={handleProfileSettingsChange}
                />
              ) : (
                <p className="text-gray-900">{profileSettings.lastName}</p>
              )}
            </div>
            {isEditingProfile ? (
              <>
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    New Password
                  </label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={profileSettings.password}
                    onChange={handleProfileSettingsChange}
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Confirm Password
                  </label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={profileSettings.confirmPassword}
                    onChange={handleProfileSettingsChange}
                    placeholder="Confirm new password"
                  />
                </div>
              </>
            ) : null}
            {isEditingProfile && (
              <div className="flex space-x-2">
                <Button type="submit" className="bg-pink-500 hover:bg-pink-600">
                  Save Changes
                </Button>
                <Button
                  type="button"
                  onClick={handleCancelEditProfile}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            Persona Settings
            {!isEditingPersona && (
              <Button variant="ghost" size="sm" onClick={handleEditPersona}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isEditingPersona ? (
            <Textarea
              value={personaString}
              onChange={(e) => setPersonaString(e.target.value)}
              className="min-h-[150px]"
              placeholder="Describe your professional persona..."
            />
          ) : (
            <p className="text-gray-900">{persona}</p>
          )}
          {isEditingPersona && (
            <div className="flex space-x-2">
              <Button
                onClick={onSavePersona}
                className="bg-pink-500 hover:bg-pink-600"
              >
                Save Persona
              </Button>
              <Button onClick={handleCancelEditPersona} variant="outline">
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
