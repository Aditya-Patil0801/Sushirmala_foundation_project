import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-trust flex items-center justify-center p-4">
      <Card className="shadow-prosperity border-0 max-w-md w-full">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-prosperity/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-prosperity">404</span>
          </div>
          <CardTitle className="text-2xl text-prosperity">Page Not Found</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              variant="prosperity" 
              onClick={() => window.history.back()}
              className="flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
            <Button 
              variant="prosperity-outline" 
              onClick={() => window.location.href = '/'}
              className="flex items-center"
            >
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
