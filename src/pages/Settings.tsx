import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Bell, ShieldCheck, Database, Server, UserCog, Users } from "lucide-react";
import { UserManagement } from "@/components/settings/user-management";

type Role = "admin" | "staff";

const Settings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("account");
  
  const userRole = user?.role === "admin" || user?.role === "staff" 
    ? user.role 
    : "admin";
  
  const [accountForm, setAccountForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    role: userRole as Role
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    newAlumniFound: true,
    crawlerComplete: true,
    weeklyDigest: true,
    errorAlerts: true
  });
  
  const [crawlerSettings, setCrawlerSettings] = useState({
    maxConcurrentCrawlers: "2",
    scanFrequency: "daily",
    retryFailedPages: true,
    respectRobotsTxt: true,
    saveRawHtml: false
  });
  
  const [privacySettings, setPrivacySettings] = useState({
    storePersonalData: true,
    anonymizeExports: false,
    dataRetentionPeriod: "1-year",
    allowDataSharing: false
  });
  
  const [exportSettings, setExportSettings] = useState({
    defaultFormat: "csv",
    includeMetadata: true,
    compressionEnabled: false,
    maxExportRows: "1000"
  });
  
  const handleAccountSave = () => {
    toast({
      title: "Account settings saved",
      description: "Your account information has been updated"
    });
  };
  
  const handleNotificationToggle = (key, value) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: value
    }));
    
    toast({
      title: `${value ? "Enabled" : "Disabled"} notification`,
      description: `${key.replace(/([A-Z])/g, " $1").toLowerCase()} notifications ${value ? "enabled" : "disabled"}`
    });
  };
  
  const handleCrawlerSettingsSave = () => {
    toast({
      title: "Crawler settings saved",
      description: "Your crawler settings have been updated"
    });
  };
  
  const handlePrivacySettingsSave = () => {
    toast({
      title: "Privacy settings saved",
      description: "Your privacy settings have been updated"
    });
  };
  
  const handleExportSettingsSave = () => {
    toast({
      title: "Export settings saved",
      description: "Your export settings have been updated"
    });
  };

  const canManageUsers = user?.role === "admin" || user?.permissions?.canCreateUsers;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and application preferences
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="account" className="flex items-center gap-1">
            <UserCog className="h-4 w-4" />
            <span>Account</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-1">
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="crawlers" className="flex items-center gap-1">
            <Server className="h-4 w-4" />
            <span>Crawlers</span>
          </TabsTrigger>
          <TabsTrigger value="exports" className="flex items-center gap-1">
            <Database className="h-4 w-4" />
            <span>Exports</span>
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-1">
            <ShieldCheck className="h-4 w-4" />
            <span>Privacy</span>
          </TabsTrigger>
          {canManageUsers && (
            <TabsTrigger value="users" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>Users</span>
            </TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Update your account details and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Full Name
                  </label>
                  <Input 
                    id="name" 
                    value={accountForm.name} 
                    onChange={(e) => setAccountForm({...accountForm, name: e.target.value})}
                  />
                </div>
                
                <div className="grid gap-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={accountForm.email} 
                    onChange={(e) => setAccountForm({...accountForm, email: e.target.value})}
                  />
                </div>
                
                <div className="grid gap-2">
                  <label htmlFor="role" className="text-sm font-medium">
                    Role
                  </label>
                  <Select 
                    value={accountForm.role} 
                    onValueChange={(value: Role) => setAccountForm({...accountForm, role: value})}
                    disabled
                  >
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrator</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Role changes require administrator approval
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Password</h3>
                <div className="grid gap-2">
                  <label htmlFor="current-password" className="text-sm font-medium">
                    Current Password
                  </label>
                  <Input id="current-password" type="password" />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="new-password" className="text-sm font-medium">
                    New Password
                  </label>
                  <Input id="new-password" type="password" />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="confirm-password" className="text-sm font-medium">
                    Confirm New Password
                  </label>
                  <Input id="confirm-password" type="password" />
                </div>
              </div>
              
              <Button onClick={handleAccountSave} className="w-full">
                Save Account Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Configure how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">Email Notifications</h3>
                    <p className="text-xs text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch 
                    checked={notificationSettings.emailNotifications} 
                    onCheckedChange={(checked) => handleNotificationToggle("emailNotifications", checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">New Alumni Found</h3>
                    <p className="text-xs text-muted-foreground">
                      Get notified when new alumni profiles are discovered
                    </p>
                  </div>
                  <Switch 
                    checked={notificationSettings.newAlumniFound} 
                    onCheckedChange={(checked) => handleNotificationToggle("newAlumniFound", checked)}
                    disabled={!notificationSettings.emailNotifications}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">Crawler Complete</h3>
                    <p className="text-xs text-muted-foreground">
                      Get notified when a crawler completes its run
                    </p>
                  </div>
                  <Switch 
                    checked={notificationSettings.crawlerComplete} 
                    onCheckedChange={(checked) => handleNotificationToggle("crawlerComplete", checked)}
                    disabled={!notificationSettings.emailNotifications}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">Weekly Digest</h3>
                    <p className="text-xs text-muted-foreground">
                      Receive a weekly summary of all crawler activity
                    </p>
                  </div>
                  <Switch 
                    checked={notificationSettings.weeklyDigest} 
                    onCheckedChange={(checked) => handleNotificationToggle("weeklyDigest", checked)}
                    disabled={!notificationSettings.emailNotifications}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">Error Alerts</h3>
                    <p className="text-xs text-muted-foreground">
                      Get notified when crawlers encounter errors
                    </p>
                  </div>
                  <Switch 
                    checked={notificationSettings.errorAlerts} 
                    onCheckedChange={(checked) => handleNotificationToggle("errorAlerts", checked)}
                    disabled={!notificationSettings.emailNotifications}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="crawlers">
          <Card>
            <CardHeader>
              <CardTitle>Crawler Configuration</CardTitle>
              <CardDescription>
                Global settings for all web crawlers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <label htmlFor="max-crawlers" className="text-sm font-medium">
                    Maximum Concurrent Crawlers
                  </label>
                  <Select 
                    value={crawlerSettings.maxConcurrentCrawlers} 
                    onValueChange={(value) => setCrawlerSettings({...crawlerSettings, maxConcurrentCrawlers: value})}
                  >
                    <SelectTrigger id="max-crawlers">
                      <SelectValue placeholder="Select maximum" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 crawler</SelectItem>
                      <SelectItem value="2">2 crawlers</SelectItem>
                      <SelectItem value="3">3 crawlers</SelectItem>
                      <SelectItem value="unlimited">Unlimited</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Higher numbers may impact system performance
                  </p>
                </div>
                
                <div className="grid gap-2">
                  <label htmlFor="frequency" className="text-sm font-medium">
                    Default Scanning Frequency
                  </label>
                  <Select 
                    value={crawlerSettings.scanFrequency} 
                    onValueChange={(value) => setCrawlerSettings({...crawlerSettings, scanFrequency: value})}
                  >
                    <SelectTrigger id="frequency">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">Retry Failed Pages</h3>
                    <p className="text-xs text-muted-foreground">
                      Automatically retry pages that fail to load
                    </p>
                  </div>
                  <Switch 
                    checked={crawlerSettings.retryFailedPages} 
                    onCheckedChange={(checked) => setCrawlerSettings({...crawlerSettings, retryFailedPages: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">Respect robots.txt</h3>
                    <p className="text-xs text-muted-foreground">
                      Follow robots.txt directives on websites
                    </p>
                  </div>
                  <Switch 
                    checked={crawlerSettings.respectRobotsTxt} 
                    onCheckedChange={(checked) => setCrawlerSettings({...crawlerSettings, respectRobotsTxt: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">Save Raw HTML</h3>
                    <p className="text-xs text-muted-foreground">
                      Store raw HTML of crawled pages for later analysis
                    </p>
                  </div>
                  <Switch 
                    checked={crawlerSettings.saveRawHtml} 
                    onCheckedChange={(checked) => setCrawlerSettings({...crawlerSettings, saveRawHtml: checked})}
                  />
                </div>
              </div>
              
              <Button onClick={handleCrawlerSettingsSave} className="w-full">
                Save Crawler Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="exports">
          <Card>
            <CardHeader>
              <CardTitle>Export Preferences</CardTitle>
              <CardDescription>
                Configure how alumni data is exported
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <label htmlFor="export-format" className="text-sm font-medium">
                    Default Export Format
                  </label>
                  <Select 
                    value={exportSettings.defaultFormat} 
                    onValueChange={(value) => setExportSettings({...exportSettings, defaultFormat: value})}
                  >
                    <SelectTrigger id="export-format">
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <label htmlFor="max-rows" className="text-sm font-medium">
                    Maximum Export Rows
                  </label>
                  <Select 
                    value={exportSettings.maxExportRows} 
                    onValueChange={(value) => setExportSettings({...exportSettings, maxExportRows: value})}
                  >
                    <SelectTrigger id="max-rows">
                      <SelectValue placeholder="Select maximum" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="100">100 rows</SelectItem>
                      <SelectItem value="500">500 rows</SelectItem>
                      <SelectItem value="1000">1,000 rows</SelectItem>
                      <SelectItem value="5000">5,000 rows</SelectItem>
                      <SelectItem value="unlimited">Unlimited</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Larger exports will take more time to generate
                  </p>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">Include Metadata</h3>
                    <p className="text-xs text-muted-foreground">
                      Include crawling metadata with exports
                    </p>
                  </div>
                  <Switch 
                    checked={exportSettings.includeMetadata} 
                    onCheckedChange={(checked) => setExportSettings({...exportSettings, includeMetadata: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">Enable Compression</h3>
                    <p className="text-xs text-muted-foreground">
                      Compress large exports as ZIP files
                    </p>
                  </div>
                  <Switch 
                    checked={exportSettings.compressionEnabled} 
                    onCheckedChange={(checked) => setExportSettings({...exportSettings, compressionEnabled: checked})}
                  />
                </div>
              </div>
              
              <Button onClick={handleExportSettingsSave} className="w-full">
                Save Export Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>
                Configure how alumni data is stored and handled
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">Store Personal Data</h3>
                    <p className="text-xs text-muted-foreground">
                      Store personal data like contact information
                    </p>
                  </div>
                  <Switch 
                    checked={privacySettings.storePersonalData} 
                    onCheckedChange={(checked) => setPrivacySettings({...privacySettings, storePersonalData: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">Anonymize Exports</h3>
                    <p className="text-xs text-muted-foreground">
                      Remove identifiable information from exports
                    </p>
                  </div>
                  <Switch 
                    checked={privacySettings.anonymizeExports} 
                    onCheckedChange={(checked) => setPrivacySettings({...privacySettings, anonymizeExports: checked})}
                  />
                </div>
                
                <div className="grid gap-2">
                  <label htmlFor="retention" className="text-sm font-medium">
                    Data Retention Period
                  </label>
                  <Select 
                    value={privacySettings.dataRetentionPeriod} 
                    onValueChange={(value) => setPrivacySettings({...privacySettings, dataRetentionPeriod: value})}
                  >
                    <SelectTrigger id="retention">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30-days">30 days</SelectItem>
                      <SelectItem value="90-days">90 days</SelectItem>
                      <SelectItem value="6-months">6 months</SelectItem>
                      <SelectItem value="1-year">1 year</SelectItem>
                      <SelectItem value="indefinite">Indefinite</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Data older than this will be automatically deleted
                  </p>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">Allow Data Sharing</h3>
                    <p className="text-xs text-muted-foreground">
                      Allow sharing of alumni data with authorized partners
                    </p>
                  </div>
                  <Switch 
                    checked={privacySettings.allowDataSharing} 
                    onCheckedChange={(checked) => setPrivacySettings({...privacySettings, allowDataSharing: checked})}
                  />
                </div>
              </div>
              
              <Button onClick={handlePrivacySettingsSave} className="w-full">
                Save Privacy Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        {canManageUsers && (
          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default Settings;
