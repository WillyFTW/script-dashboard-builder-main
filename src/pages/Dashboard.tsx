import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScriptTable } from "@/components/ScriptTable";
import { ScriptDialog } from "@/components/ScriptDialog";
import {
  Script,
  Customer,
  categoryIcons,
  categoryLabels,
} from "@/types/script";
import { Plus, Terminal, Package, Shield, Settings, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import hejubaLogo from "@/assets/hejuba-logo.png";
import { useScripts } from "../hooks/useScripts";
import { useCustomers } from "../hooks/useCustomers";
import { add } from "date-fns";

addEventListener("error", (event) => {
  console.log("Global error handler:", event.message, event.error);
});
addEventListener("unhandledrejection", (event) => {
  console.log("Global unhandled rejection handler:", event.reason);
});

// Mock data
const mockCustomers: Customer[] = [
  { name: "Kunde A GmbH" },
  { name: "Kunde B AG" },
  { name: "Kunde C KG" },
  { name: "Kunde D Ltd." },
  { name: "Kunde E Inc." },
];

const mockScripts: Script[] = [
  {
    name: "Windows Update installieren",
    code: `# Windows Updates installieren
Get-Module -Name PSWindowsUpdate -ListAvailable
if (-not (Get-Module -Name PSWindowsUpdate -ListAvailable)) {
    Install-Module -Name PSWindowsUpdate -Force
}
Import-Module PSWindowsUpdate
Get-WindowsUpdate
Install-WindowsUpdate -AcceptAll -AutoReboot`,
    description: "Installiert alle verfügbaren Windows Updates automatisch",
    category: "safety",

    customers: ["1", "2", "3"],
    statuses: ["Auto"],
  },
  {
    name: "Adobe Reader installieren",
    code: `# Adobe Reader automatisch installieren
$url = "https://get.adobe.com/reader/"
$output = "$env:TEMP\\AdobeReader.exe"
Invoke-WebRequest -Uri $url -OutFile $output
Start-Process -FilePath $output -ArgumentList "/S" -Wait
Remove-Item $output`,
    description: "Lädt Adobe Reader herunter und installiert es automatisch",
    category: "software",

    customers: ["1", "4"],
    statuses: ["Global"],
  },
  {
    name: "Netzwerk-Konfiguration prüfen",
    code: `# Netzwerk-Diagnose durchführen
ipconfig /all
nslookup google.com
ping -t 8.8.8.8
Test-NetConnection -ComputerName "google.com" -Port 80`,
    description: "Führt eine umfassende Netzwerk-Diagnose durch",
    category: "configuration",

    customers: ["2", "3", "5"],
    statuses: ["Global"],
  },
  {
    name: "CPU Temperatur überwachen",
    code: `# CPU Temperatur abfragen
# Verwendet WMI zur Temperaturüberwachung
$temperatureData = Get-WmiObject -Namespace "root/WMI" -Class "MSAcpi_ThermalZoneTemperature"
if ($temperatureData) {
    foreach ($temp in $temperatureData) {
        $celsiusTemp = ($temp.CurrentTemperature / 10) - 273.15
        Write-Host "CPU Temperatur: $([math]::Round($celsiusTemp, 2))°C"
    }
} else {
    # Alternative Methode über OpenHardwareMonitor
    Write-Host "Versuche alternative Temperaturabfrage..."
    $sensors = Get-WmiObject -Namespace "root/OpenHardwareMonitor" -Class "Sensor" | Where-Object { $_.SensorType -eq "Temperature" -and $_.Name -like "*CPU*" }
    if ($sensors) {
        foreach ($sensor in $sensors) {
            Write-Host "$($sensor.Name): $($sensor.Value)°C"
        }
    } else {
        Write-Host "WARNUNG: Keine Temperatursensoren gefunden. Möglicherweise sind spezielle Treiber erforderlich."
    }
}`,
    description:
      "Überwacht die CPU-Temperatur und gibt Warnungen bei kritischen Werten aus",
    category: "command",
    statuses: ["Global"],
    customers: ["3", "5"],
  },
];

export const Dashboard = () => {
  const {
    scripts,
    loading,
    error,
    fetchScripts,
    deleteScript,
    createScript,
    updateScript,
  } = useScripts();

  const {
    customers,
    loading: loadingCustomers,
    error: errorCustomers,
  } = useCustomers();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingScript, setEditingScript] = useState<Script | undefined>();
  const { toast } = useToast();

  const handleEdit = async (script: Script) => {
    setEditingScript(script);
    setIsDialogOpen(true);
  };

  const handleDelete = async (scriptToDelete: Script) => {
    deleteScript(scriptToDelete.name);
  };

  const handleSave = async (scriptData: Script) => {
    if (editingScript) {
      // Update existing script
      updateScript(editingScript.name, scriptData);
    } else {
      // Create new script
      createScript(scriptData);
    }
    setEditingScript(undefined);
  };

  const handleNewScript = () => {
    setEditingScript(undefined);
    setIsDialogOpen(true);
  };

  const getStatistics = () => {
    const totalScripts = scripts.length;
    const globalScripts = scripts.filter((s) => s.isGlobal).length;
    const autoEnrollmentScripts = scripts.filter(
      (s) => s.autoEnrollment
    ).length;
    const categories = scripts.reduce((acc, script) => {
      acc[script.category] = (acc[script.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalScripts,
      globalScripts,
      autoEnrollmentScripts,
      categories,
    };
  };

  const stats = getStatistics();

  return (
    <div className="min-h-screen bg-background">
      {/* Header with gradient background */}
      <div className="bg-gradient-primary text-white px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <img src={hejubaLogo} alt="HEJUBA" className="h-12 w-auto" />
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  <Terminal className="h-8 w-8" />
                  PowerShell Script Management Dashboard
                </h1>
                <p className="text-white/80 mt-1">
                  Verwalten Sie Ihre PowerShell-Skripte zentral und effizient
                </p>
              </div>
            </div>
            <Button
              onClick={handleNewScript}
              variant="outline"
              className="border-white/20 bg-white/10 text-white hover:bg-white/20"
            >
              <Plus className="h-4 w-4 mr-2" />
              Neues Skript
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card border-border shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Gesamt Skripte
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Terminal className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold text-foreground">
                  {stats.totalScripts}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Globale Skripte
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-accent" />
                <span className="text-2xl font-bold text-foreground">
                  {stats.globalScripts}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Auto Enrollment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-success" />
                <span className="text-2xl font-bold text-foreground">
                  {stats.autoEnrollmentScripts}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Aktive Kunden
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-warning" />
                <span className="text-2xl font-bold text-foreground">
                  {customers.length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Table */}
        <ScriptTable
          scripts={scripts}
          customers={customers}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {/* Script Dialog */}
        <ScriptDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          script={editingScript}
          customers={customers}
          onSave={handleSave}
        />
      </div>
    </div>
  );
};
