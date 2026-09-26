"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { useToast } from "@/components/ui/Toast";
import { useSession } from "next-auth/react";

interface StudentProfileData {
  department: string;
  yearOfStudy: string;
  bio: string;
  interests: string[];
  user: { name: string; avatarInitials: string; avatarColor: string };
}

export default function StudentProfilePage() {
  const { showToast } = useToast();
  const { data: session, update } = useSession();
  const [profile, setProfile] = useState<StudentProfileData | null>(null);
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState("");
  const [bio, setBio] = useState("");
  const [interests, setInterests] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/profile/student");
      const data = await res.json();
      setProfile(data);
      setName(data.user.name);
      setDepartment(data.department);
      setYearOfStudy(data.yearOfStudy);
      setBio(data.bio);
      setInterests(data.interests.join(", "));
      setIsLoading(false);
    }
    load();
  }, []);

  async function handleSave() {
    setIsSaving(true);
    const res = await fetch("/api/profile/student", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, department, yearOfStudy, bio, interests }),
    });
    setIsSaving(false);
    if (res.ok) {
      showToast("Profile updated!", "success");
    } else {
      showToast("Something went wrong", "error");
    }
  }

  if (isLoading || !profile) {
    return <div className="text-sm text-slate">Loading profile...</div>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-charcoal dark:text-white">
          My profile
        </h1>
        <p className="mt-1 text-sm text-slate">
          Keep your profile up to date so mentors know who you are.
        </p>
      </div>

      <Card>
        <div className="flex items-center gap-4">
          <Avatar
            initials={profile.user.avatarInitials}
            colorClass={profile.user.avatarColor}
            size="lg"
          />
          <div>
            <p className="font-heading text-base font-semibold text-charcoal dark:text-white">
              {profile.user.name}
            </p>
            <p className="text-xs text-slate">{profile.department}</p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input
            label="Department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          />
          <Input
            label="Year of study"
            value={yearOfStudy}
            onChange={(e) => setYearOfStudy(e.target.value)}
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-charcoal dark:text-white">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-slate-border bg-surface dark:bg-navy-light dark:border-white/10 px-3.5 py-2.5 text-sm text-charcoal dark:text-white placeholder:text-slate/70 focus:outline-none focus:ring-2 focus:ring-indigo"
            />
          </div>
          <Input
            label="Interests (comma-separated)"
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            placeholder="Machine Learning, Career Coaching"
          />
        </div>

        <Button className="mt-6" onClick={handleSave} isLoading={isSaving}>
          <Save className="h-4 w-4" />
          Save changes
        </Button>
      </Card>
    </div>
  );
}
