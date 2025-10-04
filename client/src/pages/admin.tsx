import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { LeadershipValue } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  LogOut,
  PencilIcon,
  PlusIcon,
  RotateCcw,
  TrashIcon,
  BarChart3, // Add this import
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";

const AdminDashboard = () => {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState<LeadershipValue | null>(
    null
  );
  const [formData, setFormData] = useState({
    value: "",
    description: "",
  });

  // Fetch all leadership values
  const {
    data: leadershipValues = [],
    isLoading,
    error,
  } = useQuery<LeadershipValue[]>({
    queryKey: ["/api/leadership-values"],
    throwOnError: false,
  });

  // Add leadership value mutation
  const addMutation = useMutation({
    mutationFn: async (newValue: { value: string; description: string }) => {
      return apiRequest("POST", "/api/leadership-values", newValue);
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Leadership value added successfully",
      });
      setIsAddDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/leadership-values"] });
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add leadership value",
        variant: "destructive",
      });
    },
  });

  // Edit leadership value mutation
  const editMutation = useMutation({
    mutationFn: async (updatedValue: {
      id: number;
      value: string;
      description: string;
    }) => {
      return apiRequest("PUT", `/api/leadership-values/${updatedValue.id}`, {
        value: updatedValue.value,
        description: updatedValue.description,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Leadership value updated successfully",
      });
      setIsEditDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/leadership-values"] });
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update leadership value",
        variant: "destructive",
      });
    },
  });

  // Delete leadership value mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/leadership-values/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Leadership value deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/leadership-values"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete leadership value",
        variant: "destructive",
      });
    },
  });

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle adding a new leadership value
  const handleAddValue = (e: React.FormEvent) => {
    e.preventDefault();
    addMutation.mutate(formData);
  };

  // Handle editing a leadership value
  const handleEditValue = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedValue) {
      editMutation.mutate({
        id: selectedValue.id,
        value: formData.value,
        description: formData.description,
      });
    }
  };

  // Open edit dialog with selected value data
  const openEditDialog = (value: LeadershipValue) => {
    setSelectedValue(value);
    setFormData({
      value: value.value,
      description: value.description,
    });
    setIsEditDialogOpen(true);
  };

  // Handle deleting a leadership value
  const handleDeleteValue = (id: number) => {
    if (
      window.confirm("Are you sure you want to delete this leadership value?")
    ) {
      deleteMutation.mutate(id);
    }
  };

  // Reset form fields
  const resetForm = () => {
    setFormData({
      value: "",
      description: "",
    });
    setSelectedValue(null);
  };

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        setLocation("/");
      }
    });
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6 gap-1">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-primary">
              Admin <br className="block sm:hidden" /> Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage leadership value cards
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Link href="/">
              <Button variant="outline" size="sm">
                <RotateCcw className="h-4 w-4" />
                Back to App
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className="flex items-center justify-start"
            >
              <LogOut className="h-4 w-4" />
              {logoutMutation.isPending ? "Logging out..." : "Logout"}
            </Button>
          </div>
        </div>

        <div className="flex gap-3">
          <Link href="/admin/submissions">
            <Button variant="outline" size="sm">
              <BarChart3 className="h-4 w-4" />
              View Submissions
            </Button>
          </Link>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger className="" asChild>
              <Button size="sm">
                <PlusIcon className="h-4 w-4" />
                Add New Value
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Leadership Value</DialogTitle>
                <DialogDescription>
                  Create a new leadership value card to be used in the
                  assessment.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddValue}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label htmlFor="value" className="text-sm font-medium">
                      Value Name
                    </label>
                    <Input
                      id="value"
                      name="value"
                      placeholder="e.g., Integrity"
                      value={formData.value}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="description"
                      className="text-sm font-medium"
                    >
                      Description
                    </label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Enter description of this leadership value"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      rows={4}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={addMutation.isPending}>
                    {addMutation.isPending ? "Adding..." : "Add Value"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Separator className="my-6" />

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(9)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <div className="p-4 pb-3">
                    <div className="h-6 bg-slate-200 rounded w-1/3 mb-1"></div>
                  </div>
                  <div className="px-4 py-3">
                    <div className="h-4 bg-slate-100 rounded w-full mb-2"></div>
                    <div className="h-4 bg-slate-100 rounded w-2/3"></div>
                  </div>
                  <div className="bg-muted/10 p-3 flex justify-end space-x-2">
                    <div className="h-8 w-16 bg-slate-200 rounded"></div>
                    <div className="h-8 w-20 bg-slate-200 rounded"></div>
                  </div>
                </div>
              ))}
          </div>
        ) : error ? (
          <div className="bg-destructive/10 text-destructive p-6 rounded-lg border border-destructive/20 shadow-md max-w-2xl mx-auto">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-destructive"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-destructive">
                  Database Connection Error
                </h3>
                <div className="mt-2 text-sm text-destructive/80">
                  <p>
                    We were unable to load the leadership values from the
                    database.
                  </p>
                  <p className="mt-1">
                    This could be due to a temporary issue with the database
                    connection or server.
                  </p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => window.location.reload()}
                    type="button"
                    className="inline-flex items-center px-3 py-2 border border-destructive text-sm leading-4 font-medium rounded-md text-destructive bg-destructive/10 hover:bg-destructive/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-destructive"
                  >
                    <svg
                      className="-ml-0.5 mr-2 h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 12a9 9 0 0 1-9 9c-2.2 0-4.3-.8-6-2.2L3 21"></path>
                      <path d="M21 3v9l-9 9c-1.7-1.4-3-3.2-3.7-5.3"></path>
                      <path d="M3 12a9 9 0 0 1 17.8-2"></path>
                    </svg>
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {leadershipValues.map((value: LeadershipValue) => (
              <Card key={value.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{value.value}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {value.description}
                  </p>
                </CardContent>
                <CardFooter className="bg-muted/10 flex justify-end pt-3 space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(value)}
                  >
                    <PencilIcon className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteValue(value.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <TrashIcon className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Leadership Value</DialogTitle>
            <DialogDescription>
              Update the details of this leadership value card.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditValue}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="edit-value" className="text-sm font-medium">
                  Value Name
                </label>
                <Input
                  id="edit-value"
                  name="value"
                  placeholder="e.g., Integrity"
                  value={formData.value}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="edit-description"
                  className="text-sm font-medium"
                >
                  Description
                </label>
                <Textarea
                  id="edit-description"
                  name="description"
                  placeholder="Enter description of this leadership value"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={editMutation.isPending}>
                {editMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default AdminDashboard;
