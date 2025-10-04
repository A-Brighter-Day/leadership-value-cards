import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Submission } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  ArrowLeft,
  Download,
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

const AdminSubmissions = () => {
  const { toast } = useToast();
  const [selectedCompanyCode, setSelectedCompanyCode] = useState<string>("all");

  // Fetch all submissions
  const {
    data: submissions = [],
    isLoading: submissionsLoading,
    error: submissionsError,
  } = useQuery<Submission[]>({
    queryKey: ["/api/submissions"],
    throwOnError: false,
  });

  // Fetch company codes
  const {
    data: companyCodes = [],
    isLoading: companyCodesLoading,
  } = useQuery<string[]>({
    queryKey: ["/api/submissions/company-codes"],
    throwOnError: false,
  });

  // Filter submissions by company code
  const filteredSubmissions = selectedCompanyCode === "all" 
    ? submissions 
    : submissions.filter(sub => sub.companyCode === selectedCompanyCode);

  const handleExport = async () => {
    try {
      const url = selectedCompanyCode === "all" 
        ? "/api/submissions/export"
        : `/api/submissions/export?companyCode=${selectedCompanyCode}`;
      
      const response = await apiRequest("GET", url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `submissions${selectedCompanyCode !== 'all' ? `_${selectedCompanyCode}` : ''}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      toast({
        title: "Export Successful",
        description: "CSV file has been downloaded.",
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: "Could not export submissions. Please try again.",
        variant: "destructive",
      });
    }
  };


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="mb-4">
            <Link href="/admin">
                <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-primary">
              Submissions Report
            </h1>
            <p className="text-muted-foreground">
              View and export submissions
            </p>
          </div>
        </div>

        {/* Filters and Export */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters & Export</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">
                  Filter by Company Code
                </label>
                <Select value={selectedCompanyCode} onValueChange={setSelectedCompanyCode}>
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <SelectValue className="p-20" placeholder="Select company code" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Submissions</SelectItem>
                    {companyCodes.map((code) => (
                      <SelectItem key={code} value={code}>
                        {code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleExport} className="flex items-center">
                  <Download className="h-4 w-4" />
                  Export CSV
                </Button>
              </div>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              Showing {filteredSubmissions.length} submission{filteredSubmissions.length !== 1 ? 's' : ''}
              {selectedCompanyCode !== 'all' && ` for company code "${selectedCompanyCode}"`}
            </div>
          </CardContent>
        </Card>

        {/* Submissions Table */}
        {submissionsLoading ? (
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-slate-100 rounded w-3/4 mb-1"></div>
                    <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : submissionsError ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-destructive">
                <h3 className="text-lg font-medium mb-2">Error Loading Submissions</h3>
                <p>Could not load submissions. Please try again later.</p>
              </div>
            </CardContent>
          </Card>
        ) : filteredSubmissions.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-muted-foreground">
                <h3 className="text-lg font-medium mb-2">No Submissions Found</h3>
                <p>
                  {selectedCompanyCode === 'all' 
                    ? 'No submissions have been recorded yet.'
                    : `No submissions found for company code "${selectedCompanyCode}".`
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Company Code</TableHead>
                    <TableHead>Core Values</TableHead>
                    <TableHead>Date Submitted</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubmissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell>
                        {submission.name}
                      </TableCell>
                      <TableCell className="">
                        {submission.email}
                      </TableCell>
                      <TableCell>
                        {submission.companyCode}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="text-sm">
                          {Array.isArray(submission.coreValues) && submission.coreValues.length > 0 ? (
                            <span className="">
                              {submission.coreValues.join(', ')}
                            </span>
                          ) : (
                            <span className="text-muted-foreground italic">No values</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(submission.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default AdminSubmissions;
