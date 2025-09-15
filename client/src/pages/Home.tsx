import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { GraduationCap, Plus, FileText, Calendar, Search } from "lucide-react";
import { WeeklyReport } from "@shared/schema";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function Home() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();

  const { data: reports, isLoading: reportsLoading } = useQuery<WeeklyReport[]>({
    queryKey: ["/api/weekly-reports"],
    enabled: isAuthenticated,
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Non autorisé",
        description: "Vous êtes déconnecté. Reconnexion en cours...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <GraduationCap className="mx-auto h-12 w-12 text-primary animate-pulse mb-4" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <GraduationCap className="text-primary text-2xl" />
              <h1 className="text-xl font-semibold text-foreground">Suivi Pédagogique</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground" data-testid="text-username">
                {(user as any)?.firstName || (user as any)?.email || "Utilisateur"}
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                data-testid="button-logout"
              >
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Tableau de Bord
          </h2>
          <p className="text-muted-foreground">
            Gérez les rapports de suivi pédagogique hebdomadaire de vos élèves.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Plus className="text-primary" />
                <span>Nouveau Rapport</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 text-sm">
                Créer un nouveau rapport de suivi hebdomadaire
              </p>
              <Link href="/weekly-report">
                <Button className="w-full" data-testid="button-new-report">
                  <Plus className="mr-2 h-4 w-4" />
                  Créer un rapport
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <FileText className="text-primary" />
                <span>Rapports Total</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground mb-2" data-testid="text-total-reports">
                {reports?.length || 0}
              </div>
              <p className="text-muted-foreground text-sm">
                Rapports créés au total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Calendar className="text-primary" />
                <span>Cette Semaine</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground mb-2">
                {reports?.filter(report => {
                  const reportDate = new Date(report.createdAt!);
                  const now = new Date();
                  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                  return reportDate >= weekAgo;
                }).length || 0}
              </div>
              <p className="text-muted-foreground text-sm">
                Rapports créés cette semaine
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="text-primary" />
                <span>Rapports Récents</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reportsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : !reports || reports.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Aucun rapport encore
                </h3>
                <p className="text-muted-foreground mb-4">
                  Commencez par créer votre premier rapport de suivi pédagogique.
                </p>
                <Link href="/weekly-report">
                  <Button data-testid="button-create-first-report">
                    <Plus className="mr-2 h-4 w-4" />
                    Créer le premier rapport
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.slice(0, 5).map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    data-testid={`card-report-${report.id}`}
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">
                        {report.studentFirstName} {report.studentLastName}
                      </h4>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Classe: {report.studentClass}</p>
                        <p>Semaine du {report.weekStartDate} au {report.weekEndDate}</p>
                        <p>
                          Créé le {report.createdAt ? format(new Date(report.createdAt), 'PPP', { locale: fr }) : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Link href={`/weekly-report/${report.id}`}>
                        <Button variant="outline" size="sm" data-testid={`button-edit-${report.id}`}>
                          Modifier
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
                
                {reports.length > 5 && (
                  <div className="text-center pt-4">
                    <p className="text-muted-foreground">
                      Et {reports.length - 5} autres rapports...
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
