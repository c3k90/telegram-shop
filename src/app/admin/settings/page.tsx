import { redirect } from "next/navigation";
import { updateSettingsAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { requireAdmin } from "@/lib/auth/admin";
import { getShopSettings } from "@/lib/settings";

export default async function AdminSettingsPage() {
  if (!(await requireAdmin())) redirect("/admin/login");
  const settings = await getShopSettings();

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <form action={updateSettingsAction} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Shop name</Label>
          <Input id="name" name="name" defaultValue={settings.name} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="welcomeMessage">Welcome message</Label>
          <Textarea
            id="welcomeMessage"
            name="welcomeMessage"
            defaultValue={settings.welcomeMessage}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="currency">Currency</Label>
          <Input
            id="currency"
            name="currency"
            defaultValue={settings.currency}
            required
          />
          <p className="text-xs text-muted-foreground">
            Use EUR, USD, or XTR for Telegram Stars.
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="checkoutEnabled"
            defaultChecked={settings.checkoutEnabled}
          />
          Checkout enabled
        </label>
        <Button type="submit">Save settings</Button>
      </form>
    </div>
  );
}
