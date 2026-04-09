"use client";

import { useEffect, useState } from "react";
import { getBrowserClient } from "@/lib/supabase/client";
import { shouldUseMockData } from "@/lib/config";
import { useAuthStore } from "@/store/auth-store";
import { mockDriverProfiles, mockEmployerProfiles } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ProfilePage() {
  const profile = useAuthStore((s) => s.profile);
  const setSession = useAuthStore((s) => s.setSession);
  const user = useAuthStore((s) => s.user);
  const mockMode = useAuthStore((s) => s.mockMode);

  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [phone, setPhone] = useState("");
  const [locationName, setLocationName] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [experience, setExperience] = useState("0");
  const [license, setLicense] = useState("");
  const [available, setAvailable] = useState(true);
  const [companyName, setCompanyName] = useState("");
  const [companyDesc, setCompanyDesc] = useState("");

  useEffect(() => {
    if (!profile) return;
    setFullName(profile.full_name ?? "");
    if (shouldUseMockData() || mockMode) {
      if (profile.role === "driver") {
        const d = mockDriverProfiles.find((x) => x.user_id === profile.id);
        if (d) {
          setPhone(d.phone ?? "");
          setLocationName(d.location_name ?? "");
          setLat(d.lat != null ? String(d.lat) : "");
          setLng(d.lng != null ? String(d.lng) : "");
          setExperience(String(d.experience_years));
          setLicense(d.license_type ?? "");
          setAvailable(d.availability);
        }
      } else {
        const e = mockEmployerProfiles.find((x) => x.user_id === profile.id);
        if (e) {
          setCompanyName(e.company_name);
          setCompanyDesc(e.company_description ?? "");
        }
      }
      return;
    }
    const sb = getBrowserClient();
    if (!sb) return;
    void (async () => {
      if (profile.role === "driver") {
        const { data } = await sb
          .from("driver_profiles")
          .select("*")
          .eq("user_id", profile.id)
          .maybeSingle();
        if (data) {
          setPhone(data.phone ?? "");
          setLocationName(data.location_name ?? "");
          setLat(data.lat != null ? String(data.lat) : "");
          setLng(data.lng != null ? String(data.lng) : "");
          setExperience(String(data.experience_years ?? 0));
          setLicense(data.license_type ?? "");
          setAvailable(data.availability ?? true);
        }
      } else {
        const { data } = await sb
          .from("employer_profiles")
          .select("*")
          .eq("user_id", profile.id)
          .maybeSingle();
        if (data) {
          setCompanyName(data.company_name ?? "");
          setCompanyDesc(data.company_description ?? "");
        }
      }
    })();
  }, [profile, mockMode]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    if (!profile || !user) return;

    if (shouldUseMockData() || mockMode) {
      if (profile.role === "driver") {
        const d = mockDriverProfiles.find((x) => x.user_id === profile.id);
        if (d) {
          d.phone = phone;
          d.location_name = locationName;
          d.lat = lat ? parseFloat(lat) : null;
          d.lng = lng ? parseFloat(lng) : null;
          d.experience_years = parseInt(experience, 10) || 0;
          d.license_type = license;
          d.availability = available;
          d.profile.full_name = fullName;
        }
      } else {
        const eprof = mockEmployerProfiles.find((x) => x.user_id === profile.id);
        if (eprof) {
          eprof.company_name = companyName;
          eprof.company_description = companyDesc;
          eprof.profile.full_name = fullName;
        }
      }
      setSession(user, { ...profile, full_name: fullName }, true);
      setSaved(true);
      return;
    }

    const sb = getBrowserClient();
    if (!sb) return;

    await sb
      .from("profiles")
      .update({ full_name: fullName })
      .eq("id", profile.id);

    if (profile.role === "driver") {
      await sb.from("driver_profiles").upsert({
        user_id: profile.id,
        phone,
        location_name: locationName,
        lat: lat ? parseFloat(lat) : null,
        lng: lng ? parseFloat(lng) : null,
        experience_years: parseInt(experience, 10) || 0,
        license_type: license,
        availability: available,
      });
    } else {
      await sb.from("employer_profiles").upsert({
        user_id: profile.id,
        company_name: companyName,
        company_description: companyDesc,
      });
    }

    setSession(user, { ...profile, full_name: fullName }, false);
    setSaved(true);
  }

  async function onCv(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    if (shouldUseMockData() || mockMode) {
      const d = mockDriverProfiles.find((x) => x.user_id === profile.id);
      if (d) d.cv_url = URL.createObjectURL(file);
      setSaved(true);
      return;
    }
    const sb = getBrowserClient();
    if (!sb) {
      setError("Upload requires Supabase Storage bucket `cvs`.");
      return;
    }
    const path = `${profile.id}/${file.name}`;
    const { error: upErr } = await sb.storage.from("cvs").upload(path, file, {
      upsert: true,
    });
    if (upErr) {
      setError(upErr.message);
      return;
    }
    const { data } = sb.storage.from("cvs").getPublicUrl(path);
    await sb
      .from("driver_profiles")
      .update({ cv_url: data.publicUrl })
      .eq("user_id", profile.id);
    setSaved(true);
  }

  if (!profile) return null;

  return (
    <div className="mx-auto max-w-xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <p className="text-zinc-400">
          {profile.role === "driver"
            ? "What employers see when you apply."
            : "Your company on DriverConnect."}
        </p>
        <Badge variant="info" className="mt-2 capitalize">
          {profile.role}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>{profile.email}</CardDescription>
        </CardHeader>
        <form onSubmit={onSave} className="flex flex-col gap-4 px-5 pb-6">
          {error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </p>
          )}
          {saved && (
            <p className="text-sm text-emerald-400">Saved successfully.</p>
          )}

          <div className="space-y-2">
            <Label htmlFor="fullName">Display name</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          {profile.role === "driver" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="loc">Location</Label>
                <Input
                  id="loc"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="City, ST"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="lat">Latitude (map)</Label>
                  <Input
                    id="lat"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    placeholder="41.8781"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lng">Longitude</Label>
                  <Input
                    id="lng"
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    placeholder="-87.6298"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="exp">Years of experience</Label>
                <Input
                  id="exp"
                  type="number"
                  min={0}
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lic">License type</Label>
                <Input
                  id="lic"
                  value={license}
                  onChange={(e) => setLicense(e.target.value)}
                  placeholder="CDL Class A"
                />
              </div>
              <label className="flex cursor-pointer items-center gap-3 text-sm text-zinc-300">
                <input
                  type="checkbox"
                  checked={available}
                  onChange={(e) => setAvailable(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-600"
                />
                Available for work
              </label>
              <div className="space-y-2">
                <Label htmlFor="cv">CV / resume (PDF)</Label>
                <Input
                  id="cv"
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(e) => void onCv(e)}
                  className="cursor-pointer text-zinc-400 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-800 file:px-3 file:py-1.5 file:text-sm file:text-zinc-200"
                />
              </div>
            </>
          )}

          {profile.role === "employer" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="co">Company name</Label>
                <Input
                  id="co"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cd">Company description</Label>
                <textarea
                  id="cd"
                  value={companyDesc}
                  onChange={(e) => setCompanyDesc(e.target.value)}
                  className="flex min-h-[100px] w-full rounded-xl border border-zinc-700 bg-zinc-950/60 px-4 py-3 text-sm text-zinc-100"
                />
              </div>
            </>
          )}

          <Button type="submit">Save profile</Button>
        </form>
      </Card>
    </div>
  );
}
