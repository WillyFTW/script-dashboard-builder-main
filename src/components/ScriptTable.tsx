import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ColumnFilter } from "@/components/ColumnFilter";
import {
  Script,
  Customer,
  categoryLabels,
  categoryIcons,
} from "@/types/script";
import {
  Edit,
  Trash2,
  Search,
  Terminal,
  Users,
  Globe,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";

interface ScriptTableProps {
  scripts: Script[];
  customers: Customer[];
  loading: boolean;
  onEdit: (script: Script) => void;
  onDelete: (script: Script) => void;
}

export const ScriptTable = ({
  scripts,
  customers,
  loading,
  onEdit,
  onDelete,
}: ScriptTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [customerFilter, setCustomerFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);

  const getCustomerNames = (customersOfScript: string[] | null) => {
    if (!customersOfScript || customersOfScript.length === 0) {
      return "Keine Kunden";
    } else {
      return customersOfScript?.join(", ") || "Keine Kunden";
    }
  };

  const filteredScripts = scripts.filter((script) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      (script.name?.toLowerCase() || "").includes(searchLower) ||
      (script.description?.toLowerCase() || "").includes(searchLower) ||
      (script.code?.toLowerCase() || "").includes(searchLower) ||
      getCustomerNames(script.customers).toLowerCase().includes(searchLower) ||
      (categoryLabels[script.category]?.toLowerCase() || "").includes(
        searchLower
      );

    const matchesCategory =
      categoryFilter.length === 0 || categoryFilter.includes(script.category);

    const matchesCustomer =
      customerFilter.length === 0 ||
      (script.customers || []).some((customerName) =>
        customerFilter.includes(customerName)
      );

    const scriptStatus = script.statuses || [];

    const matchesStatus =
      statusFilter.length === 0 ||
      statusFilter.some((status) => scriptStatus.includes(status));

    return matchesSearch && matchesCategory && matchesCustomer && matchesStatus;
  });

  // Generate filter options
  const categoryOptions = Object.entries(categoryLabels).map(
    ([key, label]) => ({
      value: key,
      label,
      count: scripts.filter((s) => s.category === key).length,
    })
  );

  const customerOptions = customers.map((customer) => {
    return {
      value: customer.name,
      label: customer.name,
      count: scripts.filter((s) => s.customers.includes(customer.name)).length,
    };
  });

  const statusOptions = [
    {
      value: "Global",
      label: "Global",
      count: scripts.filter((s) => s.statuses.includes("Global")).length,
    },
    {
      value: "Auto",
      label: "Auto Enrollment",
      count: scripts.filter((s) => s.statuses.includes("Auto")).length,
    },
  ];

  const CategoryIcon = ({ category }: { category: Script["category"] }) => {
    const Icon = categoryIcons[category];
    return <Icon className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
        <h3 className="text-lg font-medium text-foreground mb-2">
          Lade Skripte...
        </h3>
      </div>
    );
  }

  return (
    <Card className="bg-gradient-secondary border-border shadow-card">
      <div className="p-6">
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Skripte durchsuchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background/50 border-border"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredScripts.length} von {scripts.length} Skripten
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <ColumnFilter
              options={categoryOptions}
              selectedValues={categoryFilter}
              onSelectionChange={setCategoryFilter}
              title="Kategorie"
              searchPlaceholder="Kategorien suchen..."
            />
            <ColumnFilter
              options={customerOptions}
              selectedValues={customerFilter}
              onSelectionChange={setCustomerFilter}
              title="Kunden"
              searchPlaceholder="Kunden suchen..."
            />
            <ColumnFilter
              options={statusOptions}
              selectedValues={statusFilter}
              onSelectionChange={setStatusFilter}
              title="Status"
              searchPlaceholder="Status suchen..."
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-muted/50">
                <TableHead className="text-foreground">Name</TableHead>
                <TableHead className="text-foreground">Kategorie</TableHead>
                <TableHead className="text-foreground">Kunden</TableHead>
                <TableHead className="text-foreground">Status</TableHead>
                <TableHead className="text-foreground">Beschreibung</TableHead>
                <TableHead className="text-foreground w-[120px]">
                  Aktionen
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredScripts.map((script) => (
                <TableRow
                  key={script.name}
                  className="border-border hover:bg-muted/30 transition-colors"
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <CategoryIcon category={script.category} />
                      <Link
                        to={`/script/${script.name}`} //previously was script.id
                        className="text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline"
                      >
                        {script.name}
                      </Link>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-secondary/50">
                      {categoryLabels[script.category]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {script.customers.length > 0 ? (
                        script.customers.map((customer) => {
                          return customer ? (
                            <Badge
                              key={customer}
                              variant="tag"
                              className="text-xs"
                            >
                              <Users className="h-3 w-3 mr-1" />
                              {customer}
                            </Badge>
                          ) : null;
                        })
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          Keine Kunden
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {script.statuses.includes("Global") && (
                        <Badge
                          variant="outline"
                          className="w-fit bg-accent/20 text-accent-foreground border-accent/50"
                        >
                          <Globe className="h-3 w-3 mr-1" />
                          Global
                        </Badge>
                      )}
                      {script.statuses.includes("Auto") && (
                        <Badge
                          variant="outline"
                          className="w-fit bg-primary/20 text-primary border-primary/50"
                        >
                          <Zap className="h-3 w-3 mr-1" />
                          Auto
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[300px] truncate text-sm text-muted-foreground">
                      {script.description || "Keine Beschreibung"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(script)}
                        className="bg-background/50 border-border hover:bg-accent/50"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(script)}
                        className="bg-background/50 border-border hover:bg-destructive/50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredScripts.length === 0 && (
            <div className="text-center py-12">
              <Terminal className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Keine Skripte gefunden
              </h3>
              <p className="text-muted-foreground">
                {searchTerm
                  ? "Keine Skripte entsprechen Ihrer Suche."
                  : "Noch keine PowerShell-Skripte vorhanden."}
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
