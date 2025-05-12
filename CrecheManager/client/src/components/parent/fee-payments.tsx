import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CreditCard, Download, Loader2, Receipt } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function FeePayments() {
  const [selectedFee, setSelectedFee] = useState<any>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  
  const { toast } = useToast();

  const { data: fees, isLoading } = useQuery({
    queryKey: ["/api/fees"],
  });

  const payFeeMutation = useMutation({
    mutationFn: async (feeId: number) => {
      const res = await apiRequest("PATCH", `/api/fees/${feeId}`, { status: "paid" });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Payment Successful",
        description: "Your payment has been processed successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/fees"] });
      setPaymentDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handlePay = (fee: any) => {
    setSelectedFee(fee);
    setPaymentDialogOpen(true);
  };

  const handleViewReceipt = (fee: any) => {
    setSelectedFee(fee);
    setReceiptDialogOpen(true);
  };

  const handleConfirmPayment = () => {
    if (selectedFee) {
      payFeeMutation.mutate(selectedFee.id);
    }
  };

  const filteredFees = fees?.filter((fee: any) => {
    if (statusFilter === "all") return true;
    return fee.status === statusFilter;
  });

  const getFeeStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-500">Paid</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case "overdue":
        return <Badge className="bg-red-500">Overdue</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Fee Payments</CardTitle>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredFees?.length > 0 ? (
            <div className="rounded-md border">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredFees.map((fee: any) => (
                    <tr key={fee.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {fee.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {fee.studentName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        R{fee.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(fee.dueDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getFeeStatusBadge(fee.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {fee.status === "paid" ? (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleViewReceipt(fee)}
                            className="flex items-center"
                          >
                            <Receipt className="h-4 w-4 mr-1" />
                            Receipt
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            onClick={() => handlePay(fee)}
                            className="flex items-center"
                          >
                            <CreditCard className="h-4 w-4 mr-1" />
                            Pay Now
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No fee records match the selected filter.
            </div>
          )}

          {filteredFees?.some((fee: any) => fee.status === "overdue") && (
            <Alert variant="destructive" className="mt-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Payment Overdue</AlertTitle>
              <AlertDescription>
                You have overdue fee payments. Please make payment as soon as possible to avoid any disruption in services.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Make Payment</DialogTitle>
            <DialogDescription>
              Complete your payment for {selectedFee?.description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-sm font-medium">Student:</span>
              <span className="text-sm">{selectedFee?.studentName}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-sm font-medium">Description:</span>
              <span className="text-sm">{selectedFee?.description}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-sm font-medium">Due Date:</span>
              <span className="text-sm">{selectedFee && new Date(selectedFee.dueDate).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total Amount:</span>
              <span>R{selectedFee?.amount.toFixed(2)}</span>
            </div>
            
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Demo Mode</AlertTitle>
              <AlertDescription>
                This is a demonstration. In a production environment, this would connect to a payment processor.
              </AlertDescription>
            </Alert>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setPaymentDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmPayment}
              disabled={payFeeMutation.isPending}
            >
              {payFeeMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Pay R{selectedFee?.amount.toFixed(2)}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog open={receiptDialogOpen} onOpenChange={setReceiptDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payment Receipt</DialogTitle>
            <DialogDescription>
              Details of your payment
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold">Creche Management System</h3>
              <span className="text-sm text-gray-500">Receipt #{selectedFee?.id}</span>
            </div>
            
            <div className="border-t border-b py-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Description:</span>
                <span className="text-sm">{selectedFee?.description}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Student:</span>
                <span className="text-sm">{selectedFee?.studentName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Payment Date:</span>
                <span className="text-sm">{selectedFee?.paidDate && new Date(selectedFee.paidDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Amount Paid:</span>
                <span className="text-sm font-bold">R{selectedFee?.amount.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="text-center text-sm text-gray-500">
              <p>Thank you for your payment.</p>
              <p>This receipt serves as proof of payment for the services described above.</p>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setReceiptDialogOpen(false)}
            >
              Close
            </Button>
            <Button className="flex items-center">
              <Download className="mr-2 h-4 w-4" />
              Download Receipt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
